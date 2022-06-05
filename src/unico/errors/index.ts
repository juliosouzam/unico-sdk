/* eslint-disable max-classes-per-file */
import type { AxiosError } from "axios";

export class MissingArguments extends Error {}

export class UnexpectedState extends Error {}

export class NotFound extends Error {}

export type UnicoErrorType = {
  Code: string;
  Description: string;
};

export class UnicoError extends Error {
  constructor(public error: UnicoErrorType) {
    super(`${error.Code}: ${error.Description ?? "No error message"}`);
  }
}

export class UnicoInvalidParameters extends UnicoError {}

export class UnicoUnauthorized extends UnicoError {}

export class UnicoForbidden extends UnicoError {}

export class UnicoNotFound extends UnicoError {}

export class UnicoInternalError extends UnicoError {}

export class UnicoUnavailable extends UnicoError {}

export function handleUnicoResponseError(
  error: AxiosError<UnicoErrorType>
): never {
  if (!error.response?.data) {
    throw new UnexpectedState(
      `Response has status code ${error.status} but doesn't have 'errors' details in the body`
    );
  }

  switch (error.response.status) {
    case 400:
      throw new UnicoInvalidParameters(error.response.data);

    case 401:
      throw new UnicoUnauthorized(error.response.data);

    case 403:
      throw new UnicoForbidden(error.response.data);

    case 404:
      throw new UnicoNotFound(error.response.data);

    case 500:
      throw new UnicoInternalError(error.response.data);

    case 503:
      throw new UnicoUnavailable(error.response.data);

    default:
      throw new UnexpectedState(
        `Unexpected status code ${error.status} from ${error.config.url}`
      );
  }
}
