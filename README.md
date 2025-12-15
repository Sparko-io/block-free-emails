# @sparko-ai/block-free-emails

Better Auth plugin that blocks sign-ups (or magic link requests) coming from disposable or free email providers.  
It ships with a maintained list of common domains and gives you hooks to fully customize how domains are allowed.

## Features
- 🔒 Uses the curated `FREE_EMAIL_DOMAINS` list out of the box.
- 🚫 Blocks via a configurable blocklist or flips to allowlist mode when you need to restrict access to corporate domains.
- 🧩 Accepts a custom validator for advanced policies (regex, database checks, etc.).
- ♻️ Works as a normal Better Auth plugin – simply drop it into your `betterAuth` configuration.

## Installation

```bash
pnpm add @sparko-ai/block-free-emails
# or
npm install @sparko-ai/block-free-emails
# or
yarn add @sparko-ai/block-free-emails
```

## Quick start

```ts
import { betterAuth } from "better-auth";
import { blockFreeEmails } from "@sparko-ai/block-free-emails";

export const auth = betterAuth({
  plugins: [
    blockFreeEmails({
      customErrorMessage: "Use your company email so we can verify employment."
    })
  ]
});
```

When a user enters an email belonging to one of the known free providers, an `APIError` with the provided message is thrown before the request continues.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `blockedDomains` | `string[]` | `FREE_EMAIL_DOMAINS` | Domains that should be rejected. Extend or replace the default list. |
| `allowedDomains` | `string[]` | `[]` | Switches the plugin to allowlist mode – only these domains are accepted. |
| `customErrorMessage` | `string` | `"Please use your corporate email address. Free email providers are not allowed."` | Message returned to the user when a domain is blocked. |
| `blockOnSignIn` | `boolean` | `true` | Placeholder for future flows. The current implementation always runs on the magic-link sign-in route – keep this `true` for forward compatibility. |
| `customValidator` | `(email, domain) => boolean \| Promise<boolean>` | `undefined` | Run any custom logic. Return `false` to block the request even if the domain is normally allowed. |

The evaluation order is:

1. `customValidator` (if defined)
2. `allowedDomains` allowlist check
3. `blockedDomains` blocklist check

## Helper utilities

```ts
import { isFreeEmailDomain, FREE_EMAIL_DOMAINS } from "@sparko-ai/block-free-emails";

isFreeEmailDomain("user@gmail.com"); // true
FREE_EMAIL_DOMAINS.includes("outlook.com"); // ✔ up-to-date list
```

Use these helpers if you need to run validation outside of Better Auth (e.g., in a marketing form or CRM sync).

## Scripts

```bash
pnpm run build       # bundles to dist/ with tsup
pnpm run dev         # watch mode
pnpm run lint        # eslint over src/
pnpm run type-check  # strict TypeScript compile
```

## License

MIT © Sparko
