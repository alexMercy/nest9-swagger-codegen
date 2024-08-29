#!/usr/bin/env node

import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { generateDtos } from '@templates/dto'
import { options } from '@utils'
import { dereferenceWithRefNames } from 'core/parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ControllerConfig, createControllers, getPaths } from 'templates/controller'
import * as yaml from 'yaml'

const fileContent = fs.readFileSync(options.input || './swagger.yaml', 'utf8')
const swaggerDoc: any = yaml.parse(fileContent)

const getSharedDtos = (api: SwaggerApi, imports: any) => {
    const importDtos = imports.map((d: any) => [...d.importDtos]).flat()
    const sharedDtos = api.components?.schemas
        ? Object.keys(api.components?.schemas).filter((title) => !importDtos.includes(title))
        : []

    return sharedDtos
}

const generateControllers = (api: SwaggerApi, rootPath: string) => {
    const controllersCfg: ControllerConfig[] = []

    const imports: any[] = []

    Object.entries(api.paths).forEach(([route, methods]) => {
        const serviceName = Object.values(methods)[0].tags?.[0] || ''
        Object.entries(methods).forEach(([method, data]: [string, Operation]) => {
            getPaths(route, method, data, controllersCfg, serviceName)
        })
    })

    controllersCfg.forEach((cfg) => {
        const importDtos = createControllers(cfg, rootPath)
        const { serviceName } = cfg
        imports.push({ serviceName, importDtos })
    })
    return imports
}

const generateApi = (api: SwaggerApi) => {
    //TODO: delete after compelete -------
    // const filePath = path.join("./", 'swagger.json')
    // fs.writeFileSync(filePath, JSON.stringify( api));
    //----------------------------------

    const rootPath = path.join(options.output || './', `services`)
    fs.ensureDirSync(rootPath)

    generateControllers(api, rootPath)
    generateDtos(api, rootPath)

    console.log('Code generated successfully')
}

dereferenceWithRefNames(swaggerDoc).then(generateApi)
