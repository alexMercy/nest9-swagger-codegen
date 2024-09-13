import { Operation } from '@swaggertypes/paths.types'
import { paramTypes } from '@utils/constants'
import { ControllerConfig, type ControllerPath } from './controller.template'
import { RefSchema } from '@swaggertypes/shared.types'

export const getPaths = (
    route: string,
    method: string,
    data: Operation,
    controllersCfg: ControllerConfig[],
    serviceName: string,
) => {
    const { parameters, requestBody, responses } = data
    const pathParams: { name: string; schema: RefSchema }[] = []
    const queryParams: { name: string; schema: RefSchema }[] = []

    if (parameters) {
        for (const param of parameters) {
            if (param.in === paramTypes.PATH) {
                pathParams.push({ name: param.name, schema: param.schema })
            }
            if (param.in == paramTypes.QUERY) {
                queryParams.push({ name: param.name, schema: param.schema })
            }
        }
    }

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
        pathParams: pathParams?.length ? pathParams : undefined,
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
