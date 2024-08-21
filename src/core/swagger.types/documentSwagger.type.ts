import { Paths } from "./paths.types";
import { Schema } from "./shared.types";




interface Info {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: any;
  license?: any;
  version: string;
}

export type SwaggerApi = {
  openapi: string,
  paths: Paths,
  tags: string[],
  info: Info;
  jsonSchemaDialect?: string;
  servers?: any[];
  components : {
    schemas: Record<string,Schema>
  }
}








