#!/usr/bin/env node

import { SwaggerApi } from '@swaggertypes/documentSwagger.type'
import { generateDtos } from '@templates/dto'
import { genOptions } from '@utils'
import { dereferenceWithRefNames } from 'core/parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import { generateControllers } from 'templates/controller'
import * as yaml from 'yaml'

const fileContent = fs.readFileSync(genOptions.input || './swagger.yaml', 'utf8')
const swaggerDoc: any = yaml.parse(fileContent)

const generateApi = (api: SwaggerApi) => {
    //TODO: delete after compelete -------
    // const filePath = path.join("./", 'swagger.json')
    // fs.writeFileSync(filePath, JSON.stringify( api));
    //----------------------------------

    const rootPath = path.join(genOptions.output || './', `services`)
    fs.ensureDirSync(rootPath)

    generateControllers(api, rootPath)
    generateDtos(api, rootPath)

    console.log('Code generated successfully')
}

dereferenceWithRefNames(swaggerDoc).then(generateApi)
