import { $Ref, methods, RefSchema, XOR } from "./shared.types";

export type Paths = Record<string, Path>
type Path = Record<typeof methods[keyof typeof methods], Operation>

export type Operation = {
  parameters?: XOR<$Ref, Parameter>[];
  responses: Responses;
  requestBody?: XOR<$Ref, RequestBody>;
  tags?: string[];

  summary?: string;
  description?: string;
  externalDocs?: any;
  operationId?: string;
  deprecated?: boolean;
};


type Parameter =  {
  name: string;
  in: 'path' | 'query';
  schema: RefSchema;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  example?: any;
}

interface RequestBody {
  description?: string;
  content: {
    [media: string]: MediaType;
  };
  required?: boolean;
}

interface MediaType {
  schema: RefSchema;
  example?: any;
}

type Responses = Record<string, XOR<$Ref, Response>>
interface Response {
  description?: string;
  content: {
      [media: string]: MediaType;
  };
}