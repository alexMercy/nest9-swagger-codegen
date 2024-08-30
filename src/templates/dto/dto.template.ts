import { allOfDereference } from '@templates/dto/allOfdereference'
import {
    classValidators,
    plainToApiProperties,
    plainToValidatorProperties,
    ValidatorsProps,
} from '@templates/dto/plainToProp'
import { suffixes } from '@utils/constants'
import { generateTsFile } from '@utils/generateTsFile'
import { getEnums } from '@utils/getEnums'
import { getFileImports } from '@utils/getFileImports'
import * as _ from 'lodash'

class DtoFileFactory {
    private enums: Record<string, any> = {}

    private imports: Record<string, Set<string>> = {
        ['class-validator']: new Set(),
        ['@nestjs/swagger']: new Set(),
    }

    private rootPath: string

    private serviceName: string

    private dtos: string[]

    constructor(
        rootPath: string,
        serviceName: string,
        dtoSchemas: [string, any][],
    ) {
        this.rootPath = rootPath
        this.serviceName = serviceName
        this.dtos = dtoSchemas.map(([title, data]) =>
            this.createDto(title, data),
        )
    }

    private createDto = (title: string, data: any) => {
        const props = this.getProps(data).join('\n')

        return `
      export class ${title} {
        ${props}
      }`
    }

    private getProps = (data: any) => {
        const { properties, required: requireds } = data

        return Object.entries(properties).map(([title, data]) => {
            const required = requireds.includes(title) ? '' : '?'

            const apiProperty = this.getApiProperties(data)

            const classValidatorProps = this.getClassValidatorProperties(data)

            const propName = `${title}${required}`

            const propType = this.getType(data, title)

            return `
      ${classValidatorProps}
      ${apiProperty}
      ${propName}: ${propType}`
        })
    }

    private getApiProperties = (plainProps?: any): string => {
        if (!plainProps) return ''

        const processedApiProps = plainToApiProperties(plainProps)
        if (!processedApiProps) return ''

        this.imports['@nestjs/swagger'].add('ApiProperty')

        const props = Object.entries(processedApiProps)
            .map(
                ([key, value]) =>
                    `${key}: ${value === `${value}` ? `'${value}'` : value}`,
            )
            .join(', ')

        return `@ApiProperty({${props}})`
    }

    private getClassValidatorProperties = (plainProps?: any) => {
        if (!plainProps) return ''

        const processedValidatorProps = plainToValidatorProperties(plainProps)
        if (!processedValidatorProps) return ''

        const props = Object.entries(processedValidatorProps).map(
            ([key, value]) => {
                const validator = classValidators[key as ValidatorsProps]

                const prop = validator(value)

                const importName = prop.match(/^@(.+)\(/gi)?.[0]

                importName &&
                    this.imports['class-validator'].add(importName.slice(1, -1))

                return prop
            },
        )

        return props.join('\n')
    }

    private getType = (data: any, title: string) => {
        if (!data.type) throw new Error(`No type in field ${title}`)
        if (data.type === 'array') {
            const nestedType = data.items.type

            const isComplexType =
                nestedType === 'object' || nestedType === 'array'

            return `${isComplexType ? this.getType(data.items, title) : nestedType}[]`
        }

        if (data.type === 'object') {
            if (!data.refType)
                throw new Error(
                    "don't use no ref object props. If you need use object prop, that create component and use him with $ref",
                )

            return data.refType
        }

        if (data.enum) {
            const enumName = `${title}Enum`
            this.enums[enumName] = data.enum
            return enumName
        }

        return data.type
    }

    generateDtoFile = () => {
        const fileImports = getFileImports(this.imports)

        const tDtoStructure = _.compact([
            fileImports,
            getEnums(this.enums),
            this.dtos.join('\n\n'),
        ]).join('\n\n')

        generateTsFile(
            this.rootPath,
            this.serviceName,
            suffixes.DTO,
            tDtoStructure,
        )
    }
}

export const createDtos = (
    api: any,
    rootPath: string,
    serviceName: string,
    dtos: string[],
) => {
    const filteredComponents: [string, any][] = dtos.map((dto) => [
        dto,
        allOfDereference(api.components.schemas[dto]),
    ])

    const dtosClass = new DtoFileFactory(
        rootPath,
        serviceName,
        filteredComponents,
    )

    dtosClass.generateDtoFile()
}
