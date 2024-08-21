import { argsOptions } from "./constants"

export const getArgsOpts = (args) => {
  const options: any = {}
  const isOutput = args.findIndex(arg => arg === argsOptions.OUTPUT || arg === argsOptions.OUTPUT_SHORT)

  if(isOutput+1 && args[isOutput+1]) {
    options.output = args[isOutput+1]
  }
  return options
}