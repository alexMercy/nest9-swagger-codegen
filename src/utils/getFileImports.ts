export const getFileImports = (imports: Record<string, Set<string>>) => {
  return Object.entries(imports).map(([path, set]) => {

    if(!set.size) return ''

    const props = [...set].join(', ')

    return `import { ${props} } from "${path}"`
  }).join('\n')
}