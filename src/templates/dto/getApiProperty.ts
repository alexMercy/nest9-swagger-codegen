
const ApiProperties = [
  'nullable',
  'example',
  'examples',
  'deprecated',
  'description',
  'format',
  'default',
  'title',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'maxItems',
  'minItems',
  'uniqueItems',
] as const


function plainToProp(data: any, keys: typeof ApiProperties) {
  const newObj = {}
  Object.keys(data).forEach(key => {
    //@ts-ignore
    if(keys.includes(key)) {
      newObj[key] = data[key]
    }
  })
  return Object.keys(newObj).length ? newObj : undefined
}


export const getApiProperties = (data: any): string => {
  
  const apiPlainedProps = plainToProp(data, ApiProperties)

  
  if (!apiPlainedProps) return ''

  const props = Object.entries(apiPlainedProps).map(([key, value]) => 
    `${key}: ${value === `${value}` ? `'${value}'` : value}`).join(', ')
  return `@ApiProperty({${props}})`
}