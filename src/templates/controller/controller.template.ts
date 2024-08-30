import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { ControllerContext } from '@templates/controller/controller.context'
import { Paths } from '@templates/controller/controller.paths'
import { getPaths } from '@templates/controller/getPaths'
import { generateTsFile } from '@utils/generateTsFile'
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

class ControllerFileFactory {
    private controllerFile: string

    constructor(private context: ControllerContext) {
        this.controllerFile = this.render()
    }

    private render = () => {
        const cServiceName = _.capitalize(this.context.serviceName)
        const paths = new Paths(this.context).getPaths()

        // imports всегда включаем последним, так как сначал нужно собрать полную информацию по файлу
        const imports = this.context.getFileImports()

        return `
        ${imports}

        @ApiTags('${this.context.serviceName}')
        @Controller('${this.context.serviceName}')
        export class ${cServiceName}Controller {
        constructor(private readonly ${this.context.serviceName}Service: ${cServiceName}Service) {}

        ${paths}

        }`
    }

    generateControllerFile() {
        generateTsFile(this.context.rootPath, this.context.serviceName, 'controller', this.controllerFile)
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
        const controllerCtx = new ControllerContext(cfg.paths, cfg.serviceName, rootPath)
        const controller = new ControllerFileFactory(controllerCtx)
        controller.generateControllerFile()
    })
}
