class Env {
  private envs: Map<string, string> = new Map();

  private static instance: Env;

  private constructor() {
    Object.entries(process.env).forEach(([key, value]) => {
      this.envs.set(key, value as string);
    });
  }

  public static getInstance(): Env {
    if (!Env.instance) {
      Env.instance = new Env();
    }

    return Env.instance;
  }

  public get<T = string>(key: string): T | undefined {
    return this.envs.get(key) as T | undefined;
  }

  public set(key: string, value: string): void {
    this.envs.set(key, value);
  }

  public delete(key: string): void {
    this.envs.delete(key);
  }

  public has(key: string): boolean {
    return this.envs.has(key);
  }
}

export const env = Env.getInstance();
