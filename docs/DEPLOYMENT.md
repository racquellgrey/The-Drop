# Deployment Guide — Vercel (security-first)

This document walks you through deploying **The Drop** to Vercel without
ever committing a secret to this public repository.

---

## 1. Architecture on Vercel

```
Browser ──► Vercel Edge ──► (static files in /frontend)
                     │
                     └──► /api/*  ──► Serverless fn (api/index.js → backend/app.js)
                                                      │
                                                      └──► Managed MySQL (TLS)
```

- `frontend/` is served as static files by Vercel's edge.
- `api/index.js` wraps the Express app from `backend/app.js` as a single
  serverless function.
- The MySQL database is **not** hosted on Vercel — you provision it on a
  managed provider (see section 3) and point env vars at it.

---

## 2. Pick a managed MySQL provider

Vercel serverless functions are ephemeral, so a local MySQL won't work.
Recommended options (all have free tiers as of this writing):

| Provider        | Notes                                                      |
| --------------- | ---------------------------------------------------------- |
| **Aiven**       | Real MySQL 8, TLS by default, simple.                      |
| **Railway**     | MySQL or Postgres, one-click, TLS optional.                |
| **TiDB Cloud**  | MySQL-compatible, generous serverless free tier.           |
| **AWS RDS**     | Full-fat, requires VPC/IAM work.                           |

Whichever you choose:

1. Create a MySQL 8 instance.
2. Create a dedicated database user with **only** the privileges your app
   needs (SELECT / INSERT / UPDATE / DELETE on the `thedrop` database — no
   DROP, no GRANT, no root).
3. Enable TLS and restrict inbound IPs if the provider allows it.
4. Load the schema and seed data from your laptop:

   ```bash
   mysql -h <host> -P <port> -u <user> -p --ssl-mode=REQUIRED thedrop < db/schema.sql
   mysql -h <host> -P <port> -u <user> -p --ssl-mode=REQUIRED thedrop < db/seed.sql
   ```

---

## 3. Create the Vercel project

1. Push this repo to GitHub (you've already done that).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the
   GitHub repo.
3. Framework preset: **Other**. Vercel will read `vercel.json` for the rest.
4. Leave the default build / install commands — `vercel.json` overrides
   them.
5. Do **not** deploy yet. Click **Environment Variables** first.

---

## 4. Configure environment variables (the critical step)

Add these variables in **Vercel → Project → Settings → Environment
Variables**, selecting the appropriate scopes (Production, Preview,
Development):

| Name                   | Production     | Preview        | Notes                                          |
| ---------------------- | -------------- | -------------- | ---------------------------------------------- |
| `DB_HOST`              | required       | required       | Managed DB hostname                            |
| `DB_PORT`              | `3306`         | `3306`         | Or whatever the provider gives you             |
| `DB_USER`              | required       | required       | Non-root, least-privilege user                 |
| `DB_PASSWORD`          | required       | required       | Mark as **Sensitive** in the Vercel UI         |
| `DB_NAME`              | `thedrop`      | `thedrop_preview` | Use a **separate DB** for preview deploys   |
| `DB_SSL`               | `true`         | `true`         | Must be `true` in all hosted envs              |
| `DB_CONNECTION_LIMIT`  | `3`            | `3`            | Keep small — serverless concurrency is high   |
| `ALLOWED_ORIGINS`      | your prod URL  | *(blank)*      | Comma-separated list, no trailing slash        |
| `NODE_ENV`             | *(auto)*       | *(auto)*       | Vercel sets this; do NOT override              |

> **Never** paste a secret into the repo, a PR description, a Slack message,
> or a screenshot. Use the Vercel dashboard only.

After saving, trigger a deploy from the Vercel UI or by pushing to `main`.

---

## 5. How the deploy pipeline works

```
   ┌──────────────────────────────┐
   │   git push / open a PR       │
   └──────────────┬───────────────┘
                  ▼
   ┌──────────────────────────────┐
   │  GitHub Actions (.github/    │
   │    workflows/ci.yml)         │
   │  - gitleaks secret scan      │
   │  - verify no .env tracked    │
   │  - npm ci --ignore-scripts   │
   │  - node --check + npm audit  │
   │  - validate vercel.json      │
   └──────────────┬───────────────┘
                  ▼           (in parallel)
   ┌──────────────────────────────┐
   │  Vercel Git integration      │
   │  - PR → Preview deployment   │
   │  - main → Production         │
   │  Env vars injected by Vercel │
   │  (NEVER stored in GitHub)    │
   └──────────────────────────────┘
```

Key property: **GitHub Actions holds zero deploy credentials.** Vercel's
first-party Git integration deploys using its own scoped access, so even if
a GitHub workflow were compromised, it could not deploy rogue code or
exfiltrate `DB_PASSWORD` — those secrets live in Vercel and are only
injected into the serverless runtime.

If you want CI to block merges on its own checks, add a branch
protection rule on `main` requiring the `CI / *` jobs to pass.

---

## 6. Post-deploy verification checklist

After your first production deploy, verify:

- [ ] `GET https://<your-app>.vercel.app/` returns the landing page.
- [ ] `GET https://<your-app>.vercel.app/status` returns `{"connected":true}`.
- [ ] `GET https://<your-app>.vercel.app/api/stats` returns live counts.
- [ ] Response headers include `strict-transport-security`,
      `x-content-type-options: nosniff`, `x-frame-options: DENY`, and a
      `content-security-policy`.
- [ ] Requesting `/api/login` 20 times in a row from the same IP returns
      `429 Too Many Requests` after the 10th call.
- [ ] A forced 500 (e.g. bad SQL) does **not** echo the SQL error to the
      client in production — you should see only `"Internal server error."`.
- [ ] `curl -H "Origin: https://evil.example" https://<your-app>.vercel.app/api/stats`
      is rejected unless you explicitly allow-listed that origin.

---

## 7. Rotation & incident response

If you suspect a credential has leaked:

1. **Rotate the DB password immediately** at the provider.
2. Update `DB_PASSWORD` in Vercel (all three scopes).
3. Redeploy (Vercel → Deployments → "Redeploy").
4. Check the DB provider's audit log for unknown IPs.
5. Open a GitHub Security Advisory on the repo if customer data could be
   affected.

Never commit an "old" value "just for history" — remove it everywhere.
