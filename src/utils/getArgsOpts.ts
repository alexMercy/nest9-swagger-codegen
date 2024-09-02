import { string } from 'yaml/dist/schema/common/string'
import { argsOptions, generateOptionExpectedValuesArr } from './constants'
import * as _ from 'lodash'

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

    /**
     * Generation Options arg
     */
    const isGenerateOptions = args.findIndex(
        (arg) => arg === argsOptions.GENERATE_OPTIONS || arg === argsOptions.GENERATE_OPTIONS_SHORT,
    )

    const generateOptionsInStr = args[isGenerateOptions + 1]
    if (isGenerateOptions + 1 && generateOptionsInStr) {
        const generateOptionsInArray: string[] = generateOptionsInStr.split(',')
        const optionsToProcess: string[] = _.intersection(generateOptionsInArray, generateOptionExpectedValuesArr)
        options.generateOpts = optionsToProcess
    }

    return options
}

export const options = getArgsOpts(args)
