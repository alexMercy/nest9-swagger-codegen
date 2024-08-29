
export const methodNames = Object.freeze({
  GET: 'get',
  POST: 'create',
  PUT: 'update',
  DELETE: 'delete'
})

export const paramTypes = Object.freeze({
  PATH: 'path',
  QUERY: 'query'
})

export const argsOptions = Object.freeze({
  OUTPUT: '--output',
  OUTPUT_SHORT: '-o',
  INPUT: '--input',
  INPUT_SHORT: '-i',
  GENERATE_OPTIONS: '--gen-options',
  GENERATE_OPTIONS_SHORT: '-g',
})

export const serviceOptionName = 'service'
export const controllerOptionName = 'controller'
export const entityOptionName = 'entity'
export const draftSuffix = '.draft'
export const generateOptionExpectedValues = [serviceOptionName, entityOptionName]
