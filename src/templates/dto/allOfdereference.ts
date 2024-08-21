import { ObjectSchema, Schema } from "@swaggertypes/shared.types";

export const allOfDereference = (component: Schema) => {
  if(!component.allOf) return component

  const reference: Required<Pick<ObjectSchema, 'type' | 'properties' | 'required'>> = {
    type: 'object',
    properties: {},
    required: []
  }

  component.allOf.forEach((ref) => {
    if (!ref.properties) return 

    Object.entries(ref.properties).forEach(([title, data]) => {
      reference.properties[title] = data
    })
    
    ref.required?.forEach((key) => {
      reference.required.push(key)
    })

  });
  
  return reference
}