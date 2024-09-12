#!/usr/bin/env node

import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { generateDtos } from '@templates/dto'
import { generateModules } from '@templates/module'
import { generateOptionNames, generateTsFile, options, suffixes } from '@utils'
import { dereferenceWithRefNames } from 'core/parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ControllerConfig, createControllers, getPaths } from 'templates/controller'
import { generateEntities } from 'templates/entity/entity.template'
import { Tservice } from 'templates/service/service.template'
import * as yaml from 'yaml'

const fileContent = fs.readFileSync(options.input || './swagger.yaml', 'utf8')
const swaggerDoc: any = yaml.parse(fileContent)

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

        if (options.generateOpts?.includes(generateOptionNames.SERVICE)) {
            const service = Tservice(cfg)
            generateTsFile(rootPath, serviceName.toLowerCase(), suffixes.SERVICE + '.' + suffixes.DRAFT, service)
        }

        if (options.generateOpts?.includes(generateOptionNames.ENTITY)) {
            generateEntities(api, rootPath, serviceName.toLowerCase(), [...importDtos])
        }
    })
    return controllersCfg.map((cfg) => cfg.serviceName)
}

const generateApi = (api: SwaggerApi) => {
    //TODO: delete after complete -------
    // const filePath = path.join("./", 'swagger.json')
    // fs.writeFileSync(filePath, JSON.stringify( api));
    //----------------------------------

    const rootPath = path.join(options.output || './', `modules`)
    fs.ensureDirSync(rootPath)
    const serviceNames = generateControllers(api, rootPath)
    generateDtos(api, rootPath)
    generateModules(serviceNames, rootPath)

    console.log('Code generated successfully')
}

dereferenceWithRefNames(swaggerDoc).then(generateApi)
