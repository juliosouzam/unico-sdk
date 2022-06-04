import axios, { AxiosError, AxiosInstance } from "axios";
import { env } from "../../libs/env";
import { ConsoleLog } from "../../libs/logs";
import { ILogger } from "../../libs/logs/logs";
import { sleep } from "../../libs/utils";

import { AuthClient } from "../auth-client";
import { handleUnicoResponseError, UnexpectedState } from "../errors";
import { UnicoClient } from "../unico-client";
import {
  CreateProcessRequest,
  CreateProcessResponse,
  GetProcessRequest,
  GetProcessResponse,
  validateCreateProcessResponse,
} from "./schema";

export class Process extends UnicoClient {
  public static default(authClient: AuthClient) {
    return new this(
      axios.create({
        baseURL: env.get("UNICO_BASE_URL"),
        validateStatus: () => true,
      }),
      authClient,
      new ConsoleLog()
    );
  }

  constructor(
    protected client: AxiosInstance,
    protected auth: AuthClient,
    protected readonly logger: ILogger
  ) {
    super(client, auth, logger);
  }

  public async createProcess(
    request: CreateProcessRequest
  ): Promise<CreateProcessResponse> {
    try {
      const response = await this.client.post<CreateProcessResponse>(
        "services/v3/AcessoService.svc/processes",
        request,
        {
          headers: {
            ...(await this.auth.getSignedHeaders()),
            apikey: env.get("UNICO_API_KEY") as string,
          },
        }
      );

      this.logger.debug("RESPONSE", response.data);

      validateCreateProcessResponse(response.data);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 403:
            return this.createProcess(request);

          case 429:
            await sleep(1000);

            return this.createProcess(request);

          default:
            handleUnicoResponseError(error);
        }
      }

      this.logger.error("ERROR", error);
      throw new UnexpectedState("It was not possible to create process");
    }
  }

  public async getProcess(
    request: GetProcessRequest
  ): Promise<GetProcessResponse> {
    try {
      const { Id } = request;
      const response = await this.client.get<GetProcessResponse>(
        `services/v3/AcessoService.svc/processes/${Id}`,
        {
          headers: {
            ...(await this.auth.getSignedHeaders()),
            apikey: env.get("UNICO_API_KEY") as string,
          },
        }
      );

      validateCreateProcessResponse(response.data);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 403:
            return this.getProcess(request);

          case 429:
            await sleep(2000);

            return this.getProcess(request);

          default:
            handleUnicoResponseError(error);
        }
      }

      this.logger.error("ERROR", error);
      throw new UnexpectedState("It was not possible to get process");
    }
  }
}
