import { ControllerContext } from '@templates/controller/controller.context'
import { ControllerPath } from '@templates/controller/controller.template'
import { methodNames } from '@utils/constants'
import * as _ from 'lodash'

const pathsOrder = ['get', 'post', 'put', 'delete']
const pathsSortByMethod = (paths: ControllerPath[]) =>
    paths.sort((a, b) => pathsOrder.indexOf(a.method) - pathsOrder.indexOf(b.method))

const getPathWithoutFirstRoute = (path: string) => {
    const parts = path.split('/').filter(Boolean)

    if (parts.length <= 1) {
        return undefined
    }

    return parts.slice(1).join('/')
}

export class Paths {
    constructor(private context: ControllerContext) {}

    private addPath = ({ method, path, pathParams, queryParams, body, returnType }: ControllerPath) => {
        this.context.imports['@nestjs/common'].add(_.capitalize(method))
        if (body) {
            this.context.imports['@nestjs/common'].add('Body')
            this.context.imports['../models'].add(body)
        }
        if (returnType) {
            this.context.imports['../models'].add(returnType.replace(/\[\]/g, ''))
        }
        if (pathParams) {
            this.context.imports['@nestjs/common'].add('Param')
        }

        if (queryParams) {
            this.context.imports['@nestjs/common'].add('Query')
        }

        const methodName = `${methodNames[method.toUpperCase() as keyof typeof methodNames]}${pathParams ? `By${pathParams.map(_.capitalize).join()}` : ''}`

        const pathParamsArgs = pathParams?.map((param) => `@Param('${param}') ${param}: string`).join(', ') || ''
        const queryParamsArgs = queryParams?.map((param) => `@Query('${param}') ${param}: string`).join(', ') || ''
        const bodyParamsArgs = body ? `@Body() body: ${body}` : ''

        const pathWithoutRoute = getPathWithoutFirstRoute(path)

        const decoratorParams = pathWithoutRoute ? `'${pathWithoutRoute.replace(/{(\w+)}/g, ':$1')}'` : ''
        const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')
        const serviceParams = _.compact([pathParams, queryParams, body ? 'body' : ''].flat()).join(', ')

        return `    @${_.capitalize(method)}(${decoratorParams})
      ${methodName}(${argsParams}): Promise<${returnType || 'void'}> {
          return this.${this.context.serviceName}Service.${methodName}(${serviceParams})
      }`
    }

    getPaths = () => {
        return pathsSortByMethod(this.context.paths)
            .map((path) => this.addPath({ ...path }))
            .join('\n')
    }
}
