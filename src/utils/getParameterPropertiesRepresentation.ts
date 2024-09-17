import { ParameterWithSchema } from '@coretypes/derived.types'

export const getOptionalParameterRepresentation = (param: ParameterWithSchema): string => {
    return !param?.required ? '?' : ''
}
