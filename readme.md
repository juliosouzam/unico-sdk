# Unico SDK for Nodejs

## Instalation

```sh
npm install unico-sdk
# or
yarn add unico-sdk
```

## Usage

```js
import { AuthClient, Process, UnicoSecretKey } from "unico-sdk";

const secretKey = new UnicoSecretKey();
secretKey.set("<SECRET_KEY_UNICO>");
const authClient = AuthClient.default();
authClient.setSecretKey(secretKey);
const processes = Process.default(authClient);

processes.createProcess(payload).then((process) => {
  console.log(process); // { Id: '<uuid>' }
});
```
