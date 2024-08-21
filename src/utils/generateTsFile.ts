import * as fs from 'fs-extra'
import * as path from "path"

export const generateTsFile = (rootPath, serviceName, type, data) => {
  const servicePath = path.join(rootPath, `${serviceName}`)
  fs.ensureDirSync(servicePath)
  fs.writeFileSync(path.join(servicePath, `${serviceName}.${type}.ts`), data)
}