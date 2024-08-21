import * as fs from 'fs-extra'
import * as path from "path"

export const generateTsFile = (rootPath: string, serviceName: string, type: string, data: string) => {
  const servicePath = path.join(rootPath, `${serviceName}`)
  fs.ensureDirSync(servicePath)
  fs.writeFileSync(path.join(servicePath, `${serviceName}.${type}.ts`), data)
}