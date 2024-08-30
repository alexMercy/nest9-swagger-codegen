export const methodNames = Object.freeze({
    GET: 'get',
    POST: 'create',
    PUT: 'update',
    DELETE: 'delete',
})

export const paramTypes = Object.freeze({
    PATH: 'path',
    QUERY: 'query',
})

export const argsOptions = Object.freeze({
    OUTPUT: '--output',
    OUTPUT_SHORT: '-o',
    INPUT: '--input',
    INPUT_SHORT: '-i',
    GENERATE_OPTIONS: '--gen-options',
    GENERATE_OPTIONS_SHORT: '-g',
})

export const generateOptionNames = Object.freeze({
    SERVICE: 'service',
    ENTITY: 'entity',
})

export const suffixes = Object.freeze({
    SERVICE: 'service',
    CONTROLLER: 'controller',
    DTO: 'dto',
    DRAFT: 'draft',
})

export const generateOptionExpectedValuesArr =
    Object.values(generateOptionNames)
