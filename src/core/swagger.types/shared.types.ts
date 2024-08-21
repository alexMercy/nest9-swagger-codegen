export type Modify<T, R> = Omit<T, keyof R> & R;
export type XOR<T, U> = (T | U) extends object
  ? (T extends object ? Omit<U, keyof T> : never) & (U extends object ? Omit<T, keyof U> : never)
  : T | U;



export const methods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
} as const

export type $Ref = {
  $ref: string
}

export type RefSchema = XOR<$Ref, Schema>


export type Schema = XOR<ArraySchema, XOR<ObjectSchema, NonArraySchema>>

type NonArraySchemaType = 'boolean' | 'number' | 'string' | 'integer';
type ArraySchemaType = 'array';
type ObjectSchemaType = 'object';


export interface ArraySchema extends BaseSchema {
  type: ArraySchemaType;
  items: RefSchema;
}
export interface NonArraySchema extends BaseSchema {
  type: NonArraySchemaType;
}

export interface ObjectSchema extends Modify<BaseSchema, {
  properties: {[name: string]: RefSchema};
}> {
  type: ObjectSchemaType;
}

interface BaseSchema {
  refType?: string
  title?: string;
  description?: string;
  format?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalProperties?: XOR<boolean,RefSchema>;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  properties?: {
      [name: string]: RefSchema;
  };
  allOf?: RefSchema[];
  anyOf?: RefSchema[];
  oneOf?: RefSchema[];
  not?: RefSchema;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: any;
  deprecated?: boolean;
}
