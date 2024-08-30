import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { allOfDereference } from '@templates/dto/allOfDereference'
import { classValidators, plainToProp, ValidatorsProps } from '@templates/dto/plainToProp'
import { generateTsFile } from '@utils/generateTsFile'
import { getEnums } from '@utils/getEnums'
import { getFileImports } from '@utils/getFileImports'
import { getNameWithoutSuffix } from '@utils/isSuffix'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'

class DtoFileFactory {
    enums: Record<string, any> = {}

    private imports: Record<string, Set<string>> = {
        ['class-validator']: new Set(),
        ['@nestjs/swagger']: new Set(),
        ['./enums']: new Set(),
    }

    private dtos: string[]

    constructor(
        private rootPath: string,
        private serviceName: string,
        dtoSchemas: [string, any][],
    ) {
        this.dtos = dtoSchemas.map(([title, data]) => this.createDto(title, data))
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
            const apiPlainedProps = plainToProp(data)

            const apiProperty = this.getApiProperties(apiPlainedProps)

            const classValidatorProps = this.getClassValidatorProperties(apiPlainedProps)

            const propName = `${title}${required}`

            const propType = this.getType(data, title)

            return `
      ${classValidatorProps}
      ${apiProperty}
      ${propName}: ${propType}`
        })
    }

    private getApiProperties = (apiPlainedProps?: any): string => {
        if (!apiPlainedProps) return ''

        this.imports['@nestjs/swagger'].add('ApiProperty')

        const props = Object.entries(apiPlainedProps)
            .map(([key, value]) => `${key}: ${value === `${value}` ? `'${value}'` : value}`)
            .join(', ')

        return `@ApiProperty({${props}})`
    }

    private getClassValidatorProperties = (apiPlainedProps?: any) => {
        if (!apiPlainedProps) return ''

        const props = Object.entries(apiPlainedProps).map(([key, value]) => {
            const validator = classValidators[key as ValidatorsProps]

            const prop = validator(value)

            const importName = prop.match(/^@(.+)\(/gi)?.[0]

            importName && this.imports['class-validator'].add(importName.slice(1, -1))

            return prop
        })

        return props.join('\n')
    }

    private getType = (data: any, title: string) => {
        if (!data.type) throw new Error(`No type in field ${title}`)
        if (data.type === 'array') {
            const nestedType = data.items.type

            const isComplexType = nestedType === 'object' || nestedType === 'array'

            return `${isComplexType ? this.getType(data.items, title) : nestedType}[]`
        }

        if (data.type === 'object') {
            if (!data.refType)
                throw new Error(
                    "don't use no ref object props. If you need use object prop, that create component and use him with $ref",
                )

            const key: string = getNameWithoutSuffix(data.refType)

            if (!this.imports[`./${key}.dto`]) {
                this.imports[`./${key}.dto`] = new Set()
            }
            this.imports[`./${key}.dto`].add(data.refType)
            return data.refType
        }

        if (data.enum) {
            const enumName = `${title}Enum`
            this.enums[enumName] = data.enum
            this.imports['./enums'].add(enumName)
            return enumName
        }

        return data.type
    }

    generateDtoFile = () => {
        const fileImports = getFileImports(this.imports)

        const tDtoStructure = _.compact([fileImports, this.dtos.join('\n\n')]).join('\n\n')

        generateTsFile(this.rootPath, this.serviceName, 'dto', tDtoStructure, 'models')
    }
}

const getComponentGroups = (api: SwaggerApi) => {
    const groups: Record<string, Set<string>> = {}

    const schemas = Object.keys(api.components.schemas)

    schemas.forEach((title) => {
        const key = getNameWithoutSuffix(title)

        if (!groups[key]) groups[key] = new Set()
        groups[key].add(title)
    })

    return groups
}

export const generateDtos = (api: SwaggerApi, rootPath: string) => {
    const groups = getComponentGroups(api)
    let enums: Record<string, any[]> = {}

    Object.entries(groups).forEach(([title, groupSet]) => {
        const filteredComponents: [string, any][] = [...groupSet].map((dto) => [
            dto,
            allOfDereference(api.components.schemas[dto]),
        ])

        const dtosClass = new DtoFileFactory(rootPath, title.toLowerCase(), filteredComponents)
        enums = { ...enums, ...dtosClass.enums }

        dtosClass.generateDtoFile()
    })

    const enumsFile = getEnums(enums)

    //create index.ts for models
    const indexFile = Object.keys(groups)
        .map((title) => {
            return `export * from "./${title.toLowerCase()}.dto"`
        })
        .join('\n')

    const modelsPath = path.join(rootPath, 'models')
    fs.ensureDirSync(modelsPath)
    const filePath = path.join(modelsPath, 'index.ts')
    fs.writeFileSync(filePath, indexFile)

    const fileEnums = path.join(modelsPath, 'enums.ts')
    fs.writeFileSync(fileEnums, enumsFile)
}
