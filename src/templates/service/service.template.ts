import { methodNames } from '@utils/constants';
import { ControllerPath } from '../controller/controller.template';
import * as _ from 'lodash';


type addServiceOperationProps = ControllerPath & {
    serviceName: string,
    imports?: any,
}

const getImportsAndClass = (serviceName: string, imports: any) => {

    const cServiceName = _.capitalize(serviceName)

    // const commonsImports = [...imports.commons].join(', ')
    // const dtosImports = [...imports.dtos].join(', ')

    return `
import { Injectable, NotFoundException } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { randomUUID, UUID } from 'crypto'

// import {
//   _Category,
//   Category,
//   CategoryBody,
// } from 'src/services/category/category.entity'
// import { Repository } from 'typeorm'

@Injectable()
export class ${cServiceName}Service {
  constructor(
    // @InjectRepository(_Category)
    // private categoriesRepository: Repository<Category>
  ) {}

  `
}


const addServiceOperation = ({ method, pathParams, queryParams, body, imports }: addServiceOperationProps) => {

    //  imports.commons.add(_.capitalize(method))

    const methodName = `${methodNames[method.toUpperCase() as keyof typeof methodNames]}${pathParams ? `By${pathParams.map(_.capitalize).join()}` : ''}`

    const pathParamsArgs = pathParams?.map(param => `${param}: string`).join(', ') || ''
    const queryParamsArgs = queryParams?.map(param => `${param}: string`).join(', ') || ''
    const bodyParamsArgs = body ? `body: ${body}` : ''

    const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')

    return `
        async ${methodName}(${argsParams}) {
            // template generated method
            // update it as needed
        }`
}

export const Tservice = ({ serviceName, paths }: { serviceName: string, paths: ControllerPath[] }): string => {
    const imports = {
        commons: new Set(),
        dtos: new Set()
    }

    const methodSorts = ['get', 'post', 'put', 'delete']

    const tOps = paths.slice().sort((a, b) =>
        methodSorts.indexOf(a.method) - methodSorts.indexOf(b.method)).
        map(path =>
            addServiceOperation({ ...path, serviceName, imports })).
        join('\n\n')

    return `
      ${getImportsAndClass(serviceName, imports)}
      ${tOps}
}`
}