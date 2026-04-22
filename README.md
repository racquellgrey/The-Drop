# The Drop

A limited-edition sneaker drop platform built for Introduction to Database Management Systems

The Drop lets shoppers browse upcoming product drops, request access, and make purchases. Retailers get a separate dashboard to manage their products, drops, and orders. The backend is a Node.js/Express REST API backed by a MySQL relational database.

**Team:** Mehak Jit, Racquell Grey, Logan McKay, Theo Wallace

---

## Project Structure

```text
The-Drop/
├── api/
│   └── index.js          # Vercel serverless entry (wraps backend/app.js)
├── backend/
│   ├── app.js            # Express app (exported, no listen)
│   ├── server.js         # Local-only dev entry (listens on :5000)
│   ├── db.js             # Pooled MySQL access (serverless-safe)
│   └── .env.example      # Local env template — NEVER commit a real .env
├── frontend/             # Vanilla HTML/CSS/JS client (served statically)
├── db/
│   ├── schema.sql        # Table definitions
│   └── seed.sql          # Sample data
├── docs/
│   ├── DEPLOYMENT.md     # Step-by-step Vercel deploy guide
│   └── SECURITY.md       # Secret-handling rules + defense-in-depth list
├── .github/workflows/
│   └── ci.yml            # Secret scan, audit, syntax check
├── vercel.json           # Vercel routing, headers, function config
└── .vercelignore         # Files NOT uploaded to Vercel
```env

---

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+

### 1. Clone the repository

```bash
git clone https://github.com/racquellgrey/The-Drop.git
cd The-Drop
```

### 2. Create and populate the database

Log in to MySQL and run the schema and seed files:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS thedrop;"
mysql -u root -p thedrop < db/schema.sql
mysql -u root -p thedrop < db/seed.sql
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=thedrop

PORT=5000
```

### 4. Install dependencies and start the server

```bash
cd backend
npm install
npm run dev      # uses nodemon for auto-reload
# or
npm start        # plain node
```

The server will start at **[http://localhost:5000](http://localhost:5000)**, serving the frontend
statically and the API at `/api/*`.

---

## Deployment (Vercel)

Full walk-through: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

Quick version:

1. Provision a managed MySQL (Aiven / Railway / TiDB Cloud / RDS) with a
   least-privilege user and TLS enabled.
2. Import the repo on [vercel.com](https://vercel.com) — framework preset
   "Other". `vercel.json` handles the rest.
3. Add env vars in **Vercel → Settings → Environment Variables**
   (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`,
   `ALLOWED_ORIGINS`). Mark `DB_PASSWORD` as Sensitive.
4. Add GitHub repository secrets so Actions can deploy to the exact Vercel
   project:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
5. Push to `main` for production deploys. Open a PR for preview deploys.
   GitHub Actions now runs CI first, then deploys with Vercel CLI.

You can get org/project IDs by running locally once in this repo:

```bash
vercel link
cat .vercel/project.json
```

Then copy those values into GitHub Secrets and keep `.vercel/` untracked.

---

## Security

See **[docs/SECURITY.md](docs/SECURITY.md)** for the full policy, including:

- Rules for handling secrets in this public repository.
- The defense-in-depth layers currently enforced (helmet, rate limits,
  CORS allow-list, CSP, HSTS, TLS to the DB, parameterised queries, etc.).
- Known limitations of this coursework demo and what would need to change
  before a real-world launch.

The frontend is served statically from the same port — open **[http://localhost:5000](http://localhost:5000)** in your browser.
