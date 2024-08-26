export const getEnums = (enums: Record<string, any>) => {
  return Object.entries(enums).map(([title, _enum]) => {

    const getValue = (value: any) => {
      if(typeof value === 'number' || typeof value === 'boolean') {
        return `  K_${value} = ${value},`
      }
      if(typeof value === 'string')
      return `  ${value.toUpperCase()} = "${value}",`
    }

    return `export enum ${title} {
${_enum.map(value => getValue(value)).join('\n')}
}`
  }).join('\n\n')
}