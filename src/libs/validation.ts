import type { Schema } from "ajv";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import * as ajvOpenApiFormats from "ajv-openapi/lib/validators";

const ajv = new Ajv();

ajv.addFormat("int32", { type: "number", validate: ajvOpenApiFormats.int32 });
ajv.addFormat("int64", { type: "number", validate: ajvOpenApiFormats.int64 });
ajv.addFormat("float", { type: "number", validate: ajvOpenApiFormats.float });
ajv.addFormat("double", { type: "number", validate: ajvOpenApiFormats.double });
ajv.addFormat("byte", { type: "string", validate: ajvOpenApiFormats.byte });
ajv.addFormat("cpf", {
  type: "string",
  validate: (v: string) => /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(v),
});
ajv.addFormat("date", {
  type: "string",
  validate: (v: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
});
ajv.addFormat("email", {
  type: "string",
  validate: (v: string) =>
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
      v
    ),
});

addFormats(ajv);

export class SchemaValidationError extends Error {
  constructor(public validationErrors: string[]) {
    super(validationErrors.join(", "));
  }
}

export function createValidator(schema: Schema) {
  const validator = ajv.compile(schema);

  return (value: unknown) => {
    if (!validator(value) && validator.errors) {
      throw new SchemaValidationError(
        validator.errors.map((err) => `${err.instancePath} ${err.message}`)
      );
    }
  };
}
