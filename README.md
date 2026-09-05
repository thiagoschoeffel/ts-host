# TS Host

Aplicação shell responsável por layout, autenticação, navegação e composição dos
três módulos federados: Operação, Comercial e Gestão. As URLs dos remotes são
configuráveis por ambiente, com os fallbacks locais definidos em `vite.config.ts`.

## GitHub Packages authentication

The `@thiagoschoeffel/ts-components` dependency is hosted on GitHub Packages.
Before installing dependencies on a new computer, create a GitHub personal
access token (classic) with the `read:packages` scope and authenticate npm:

```bash
npm login --scope=@thiagoschoeffel --auth-type=legacy --registry=https://npm.pkg.github.com
```

Use your GitHub username, the token as the password, and the email address from
your GitHub account. The credential is stored in the user-level `~/.npmrc`; do
not add the token to this repository.

Then install and start the application:

```bash
npm install
npm run dev
```

The application runs at http://localhost:4173.

## Module Federation

Os remotes locais são carregados por padrão nestes endereços:

```text
Operação  http://localhost:4174/remoteEntry.js
Comercial http://localhost:4175/remoteEntry.js
Gestão    http://localhost:4176/remoteEntry.js
```

Para outro ambiente, configure `VITE_OPERATION_REMOTE_URL`,
`VITE_COMMERCIAL_REMOTE_URL` e `VITE_MANAGEMENT_REMOTE_URL`. Consulte
`.env.example` para a configuração completa.

## Authentication

The shell authenticates with an OpenID Connect provider using Authorization Code + PKCE, validates the platform session through the API and keeps tokens in `sessionStorage`. Configure:

```dotenv
VITE_API_URL=http://localhost:8080
VITE_OIDC_AUTHORITY=http://localhost:8081/realms/sabor-sante
VITE_OIDC_CLIENT_ID=ts-host
```

The local Keycloak realm is provided by `../ts-api/compose.yaml`. The organization selector only requests a change: the API validates the active membership before accepting it, and the shell remounts federated content after a confirmed change.

## Label printing

The host centralizes the printer configuration used by Packing and Frozen
Stock. For direct printing, make Zebra Browser Print available and configure:

```dotenv
VITE_LABEL_PRINT_MODE=zebra
VITE_ZEBRA_BROWSER_PRINT_SCRIPT=/vendor/BrowserPrint.min.js
VITE_ZEBRA_DPI=203
```

`browser` always opens the browser print dialog. `auto` uses Zebra when it is
available and falls back to the browser otherwise.

Em produção, configure as URLs publicadas dos remotes pelas variáveis de
ambiente; não é necessário alterar o código-fonte.

## Operação da V1

O build bloqueia regressões de tamanho com `npm run check:bundle`. Os remotes e
o design system usam versões singleton estritas; falhas federadas são
apresentadas ao usuário e enviadas à captura central de erros. Deploy, cache de
`remoteEntry.js`, correlação, métricas e rollback estão definidos em
[docs/OPERACAO_V1.md](docs/OPERACAO_V1.md).
