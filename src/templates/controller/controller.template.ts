import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { getPaths } from '@templates/controller/getPaths'
import { methodNames } from '@utils/constants'
import { generateTsFile } from '@utils/generateTsFile'
import { getFileImports } from '@utils/getFileImports'
import * as _ from 'lodash'

export interface ControllerConfig {
    serviceName: string
    paths: ControllerPath[]
}
export interface ControllerPath {
    method: string
    path: string
    pathParams?: string[]
    queryParams?: string[]
    body?: string
    returnType?: string
}

const methodSorts = ['get', 'post', 'put', 'delete']
const methodSortFn = (paths: ControllerPath[]) =>
    paths.sort((a, b) => methodSorts.indexOf(a.method) - methodSorts.indexOf(b.method))

class ControllerFileFactory {
    private serviceName: string

    private paths: string

    private controllerFile: string

    private imports: Record<string, Set<string>> = {
        ['@nestjs/common']: new Set<string>().add('Controller'),
        ['@nestjs/swagger']: new Set<string>().add('ApiTags'),
        ['../models']: new Set<string>(),
        // the service and dto are imported inside the constructor
    }

    constructor(
        config: ControllerConfig,
        private rootPath: string,
    ) {
        this.serviceName = config.serviceName
        this.imports[`./${this.serviceName}.service`] = new Set<string>().add(
            `${_.capitalize(this.serviceName)}Service`,
        )
        this.paths = methodSortFn(config.paths)
            .map((path) => this.addPath({ ...path }))
            .join('\n\n')

        this.generateController()
    }

    private addPath = ({ method, path, pathParams, queryParams, body, returnType }: ControllerPath) => {
        this.imports['@nestjs/common'].add(_.capitalize(method))
        if (body) {
            this.imports['@nestjs/common'].add('Body')
            this.imports['../models'].add(body)
        }
        if (returnType) {
            this.imports['../models'].add(
                returnType.includes('[]') ? returnType.slice(0, returnType.length - 2) : returnType,
            )
        }
        if (pathParams) {
            this.imports['@nestjs/common'].add('Param')
        }

        if (queryParams) {
            this.imports['@nestjs/common'].add('Query')
        }

        const methodName = `${methodNames[method.toUpperCase() as keyof typeof methodNames]}${pathParams ? `By${pathParams.map(_.capitalize).join()}` : ''}`

        const pathParamsArgs = pathParams?.map((param) => `@Param('${param}') ${param}: string`).join(', ') || ''
        const queryParamsArgs = queryParams?.map((param) => `@Query('${param}') ${param}: string`).join(', ') || ''
        const bodyParamsArgs = body ? `@Body() body: ${body}` : ''

        const pathWithoutRoute = this.getPathWithoutFirstRoute(path)

        const decoratorParams = pathWithoutRoute ? `'${pathWithoutRoute.replace(/{(\w+)}/g, ':$1')}'` : ''
        const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')
        const serviceParams = _.compact([pathParams, queryParams, body ? 'body' : ''].flat()).join(', ')

        return `    @${_.capitalize(method)}(${decoratorParams})
        ${methodName}(${argsParams}): Promise<${returnType || 'void'}> {
            return this.${this.serviceName}Service.${methodName}(${serviceParams})
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
            @Controller('${this.serviceName}')
            export class ${cServiceName}Controller {
            constructor(private readonly ${this.serviceName}Service: ${cServiceName}Service) {}
        `
    }

    generateControllerFile() {
        const fileImports = getFileImports(this.imports)

        const tDtoStructure = _.compact([fileImports, this.controllerFile]).join('\n\n')

        generateTsFile(this.rootPath, this.serviceName, 'controller', tDtoStructure)
    }
}

export const generateControllers = (api: SwaggerApi, rootPath: string) => {
    const controllersCfg: ControllerConfig[] = []

    //create controllers config
    Object.entries(api.paths).forEach(([route, methods]) => {
        const serviceName = Object.values(methods)[0].tags?.[0] || ''
        Object.entries(methods).forEach(([method, data]: [string, Operation]) => {
            getPaths(route, method, data, controllersCfg, serviceName)
        })
    })

    controllersCfg.forEach((cfg) => {
        const controller = new ControllerFileFactory(cfg, rootPath)
        controller.generateControllerFile()
    })
}
