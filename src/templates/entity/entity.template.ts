import { allOfDereference } from '@templates/lib'
import { generateTsFile } from '@utils/generateTsFile'
import { getFileImports } from '@utils/getFileImports'
import { suffixes } from '@utils/constants'
import * as _ from 'lodash'

class EntityFileFactory {
    private enums: Record<string, any> = {}

    private imports: Record<string, Set<string>> = {
        ['typeorm']: new Set(),
        ['@nestjs/swagger']: new Set(),
    }

    private rootPath: string

    private serviceName: string

    private entities: { title: string; code: string }[]

    constructor(rootPath: string, serviceName: string, entitySchemas: [string, any][]) {
        this.rootPath = rootPath
        this.serviceName = serviceName
        this.imports['typeorm'].add('Column').add('Entity').add('PrimaryGeneratedColumn')
        this.imports['@nestjs/swagger'].add('OmitType')

        this.entities = entitySchemas.map(([title, data]) => ({
            title,
            code: this.createEntityClass(title, data),
        }))
    }

    private createEntityClass = (title: string, data: any) => {
        const props = this.getProps(data).join('\n')

        return `
      @Entity({ name: '${title}' })
      export class _${title} {
        // FIXME
        // WARNING: Each entity MUST have a primary column.
        // Please select an entity attribute to be primary key and
        // mark it with @PrimaryGeneratedColumn('_attr_name_') macro

        ${props}
      }

`
    }

    private getProps = (data: any) => {
        const { properties, required: requireds } = data

        return Object.entries(properties).map(([title, data]) => {
            const required = requireds.includes(title) ? '' : '?'
            const propName = `${title}${required}`
            const propType = this.getType(data, title)

            return `
      @Column()
      ${propName}: ${propType}`
        })
    }

    private getType = (data: any, title: string) => {
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

            return data.refType
        }

        if (data.enum) {
            const enumName = `${title}Enum`
            this.enums[enumName] = data.enum
            return enumName
        }

        return data.type
    }

    generateEntityFiles = () => {
        this.entities.forEach((entity) => {
            const fileImports = getFileImports(this.imports)

            const tEntityStructure = _.compact([fileImports, entity.code]).join('\n\n')

            generateTsFile(
                this.rootPath,
                this.serviceName,
                `${entity.title.toLowerCase()}.${suffixes.ENTITY}.${suffixes.DRAFT}`,
                tEntityStructure,
            )
        })
    }
}

export const generateEntities = (api: any, rootPath: string, serviceName: string, entities: string[]) => {
    const filteredComponents: [string, any][] = entities.map((entity) => [
        entity,
        allOfDereference(api.components.schemas[entity]),
    ])

    // @TODO probably component-arrays need to be excluded from processing. HOW??
    // const filteredObjects = _.filter(filteredComponents, [[{ 'type': 'object' }]])
    // console.log('filtered objects')
    // console.log(filteredObjects)
    const entityClass = new EntityFileFactory(rootPath, serviceName, filteredComponents)

    entityClass.generateEntityFiles()
}
