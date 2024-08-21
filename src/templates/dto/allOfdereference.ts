export const allOfDereference = (component) => {
  if(!component.allOf) return component

  const reference = {
    type: 'object',
    properties: {},
    required: []
  }

  component.allOf.forEach(ref => {

    Object.entries(ref.properties).forEach(([title, data]) => {
      reference.properties[title] = data
    })
    
    ref.required.forEach((key) => {
      reference.required.push(key)
    })

  });
  
  return reference
}