export const getEnums = (enums: Record<string, any>) => {
    return Object.entries(enums)
        .map(([title, _enum]) => {
            const getValue = (value: any) => {
                if (typeof value === 'number' || typeof value === 'boolean') {
                    return `  K_${value} = ${value},`
                }
                return `  ${value.toUpperCase()} = "${value}",`
            }

            return `export enum ${title} {
${_enum.map((value: any) => getValue(value)).join('\n')}
}`
        })
        .join('\n\n')
}
