import { argsOptions } from './constants'

const args = process.argv.slice(2)

const getArgsOpts = (args: string[]) => {
    const options: any = {}

    /**
     * Output arg
     */
    const isOutput = args.findIndex((arg) => arg === argsOptions.OUTPUT || arg === argsOptions.OUTPUT_SHORT)
    if (isOutput + 1 && args[isOutput + 1]) {
        options.output = args[isOutput + 1]
    }

    /**
     * Input arg
     */
    const isInput = args.findIndex((arg) => arg === argsOptions.INPUT || arg === argsOptions.INPUT_SHORT)
    if (isInput + 1 && args[isInput + 1]) {
        options.input = args[isInput + 1]
    }

    return options
}

export const options = getArgsOpts(args)
