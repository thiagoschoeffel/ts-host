# TS Host

An independent application responsible for the layout and navigation. It loads
the remote module from the URL configured in `vite.config.ts`.

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

For production, change the `entry` property to the published module URL.
