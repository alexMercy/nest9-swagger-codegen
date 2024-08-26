Опции, которые могут использоваться в dto в @ApiProperty

```typescript
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    example?: any;
    examples?: any[] | Record<string, any>;
    deprecated?: boolean;
    description?: string;
    format?: string;
    default?: any;
    title?: string;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    required?: string[];
    enum?: any[];
```