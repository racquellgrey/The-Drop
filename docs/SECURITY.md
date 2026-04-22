# Security Policy

## Reporting a vulnerability

Please email the team privately rather than opening a public GitHub issue.
Do not include exploit payloads or credentials in the first message.

## What is in scope

- The deployed Vercel app and its `/api/*` endpoints.
- Anything checked into this repository.

## Secret-handling rules (required reading for contributors)

1. **Never** commit a `.env`, `.env.local`, `.env.production`, or any file
   containing a real credential. Only `.env.example` is allowed, and it must
   contain obvious placeholders (`REPLACE_ME_LOCAL_ONLY`, `your_mysql_password_here`).
2. **Never** paste a secret into a PR description, commit message, issue,
   comment, screenshot, or Slack/Discord message.
3. If you accidentally commit a secret:
   - Treat the credential as burned — rotate it at the provider **first**.
   - Then remove the commit (force-push a rewrite or `git filter-repo`).
   - Update `DB_PASSWORD` / any affected env var in Vercel.
   - Announce the rotation to the team.
4. Production secrets live **only** in the Vercel dashboard, scoped per
   environment. The GitHub repo, GitHub Actions, and your laptop never hold
   production secrets.

## Defense-in-depth layers currently in place

| Layer | Mechanism |
| --- | --- |
| Source control | `.gitignore` + `.vercelignore` exclude all `.env` files. `.vscode/settings.json` is untracked. |
| CI | `gitleaks` secret scan blocks any leaked credential on push / PR. |
| CI | `npm audit --audit-level=high` blocks known-vulnerable dependencies. |
| CI | Verifies no `.env*` (except `.env.example`) is tracked. |
| CI | `npm ci --ignore-scripts` prevents hostile `postinstall` scripts during build. |
| Runtime (HTTP) | `helmet` default headers + CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. **Note:** `script-src` allows `'unsafe-inline'` because the coursework frontend uses inline `onclick` handlers. This weakens XSS protection and should be removed once the frontend is migrated to external event listeners. |
| Runtime (HTTP) | CORS enabled with default permissive policy for coursework simplicity. |
| Runtime (HTTP) | Per-IP rate limiting (global + tighter auth bucket). |
| Runtime (app) | JSON body size cap (100 KB). |
| Runtime (app) | All SQL uses parameterised `?` placeholders — no string concat. |
| Runtime (app) | Production error handler never echoes SQL/driver messages. |
| Runtime (app) | `x-powered-by` disabled. |
| Runtime (DB) | TLS enforced (`DB_SSL=true`). |
| Runtime (DB) | Dedicated least-privilege user; no root from the app. |
| Runtime (DB) | Connection pool capped per function instance. |
| Deploy | Vercel's own GitHub integration handles deploys — **no deploy token is stored in GitHub Actions**. |

## Known caveats / follow-ups before real-world use

- Passwords are currently stored in plaintext (`password_hash` column name is
  aspirational) to match the coursework spec. Before any production launch,
  switch to `argon2id` (or `bcrypt`) with per-user salts.
- Sessions are not implemented — the app trusts `user_id` from the client on
  write routes. Add server-side sessions / signed JWTs before opening to real
  users.
- Admin / retailer routes need role-based authorisation; today they only
  require knowing a `retailer_id`.

These are documented here so reviewers know they are intentional, scoped
limitations of the demo rather than overlooked security bugs.
