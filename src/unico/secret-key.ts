export class UnicoSecretKey {
  private secretKey: string;

  public set(text: string) {
    this.secretKey = text;
  }

  public get(): string {
    return this.secretKey;
  }
}
