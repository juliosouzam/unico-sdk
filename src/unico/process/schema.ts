import { AsTyped } from "as-typed";
import { createValidator } from "../../libs/validation";

const fullSchema = <const>{
  definitions: {
    CreateProcessRequest: {
      type: "object",
      required: ["subject", "onlySelfie", "imagebase64"],
      properties: {
        subject: { $ref: "#/definitions/CreateProcessSubject" },
        onlySelfie: { type: "boolean" },
        webHookUrl: { type: "string" },
        webHookSecret: { type: "string" },
        withMask: { type: "boolean" },
        imagebase64: { type: "string" },
      },
    },
    CreateProcessSubject: {
      type: "object",
      required: ["Code", "Name"],
      properties: {
        Code: { type: "string" },
        Name: { type: "string" },
        Gender: { type: "string", enum: ["F", "M"] },
        BirthDate: { type: "string" },
        Email: { type: "string" },
        Phone: { type: "integer" },
      },
    },
    CreateProcessResponse: {
      type: "object",
      properties: {
        Id: { type: "string" },
      },
      required: ["Id"],
    },
    GetProcessRequest: {
      type: "object",
      required: ["Id"],
      properties: {
        Id: { type: "string" },
      },
    },
    GetProcessResponse: {
      type: "object",
      required: [
        "HasBiometry",
        "Id",
        "Liveness",
        "Status",
        "OCRCode",
        "FaceMatch",
      ],
      properties: {
        HasBiometry: { type: "boolean" },
        Id: { type: "string" },
        Liveness: { type: "integer" },
        Score: { type: "integer" },
        Status: { type: "integer" },
        OCRCode: { type: "integer" },
        FaceMatch: { type: "integer" },
      },
    },
    Error: {
      type: "object",
      properties: {
        Code: { type: "string" },
        Description: { type: "string" },
      },
      required: ["Code", "Description"],
    },
  },
};

export type CreateProcessRequest = AsTyped<
  typeof fullSchema & typeof fullSchema.definitions.CreateProcessRequest
>;

export type CreateProcessResponse = AsTyped<
  typeof fullSchema & typeof fullSchema.definitions.CreateProcessResponse
>;

export type GetProcessRequest = AsTyped<
  typeof fullSchema & typeof fullSchema.definitions.GetProcessRequest
>;

export type GetProcessResponse = AsTyped<
  typeof fullSchema & typeof fullSchema.definitions.GetProcessResponse
>;

export const validateCreateProcessResponse = createValidator({
  ...fullSchema,
  ...fullSchema.definitions.CreateProcessResponse,
});
