export const getMappedSwaggerType = (inType: string, inTypeFormat: string | undefined): string => {
    let outType: string
    let processedFormat = inTypeFormat || 'default'

    // mapping is described in https://spec.openapis.org/oas/v3.0.0.html#data-types
    switch (`${inType}-${processedFormat}`) {
        case 'boolean-default':
            outType = 'boolean'
            break

        case 'integer-default':
        case 'integer-int32':
            outType = 'number'
            break

        case 'integer-int64':
            outType = 'bigint'
            break

        case 'number-default':
        case 'number-double':
        case 'number-float':
            outType = 'number'
            break

        case 'string-byte':
        case 'string-date':
        case 'string-date-time':
        case 'string-default':
        case 'string-email':
        case 'string-password':
            outType = 'string'
            break

        case 'string-uuid':
            outType = 'UUID'
            break

        default:
            throw new Error(`unexpected swagger type or format: ${inType} - ${inTypeFormat}`)
    }
    return outType
}
