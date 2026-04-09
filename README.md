# The Drop

A limited-edition sneaker drop platform built for Introduction to Database Management Systems

The Drop lets shoppers browse upcoming product drops, request access, and make purchases. Retailers get a separate dashboard to manage their products, drops, and orders. The backend is a Node.js/Express REST API backed by a MySQL relational database.

**Team:** Mehak Jit, Racquell Grey, Logan McKay, Theo Wallace

---

## Project Structure

```
The-Drop/
├── backend/          # Express API server
├── frontend/         # Vanilla HTML/CSS/JS client
└── db/
    ├── schema.sql    # Table definitions
    └── seed.sql      # Sample data
```

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

```
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

The server will start at **http://localhost:5000**.

The frontend is served statically from the same port — open **http://localhost:5000** in your browser.
