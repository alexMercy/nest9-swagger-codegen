import { suffixes } from '@utils/constants'
import { generateTsFile } from '@utils/generateTsFile'
import * as _ from 'lodash'

const getAppModuleDraftTemplate = (serviceNames: string[]) => {
    const imports: string[] = []
    const entities: string[] = []
    const modules: string[] = []

    for (const serviceName of serviceNames) {
        const LServiceName = serviceName.toLowerCase()
        const CServiceName = _.capitalize(serviceName)

        imports.push(`
          // import { _${CServiceName} } from './${LServiceName}/${LServiceName}.entity'
          import { ${CServiceName}Module } from './${LServiceName}/${LServiceName}.module'
        `)

        entities.push(`_${CServiceName}`)
        modules.push(`${CServiceName}Module`)
    }

    return `
    import { Module } from '@nestjs/common'
    import { TypeOrmModule } from '@nestjs/typeorm'
    import { AppController } from './app.controller'
    import { AppService } from './app.service'
    ${imports.join('\n')}

    @Module({
    imports: [
        // TypeOrmModule.forRoot({
        //     type: 'postgres',
        //     host: 'localhost',
        //     port: 0000,
        //     username: 'username',
        //     password: 'password',
        //     database: 'db',
        //     entities: [${entities.join(', ')}],
        //     synchronize: true,
        // }),
        ${modules.join(',\n')}
    ],
    controllers: [AppController],
    providers: [AppService],
    })
    export class AppModule {}
`
}

const getTemplate = (serviceName: string) => {
    const LServiceName = serviceName.toLowerCase()
    const CServiceName = _.capitalize(LServiceName)

    return `
    import { Module } from '@nestjs/common'
    import { TypeOrmModule } from '@nestjs/typeorm'
    // import { _${CServiceName} } from './${LServiceName}.entity'
    import { ${CServiceName}Controller } from './${LServiceName}.controller'
    import { ${CServiceName}Service } from './${LServiceName}.service'

    @Module({
      // imports: [TypeOrmModule.forFeature([_${CServiceName}])],
      controllers: [${CServiceName}Controller],
      providers: [${CServiceName}Service],
    })
      export class ${CServiceName}Module {}
  `
}

export const generateModules = (serviceNames: string[], rootPath: string) => {
    serviceNames.forEach((serviceName) => {
        const template = getTemplate(serviceName)
        generateTsFile(rootPath, serviceName.toLowerCase(), `${suffixes.MODULE}.${suffixes.DRAFT}`, template)
    })
    const appModuleDraftTemplate = getAppModuleDraftTemplate(serviceNames)
    generateTsFile(rootPath, 'app', `${suffixes.MODULE}.${suffixes.DRAFT}`, appModuleDraftTemplate, './')
}
