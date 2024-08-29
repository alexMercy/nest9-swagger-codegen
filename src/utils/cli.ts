import { argOptionsValues, argsOptions } from './constants'

interface GenOptions {
    input: string
    output: string
    suffix: string
}

type ArgsMap = { [k in keyof GenOptions]: { options: argOptionsValues[]; defaultValue?: GenOptions[k] } }

const args = process.argv.slice(2)

const getArgsByMap = (argsMap: ArgsMap): GenOptions => {
    const optionsEntries = Object.entries(argsMap).map(([option, { options: localOpts, defaultValue }]) => {
        const argIdx = args.findIndex((arg) => localOpts.some((op) => op === arg)) + 1

        return [option as keyof GenOptions, argIdx && args[argIdx] ? args[argIdx] : defaultValue || '']
    })

    //@ts-ignore Object.fromEntries и Object.entries не умеет в нормальную типизацию ключей
    return Object.fromEntries(optionsEntries)
}

const getOptions = () => {
    const argsMap: ArgsMap = {
        input: { options: [argsOptions.INPUT, argsOptions.INPUT_SHORT], defaultValue: './swagger.yaml' },
        output: { options: [argsOptions.OUTPUT, argsOptions.OUTPUT_SHORT], defaultValue: './' },
        suffix: { options: [argsOptions.DTO_SUFFIX], defaultValue: 'Body' },
    }

    return getArgsByMap(argsMap)
}

export const genOptions: GenOptions = getOptions()
