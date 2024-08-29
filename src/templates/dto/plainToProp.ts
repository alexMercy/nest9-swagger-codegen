const ValidatorsPropsArray = [
    'nullable',
    'format',
    'maximum',
    'exclusiveMaximum',
    'minimum',
    'exclusiveMinimum',
    'maxLength',
    'minLength',
    'pattern',
] as const

const ApiProperties = [
    'example',
    'examples',
    'deprecated',
    'description',
    'default',
    'title',
    ...ValidatorsPropsArray,
] as const

export type ValidatorsProps = (typeof ValidatorsPropsArray)[number]

export const classValidators: Record<
    ValidatorsProps,
    (...args: any) => string
> = {
    nullable: () => `@IsEmpty()`,
    format: (type: any) => `@IsEmpty()`, //TODO: rewrite
    pattern: (regexp: string) => `@Mathes(new RegExp('${regexp}'))`, //TODO: rewrite
    maximum: (max: number) => `@Max(${max})`,
    minimum: (min: number) => `@Min(${min})`,
    maxLength: (max: number) => `@MaxLength(${max})`,
    minLength: (min: number) => `@MinLength(${min})`,

    //TODO: rewrite exclusive
    exclusiveMaximum: (max: number) => `@Max(${max})`,
    exclusiveMinimum: (min: number) => `@Min(${min})`,
}

export function plainToProp(data: any) {
    const newObj = {}
    Object.keys(data).forEach((key) => {
        //@ts-ignore
        if (ApiProperties.includes(key)) {
            newObj[key] = data[key]
        }
    })
    return Object.keys(newObj).length ? newObj : undefined
}
