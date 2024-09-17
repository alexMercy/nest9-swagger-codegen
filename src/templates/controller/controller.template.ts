import { methodNames, suffixes } from '@utils/constants'
import { generateTsFile } from '@utils/generateTsFile'
import { getFileImports } from '@utils/getFileImports'
import { getMappedSwaggerType } from '@utils/getMappedSwaggerType'
import { ParameterWithSchema } from '@coretypes/derived.types'

import * as _ from 'lodash'
import { getOptionalParameterRepresentation } from '@utils/getParameterPropertiesRepresentation'

export interface ControllerConfig {
    serviceName: string
    paths: ControllerPath[]
}

export interface ControllerPath {
    method: string
    path: string
    pathParams?: ParameterWithSchema[]
    queryParams?: ParameterWithSchema[]
    body?: string
    returnType?: string
}

const methodSorts = ['get', 'post', 'put', 'delete']
const methodSortFn = (paths: ControllerPath[]) =>
    [...paths].sort((a, b) => methodSorts.indexOf(a.method) - methodSorts.indexOf(b.method))

class ControllerFileFactory {
    private serviceName: string

    private rootPath: string

    private paths: string

    private controllerFile: string

    private _imports: Record<string, Set<string>> = {
        ['@nestjs/common']: new Set<string>().add('Controller'),
        ['@nestjs/swagger']: new Set<string>().add('ApiTags'),
        ['../models']: new Set<string>(),
        ['crypto']: new Set<string>(),
        // the service and dto are imported inside the constructor
    }

    get imports() {
        return this._imports
    }

    constructor(config: ControllerConfig, rootPath) {
        this.serviceName = config.serviceName
        this.rootPath = rootPath
        this._imports[`./${this.serviceName}.service`] = new Set<string>().add(
            `${_.capitalize(this.serviceName)}Service`,
        )
        this.paths = methodSortFn(config.paths)
            .map((path) => this.addPath({ ...path }))
            .join('\n\n')

        this.generateController()
    }

    private addPath = ({ method, path, pathParams, queryParams, body, returnType }: ControllerPath) => {
        this._imports['@nestjs/common'].add(_.capitalize(method))
        if (body) {
            this._imports['@nestjs/common'].add('Body')
            this._imports['../models'].add(body)
        }
        if (returnType) {
            this._imports['../models'].add(
                returnType.includes('[]') ? returnType.slice(0, returnType.length - 2) : returnType,
            )
        }
        if (pathParams) {
            this._imports['@nestjs/common'].add('Param')

            if (pathParams.some((param) => param.schema.format == 'uuid')) {
                this._imports['crypto'].add('UUID')
            }
        }

        if (queryParams) {
            this._imports['@nestjs/common'].add('Query')
            this._imports['@nestjs/swagger'].add('ApiQuery')

            if (queryParams.some((param) => param.schema.format == 'uuid')) {
                this._imports['crypto'].add('UUID')
            }
        }

        const baseMethodName = methodNames[method.toUpperCase() as keyof typeof methodNames]
        const byParamSuffix = pathParams ? `By${pathParams.map(({ name }) => _.capitalize(name)).join()}` : ''
        const methodName = `${baseMethodName}${byParamSuffix}`

        const pathParamsArgs =
            pathParams
                ?.map((p) => `@Param('${p.name}') ${p.name}: ${getMappedSwaggerType(p.schema.type, p.schema.format)}`)
                .join(', ') ?? ''
        const queryParamsArgs =
            queryParams
                ?.map(
                    (p) =>
                        `@Query('${p.name}') ${p.name}${getOptionalParameterRepresentation(p)}: ${getMappedSwaggerType(p.schema.type, p.schema.format)}`,
                )
                .join(', ') ?? ''
        const methodDecoratorQueryParams =
            queryParams
                ?.map(
                    (p) =>
                        `@ApiQuery({name: "${p.name}", required: ${p.required ? p.required : false}, schema: ${JSON.stringify(p.schema)}}) `,
                )
                .join('\r\n') ?? ''

        const bodyParamsArgs = body ? `@Body() body: ${body}` : ''

        const pathWithoutRoute = this.getPathWithoutFirstRoute(path)

        const methodDecoratorPathParams = pathWithoutRoute ? `'${pathWithoutRoute.replace(/{(\w+)}/g, ':$1')}'` : ''
        const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')
        const serviceParams = _.compact(
            [_.map(pathParams, 'name'), _.map(queryParams, 'name'), body ? 'body' : ''].flat(),
        ).join(', ')

        return `    @${_.capitalize(method)}(${methodDecoratorPathParams})
                    ${methodDecoratorQueryParams}
        ${methodName}(${argsParams}): Promise<${returnType ?? 'void'}> {
            return this.${_.lowerFirst(this.serviceName)}Service.${methodName}(${serviceParams})
        }`
    }

    private getPathWithoutFirstRoute(path: string) {
        const parts = path.split('/').filter(Boolean)

        if (parts.length <= 1) {
            return undefined
        }

        return parts.slice(1).join('/')
    }

    private generateController() {
        const fileImportsAndClass = this.getImportsAndClass()
        this.controllerFile = `
        ${fileImportsAndClass}
        ${this.paths}
    }
        `
    }

    private getImportsAndClass = () => {
        const cServiceName = _.capitalize(this.serviceName)

        return `
            @ApiTags('${this.serviceName}')
            @Controller('${this.serviceName.toLowerCase()}')
            export class ${cServiceName}Controller {
            constructor(private readonly ${_.lowerFirst(this.serviceName)}Service: ${cServiceName}Service) {}
        `
    }

    generateControllerFile() {
        const fileImports = getFileImports(this.imports)

        const tDtoStructure = _.compact([fileImports, this.controllerFile]).join('\n\n')

        generateTsFile(this.rootPath, this.serviceName, suffixes.CONTROLLER, tDtoStructure)
    }
}

export const createControllers = (config: ControllerConfig, rootPath: string) => {
    const controller = new ControllerFileFactory(config, rootPath)
    controller.generateControllerFile()
    return controller.imports['../models']
}
