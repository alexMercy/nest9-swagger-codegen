import * as fs from 'fs-extra'
import * as path from 'path'
import * as prettier from 'prettier'

const defaultPrettierOptions: prettier.Options = {
    trailingComma: 'all',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
}

export const generateTsFile = async (
    rootPath: string,
    serviceName: string,
    type: string,
    data: string,
    folder?: string,
) => {
    const prettierConfigPath = await prettier.resolveConfigFile()
    const prettierOptions = prettierConfigPath
        ? await prettier.resolveConfig(prettierConfigPath)
        : defaultPrettierOptions

    const formattedContent = await prettier.format(data, {
        ...prettierOptions,
        parser: 'typescript',
    })
    const servicePath = path.join(rootPath, `${folder || serviceName}`)
    fs.ensureDirSync(servicePath)
    fs.writeFileSync(path.join(servicePath, `${serviceName}.${type}.ts`), formattedContent)
}
