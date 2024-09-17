import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import $RefParser, { type JSONSchema } from '@apidevtools/json-schema-ref-parser'

export type JSONSchemaWithOriginalRef = JSONSchema & {
    $originalRef?: string
    refType?: string
}

function addRefName(schema: JSONSchemaWithOriginalRef, refName: string) {
    if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
        schema['$originalRef'] = refName
        const split = refName.split('/')
        schema['refType'] = split[split.length - 1]
    }
}

function traverse(schema: JSONSchemaWithOriginalRef) {
    if (schema && typeof schema === 'object') {
        for (const key in schema) {
            if (key === '$ref' && typeof schema[key] === 'string') {
                const refName = schema[key]
                addRefName(schema, refName)
            } else {
                traverse(schema[key as keyof JSONSchemaWithOriginalRef])
            }
        }
    }
}

export async function dereferenceWithRefNames(swaggerDoc: any) {
    const parser = new $RefParser()

    try {
        const schema = await parser.parse(swaggerDoc)
        traverse(schema)

        return parser.dereference(schema) as Promise<SwaggerApi>
    } catch (err) {
        console.error('Ошибка при разрешении ссылок:', err)
    }
}
