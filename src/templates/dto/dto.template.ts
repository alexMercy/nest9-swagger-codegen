import { getApiProperties } from '@templates/dto/getApiProperty'
import { generateTsFile } from '@utils/generateTsFile'
import * as _ from 'lodash'
import { allOfDereference } from "../lib/allOfdereference"

const getEnums = (enums) => {

  return enums.map(([title, _enum]) => {

    const getValue = (value) => {
      if (typeof value === 'number' || typeof value === 'boolean') {
        return `  K_${value} = ${value},`
      }
      if (typeof value === 'string')
        return `  ${value.toUpperCase()} = "${value}",`
    }

    return `export enum ${title} {
${_enum.map(value => getValue(value)).join('\n')}
}`
  }).join('\n\n')
}


const getType = (data, enums, title, imports) => {

  if (data.type === 'array') {
    const nestedType = data.items.type

    const isComplexType = nestedType === 'object' || nestedType === 'array'

    return `${isComplexType ? getType(data.items, enums, title, imports) : nestedType}[]`
  }

  if (data.type === 'object') {
    if (!data.refType)
      throw new Error("don't use no ref object props. If you need use object prop, that create component and use him with $ref")

    return data.refType
  }

  if (data.enum) {
    const enumName = `${title}Enum`
    enums.push([enumName, data.enum])
    return enumName
  }

  return data.type

}


const getProp = (title, data, requireds, enums, imports: Set<string>) => {

  const required = requireds.includes(title) ? '' : '?'

  const apiProperty = getApiProperties(data)
  if (apiProperty) imports.add(`import { ApiProperty } from '@nestjs/swagger'`)


  return `
  ${apiProperty}
  ${title}${required}: ${getType(data, enums, title, imports)}`
}



const getProps = (data, enums, imports) => {
  const { properties, required } = data


  return Object.entries(properties).map(([title, data]) => getProp(title, data, required, enums, imports))
}


const createDto = (title, data, enums, imports) => {

  return `
  export class ${title} {
    ${getProps(data, enums, imports).join('\n')}
  }`
}

export const createDtos = (api, rootPath, serviceName, dtos) => {

  const enums: string[] = []


  const filteredComponents = [...dtos].map(dto => ([dto, allOfDereference(api.components.schemas[dto])]))

  const imports = new Set()

  const tDtos = filteredComponents.map(([title, data]) => createDto(title, data, enums, imports))

  const uniqEnums = _.uniqWith(enums, _.isEqual);


  const tDtoStructure = _.compact([
    [...imports].join('\n'),
    getEnums(uniqEnums),
    tDtos.join('\n\n')
  ]).join('\n\n')


  generateTsFile(rootPath, serviceName, 'dto', tDtoStructure)
}