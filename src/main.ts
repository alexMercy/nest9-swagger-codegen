#!/usr/bin/env node

import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { Operation } from '@swaggertypes/paths.types'
import { createDtos } from '@templates/dto'
import { generateOptionNames, generateTsFile, options, suffixes } from '@utils'
import { dereferenceWithRefNames } from 'core/parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ControllerConfig, createControllers, getPaths } from 'templates/controller'
import { Tservice } from 'templates/service/service.template'
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

        if (options.generateOpts?.includes(generateOptionNames.SERVICE)) {
            const service = Tservice(cfg)
            generateTsFile(rootPath, serviceName, suffixes.SERVICE + '.' + suffixes.DRAFT, service)
        }
    })
    return imports
}

const getComponentGroups = (api: SwaggerApi) => {
    const dtoBodySuffix = 'Body'

    const groups: Record<string, Set<string>> = {}

    const schemas = Object.keys(api.components.schemas)

    schemas.forEach((title) => {
        const isBodySuffix = !!title.match(new RegExp(`.${dtoBodySuffix}$`))

        const key = isBodySuffix ? title.slice(0, -dtoBodySuffix.length) : title

        if (!groups[key]) groups[title] = new Set()
        groups[key].add(title)
    })

    return groups
}

const generateApi = (api: SwaggerApi) => {
    //TODO: delete after compelete -------
    // const filePath = path.join("./", 'swagger.json')
    // fs.writeFileSync(filePath, JSON.stringify( api));
    //----------------------------------

    const rootPath = path.join(options.output || './', `services`)
    fs.ensureDirSync(rootPath)
    const groups = getComponentGroups(api)
    generateControllers(api, rootPath)

    Object.entries(groups).forEach(([title, groupSet]) => createDtos(api, rootPath, title.toLowerCase(), [...groupSet]))

    //create index.ts for models
    const indexFile = Object.keys(groups)
        .map((title) => {
            return `export * from "./${title.toLowerCase()}.dto"`
        })
        .join('\n')

    const modelsPath = path.join(rootPath, 'models')
    fs.ensureDirSync(modelsPath)
    const filePath = path.join(modelsPath, 'index.ts')
    fs.writeFileSync(filePath, indexFile)

    console.log('Code generated successfully')
}

dereferenceWithRefNames(swaggerDoc).then(generateApi)
