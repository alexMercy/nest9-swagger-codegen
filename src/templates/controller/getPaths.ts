import { Operation } from '@swaggertypes/paths.types'
import { paramTypes } from '@utils/constants'
import { ControllerConfig, type ControllerPath } from './controller.template'

export const getPaths = (
    route: string,
    method: string,
    data: Operation,
    controllersCfg: ControllerConfig[],
    serviceName: string,
) => {
    const { parameters, requestBody, responses } = data
    const pathParamsSchema = parameters
        ?.filter((param) => param.in === paramTypes.PATH)
        .map(({ name, schema }) => {
            return { name: name, schema: schema }
        })
    const queryParams = parameters
        ?.filter((param) => param.in === paramTypes.QUERY)
        .map(({ name, schema }) => {
            return { name: name, schema: schema }
        })
    const cfg = controllersCfg.find((cfg) => cfg.serviceName === serviceName)

    const returnType: any = Object.entries(responses).filter(([statusCode]) => /^2\d{2}$/.test(statusCode))[0][1]

    const getReturnType = () => {
        const root = returnType?.content?.['application/json']
        if (!root) return undefined

        if (root.schema.type === 'array') {
            return `${root.schema.items.refType}[]`
        } else {
            return root.schema.refType
        }
    }

    const crudPath: ControllerPath = {
        method,
        path: route,
        pathParams: pathParamsSchema?.length ? pathParamsSchema : undefined,
        queryParams: queryParams?.length ? queryParams : undefined,
        body: requestBody?.content['application/json'].schema.refType,
        returnType: getReturnType(),
    }

    if (cfg) {
        if (!cfg.paths) cfg.paths = []
        cfg.paths.push(crudPath)
    } else {
        controllersCfg.push({ serviceName, paths: [crudPath] })
    }
}
