#!/usr/bin/env node

import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { createDtos } from '@templates/dto'
import { generateTsFile, options, generateOptionNames, suffixes } from '@utils'
import { dereferenceWithRefNames } from 'core/parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ControllerConfig, getPaths, Tcontroller } from 'templates/controller'
import { Tservice } from 'templates/service/service.template'
import * as yaml from 'yaml'

const fileContent = fs.readFileSync(options.input || './swagger.yaml', 'utf8')
const swaggerDoc: any = yaml.parse(fileContent)

const getSharedDtos = (api: SwaggerApi, imports: any) => {
    const importDtos = imports.map((d: any) => [...d.importDtos]).flat()
    const sharedDtos = api.components?.schemas
        ? Object.keys(api.components?.schemas).filter(
              (title) => !importDtos.includes(title),
          )
        : []

    return sharedDtos
}

const generateControllers = (api: SwaggerApi, rootPath: string) => {
    const controllersCfg: ControllerConfig[] = []

    const imports: any[] = []

    Object.entries(api.paths).forEach(([route, methods]) => {
        const serviceName = Object.values(methods)[0].tags?.[0] ?? ''
        Object.entries(methods).forEach(
            ([method, data]: [string, Operation]) => {
                getPaths(route, method, data, controllersCfg, serviceName)
            },
        )
    })

    controllersCfg.forEach((cfg) => {
        const [controller, importDtos] = Tcontroller(cfg)
        const { serviceName } = cfg
        generateTsFile(rootPath, serviceName, suffixes.CONTROLLER, controller)
        imports.push({ serviceName, importDtos })

        if (options.generateOpts?.includes(generateOptionNames.SERVICE)) {
            const service = Tservice(cfg)
            generateTsFile(
                rootPath,
                serviceName,
                suffixes.SERVICE + '.' + suffixes.DRAFT,
                service,
            )
        }
    })
    return imports
}

const generateApi = (api: SwaggerApi) => {
    //TODO: delete after complete -------
    // const filePath = path.join("./", 'swagger.json')
    // fs.writeFileSync(filePath, JSON.stringify( api));
    //----------------------------------

    const rootPath = path.join(options.output || './', `services`)
    fs.ensureDirSync(rootPath)

    const imports = generateControllers(api, rootPath)
    const sharedDtos = getSharedDtos(api, imports)

    imports.forEach(({ serviceName, importDtos }) =>
        createDtos(api, rootPath, serviceName, [...importDtos]),
    )
    createDtos(api, rootPath, 'shared', sharedDtos)

    console.log('Code generated successfully')
}

dereferenceWithRefNames(swaggerDoc).then(generateApi)
