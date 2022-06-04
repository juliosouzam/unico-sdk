import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

import { ILogger } from "../libs/logs/logs";
import { AuthClient } from "./auth-client";

interface IUnicoRequestConfig {
  accessToken: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  scope?: string;
}

export type AxiosRequestConfigWithMetadata = AxiosRequestConfig & {
  startTime?: number;
  endTime?: number;
};

export type AxiosResponseWithMetadata = AxiosResponse & {
  config: AxiosRequestConfigWithMetadata;
};

export abstract class UnicoClient {
  constructor(
    protected client: AxiosInstance,
    protected auth: AuthClient,
    protected logger: ILogger
  ) {
    this.client.interceptors.request.use(
      (config: AxiosRequestConfigWithMetadata) => {
        config.startTime = Date.now();

        return config;
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponseWithMetadata) => {
        response.config.endTime = Date.now();

        logger.info("UNICO INTEGRATION", {
          requestBaseURL: response.config.baseURL,
          requestHeaders: response.config.headers,
          // requestBody: response.config.data,
          responseData: response.data,
          responseHeader: response.headers,
          duration:
            response.config.startTime && response.config.endTime
              ? response.config.endTime - response.config.startTime
              : -1,
          status: response.status,
          method: response.config.method,
          url: response.config.url,
        });

        return response;
      }
    );

    axiosRetry(this.client, { retries: 3 });
  }

  public async request<T>(
    config: IUnicoRequestConfig
  ): Promise<AxiosResponse<T>> {
    const { method, path, body } = config;

    const headers = await this.auth.getSignedHeaders();

    return this.client({
      url: path,
      method,
      data: body,
      headers,
      validateStatus: () => true,
    });
  }
}
