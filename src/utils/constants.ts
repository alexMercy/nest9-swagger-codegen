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

export type argOptionsValues = (typeof argsOptions)[keyof typeof argsOptions]

export const argsOptions = Object.freeze({
    OUTPUT: '--output',
    OUTPUT_SHORT: '-o',
    INPUT: '--input',
    INPUT_SHORT: '-i',
    DTO_SUFFIX: '-suffix',
})
