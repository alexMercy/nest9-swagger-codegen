import { methodNames } from '@utils/constants'
import { ControllerPath } from '../controller/controller.template'
import { ParameterWithSchema } from '@templates/lib'
import { getMappedSwaggerType } from '@utils/getMappedSwaggerType'

import * as _ from 'lodash'

type addServiceOperationProps = ControllerPath & {
    serviceName: string
    imports?: any
}

const getImportsAndClass = (serviceName: string, imports: any) => {
    const cServiceName = _.capitalize(serviceName)

    const dtosImports = [...imports.dtos].join(', ')
    const entitiesImports = [...imports.entities].join(', ')

    return `
import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'

import {
${dtosImports}
} from '../models'

//import {
//${entitiesImports}
//} from './${serviceName}.entity'
// import { Repository } from 'typeorm'
// import { UUID } from 'crypto'

@Injectable()
export class ${cServiceName}Service {
  constructor(
    // @InjectRepository(_Category)
    // private categoriesRepository: Repository<Category>
  ) {}

  `
}

const addServiceOperation = ({
    method,
    pathParams,
    queryParams,
    body,
    returnType,
    imports,
}: addServiceOperationProps) => {
    if (body) {
        imports.dtos.add(body)
    }

    if (returnType) {
        imports.dtos.add(returnType.includes('[]') ? returnType.slice(0, -2) : returnType)
    }

    const baseMethodName = methodNames[method.toUpperCase() as keyof typeof methodNames]
    const byParamSuffix = pathParams ? `By${pathParams.map((pp) => _.capitalize(pp.name)).join()}` : ''
    const methodName = `${baseMethodName}${byParamSuffix}`

    const getParamsWithTypeString = function (params?: ParameterWithSchema[]): string {
        return (
            params?.map((pp) => `${pp.name}: ${getMappedSwaggerType(pp.schema.type, pp.schema.format)}`).join(', ') ??
            ''
        )
    }

    const pathParamsArgs = getParamsWithTypeString(pathParams)
    const queryParamsArgs = getParamsWithTypeString(queryParams)
    const bodyParamsArgs = body ? `body: ${body}` : ''

    const argsParams = _.compact([pathParamsArgs, queryParamsArgs, bodyParamsArgs]).join(', ')

    let returnObj: string
    if (returnType?.includes('[]')) {
        returnObj = '[]'
    } else if (returnType) {
        returnObj = `new ${returnType}()`
    } else {
        returnObj = ''
    }

    return `
        async ${methodName}(${argsParams}): Promise<${returnType ?? 'void'}> {
            // template generated method
            // update it as needed
            return Promise.resolve(${returnObj});
        }`
}

export const Tservice = ({ serviceName, paths }: { serviceName: string; paths: ControllerPath[] }): string => {
    const imports = {
        commons: new Set(),
        dtos: new Set(),
        entities: new Set(),
    }

    const methodSorts = ['get', 'post', 'put', 'delete']

    const tOps = paths
        .slice()
        .sort((a, b) => methodSorts.indexOf(a.method) - methodSorts.indexOf(b.method))
        .map((path) => addServiceOperation({ ...path, serviceName, imports }))
        .join('\n\n')

    return `
      ${getImportsAndClass(serviceName, imports)}
      ${tOps}
}`
}
