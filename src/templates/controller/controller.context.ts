import { ControllerPath } from '@templates/controller/controller.template'
import { getFileImports } from '@utils/getFileImports'
import * as _ from 'lodash'

export class ControllerContext {
    public imports: Record<string, Set<string>> = {
        ['@nestjs/common']: new Set<string>().add('Controller'),
        ['@nestjs/swagger']: new Set<string>().add('ApiTags'),
        ['../models']: new Set<string>(),
        // the service and dto are imported inside the constructor
    }
    constructor(
        public paths: ControllerPath[],
        public serviceName: string,
        public rootPath: string,
    ) {
        this.imports[`./${this.serviceName}.service`] = new Set<string>().add(
            `${_.capitalize(this.serviceName)}Service`,
        )
    }

    getFileImports = () => {
        return getFileImports(this.imports)
    }
}
