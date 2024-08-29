import { genOptions } from '@utils/cli'

export const isSuffix = (name: string) => !!name.match(new RegExp(`.${genOptions.suffix}$`))

export const getNameWithoutSuffix = (name: string) => {
    return (isSuffix(name) ? name.slice(0, -genOptions.suffix.length) : name).toLowerCase()
}
