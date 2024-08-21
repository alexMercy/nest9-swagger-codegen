
import * as _ from 'lodash';
import { methodNames } from '../../utils';


export interface ControllerConfig {
    serviceName: string,
    paths: ControllerPath[]
}
export interface ControllerPath {
    method: string,
    path: string,
    pathParams?: string[],
    queryParams?: string[],
    body?: string,
    returnType?: string,
}

const getImportsAndClass = (serviceName: string, imports: any) => {

    const cServiceName = _.capitalize(serviceName)

    const commonsImports = [...imports.commons].join(', ')
    const dtosImports = [...imports.dtos].join(', ')

    return `
import { Controller, ${commonsImports} } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ${cServiceName}Service } from './${serviceName}.service'
import { ${dtosImports} } from './${serviceName}.dto'

@ApiTags('${serviceName}')
@Controller('${serviceName}')
export class ${cServiceName}Controller {
    constructor(private readonly ${serviceName}Service: ${cServiceName}Service) {}
    `
}

function getPathWithoutFirstRoute(path: string) {
    const parts = path.split('/').filter(Boolean);
  
    if (parts.length <= 1) {
      return undefined;
    }
  
    return parts.slice(1).join('/');
  }

type addPathProps = ControllerPath & {
    serviceName: string,
    imports: any,
}

const addPath = ({method, path, pathParams, queryParams, serviceName, body, imports, returnType}: addPathProps) => {

    imports.commons.add(_.capitalize(method))
    if(body) {
        imports.commons.add('Body')
        imports.dtos.add(body)
    }
    if(returnType) {
        imports.dtos.add(returnType.includes('[]') ? returnType.slice(0,returnType.length - 2) : returnType)
    }
    if(pathParams) {
        imports.commons.add('Param')
    }

    if(queryParams) {
        imports.commons.add('Query')
    }

    const methodName = `${methodNames[method.toUpperCase() as keyof typeof methodNames]}${pathParams ? `By${pathParams.map(_.capitalize).join()}` : ''}`

    const pathParamsArgs = pathParams?.map(param => `@Param('${param}') ${param}: string`).join(', ') || ''
    const queryParamsArgs = queryParams?.map(param => `@Query('${param}') ${param}: string`).join(', ') || ''
    const bodyParamsArgs = body ? `@Body() body: ${body}` : ''
    
    const pathWithoutRoute = getPathWithoutFirstRoute(path)

    const decoratorParams = pathWithoutRoute ?  `'${pathWithoutRoute.replace(/{(\w+)}/g, ":$1")}'` : ''
    const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')
    const serviceParams = _.compact([pathParams, queryParams, body ? 'body' : ''].flat()).join(', ')

    return `    @${_.capitalize(method)}(${decoratorParams})
    ${methodName}(${argsParams}): Promise<${returnType || 'void'}> {
        return this.${serviceName}Service.${methodName}(${serviceParams})
    }`
}



export const Tcontroller = ({serviceName, paths}: {serviceName: string, paths: ControllerPath[]}): [string, Set<any>] =>  {
    const imports = {
        commons: new Set(),
        dtos: new Set()
    }

    const methodSorts = ['get', 'post', 'put', 'delete']

    const tPaths = paths.sort((a,b) => methodSorts.indexOf(a.method) - methodSorts.indexOf(b.method)).map(path => addPath({...path, serviceName, imports})).join('\n\n')
    return [`
${getImportsAndClass(serviceName, imports)}
${tPaths}
}`, imports.dtos]}