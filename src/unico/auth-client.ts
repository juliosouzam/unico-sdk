import axios, { AxiosError, AxiosInstance } from "axios";
import { addSeconds, isBefore } from "date-fns";
import { sign } from "jsonwebtoken";
import NodeCache from "node-cache";

import { UnexpectedState } from "./errors";
import { env } from "../libs/env";
import { UnicoSecretKey } from "./secret-key";
import { ConsoleLog } from "../libs/logs";
import { ILogger } from "../libs/logs/logs";

export interface IUCredential {
  access_token: string;
  expires_in: number;
  token_type: string;
}

type JWTCredential = {
  token: string;
  expires_in: number;
};

const JWT_EXPIRES_IN_SECONDS = 60;

export class AuthClient {
  private credentials: IUCredential;
  private cache: NodeCache;

  private jwtToken: JWTCredential;

  private secretKey: string;

  public setSecretKey(secretKey: UnicoSecretKey): AuthClient {
    this.secretKey = secretKey.get();

    return this;
  }

  private getSecretKey(): string {
    return this.secretKey;
  }

  public static default() {
    return new this(
      axios.create({
        baseURL: env.get("UNICO_AUTH_URL"),
        validateStatus: () => true,
      }),
      new ConsoleLog()
    );
  }

  constructor(
    private readonly client: AxiosInstance,
    private readonly logger: ILogger
  ) {
    this.cache = new NodeCache();
  }

  public getJwtToken() {
    try {
      const now = new Date();
      const exp = addSeconds(now, JWT_EXPIRES_IN_SECONDS);
      const payload = {
        iss: `${env.get("UNICO_SVC_NAME")}@${env.get(
          "UNICO_TENANT_ID"
        )}.iam.acesso.io`,
        aud: env.get("UNICO_AUTH_URL"),
        scope: "*",
        iat: now.getTime(),
        exp: exp.getTime(),
      };

      const token = sign(payload, this.getSecretKey(), {
        algorithm: "RS256",
      });

      this.cache.set("unico-jwt-token", token, JWT_EXPIRES_IN_SECONDS - 1);

      this.jwtToken = {
        token,
        expires_in: exp.getTime(),
      };
    } catch (error) {
      this.logger.error("FAIL JWT", error);

      throw new UnexpectedState("It was not possible to generate JWT token");
    }
  }

  public async getAccessToken(): Promise<IUCredential> {
    if (this.cache.has("unico-access-token")) {
      return this.cache.get<IUCredential>("unico-access-token") as IUCredential;
    }

    const params = new URLSearchParams();
    params.append("grant_type", env.get("UNICO_GRANT_TYPE") as string);
    params.append("assertion", this.jwtToken.token);
    try {
      const response = await this.client.post<IUCredential>(
        `/oauth2/token`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: () => true,
        }
      );

      this.credentials = response.data;
      this.cache.set(
        "unico-access-token",
        this.credentials,
        this.credentials.expires_in
      );

      return this.credentials;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error("UNICO AUTH", error.response);
      } else {
        this.logger.error("UNICO AUTH", error);
      }

      throw new UnexpectedState("It was not possible to retrieve Unico token");
    }
  }

  public async getCredentials(): Promise<IUCredential> {
    this.getJwtToken();

    if (!this.credentials) {
      return this.getAccessToken();
    }

    const now = new Date();
    const expires = addSeconds(now, this.credentials.expires_in);

    if (isBefore(expires, now)) {
      return this.getAccessToken();
    }

    return this.credentials;
  }

  public async getSignedHeaders() {
    const { access_token } = await this.getCredentials();

    return {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };
  }
}
