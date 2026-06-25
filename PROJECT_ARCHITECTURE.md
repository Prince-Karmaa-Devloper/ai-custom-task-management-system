# AI-Powered Task Management System — Architecture & Integration Guide

This document describes how the frontend, backend, databases, integrations, and local LLM (Ollama) fit together for this project.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Communication Channels                          │
│              Email  ·  Slack  ·  WhatsApp  ·  (future)                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ webhooks / polling
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Node.js Backend (Express)                           │
│  /api/auth  /api/tenants  /api/dashboard  /api/users  /api/tickets    │
│  /api/integrations  /api/projects  /api/reports                        │
└───────┬──────────────────────────────┬──────────────────────────────────┘
        │                              │
        ▼                              ▼
┌───────────────────┐         ┌────────────────────┐
│  PostgreSQL Main  │         │  Ollama (Local)    │
│  todolist_main     │         │  http://localhost  │
│  companies, super admins│   │  :11434            │
└─────────┬─────────┘         └────────────────────┘
          │ per-tenant DB
          ▼
┌───────────────────┐
│ todolist_<domain>  │  tickets, projects, users, integrations, reports
└───────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│              React Frontend (Vite) — http://127.0.0.1:3000/3001         │
│  Redux store · role-based UI · white-label branding · dashboards        │
│  Manual ticket creation · Reports · CSV export                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | SPA UI |
| UI | Material UI (MUI) | Components & theming |
| State | Redux Toolkit | Auth, users, tickets, white-label, tenants |
| Backend | Node.js + Express | REST API |
| Main DB | PostgreSQL + Prisma (`prisma-main`) | Companies, super admins, audit logs |
| Tenant DB | PostgreSQL + Prisma (`prisma-tenant`) | Per-company business data |
| Auth | JWT (access + refresh tokens) | Secure API access |
| Local LLM | Ollama | On-prem AI for extraction, suggestions, writing |

---

## 3. Running the Project Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 3.1 Database Setup & Seeding

Use the automated setup script to initialize the database:
```bash
cd backend
node setup-database.js
```

This will:
1. Clean up existing unwanted data
2. Create default companies (Developer, Karmaa Source, Admoni)
3. Seed each company with users (Admin, Manager, Employee) and sample tickets

### 3.2 Backend

```bash
cd backend
npm install
npm start
```

API: `http://localhost:5000`

`.env` key variables (`backend/.env`):
```env
MAIN_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_main?schema=public"
TENANT_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_template?schema=public"
JWT_SECRET="your_super_secret_jwt_secret_key_change_this_in_production"
JWT_REFRESH_SECRET="your_super_secret_refresh_token_secret_change_this"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001"
DB_ADMIN_HOST="localhost"
DB_ADMIN_PORT=5432
DB_ADMIN_USER="postgres"
DB_ADMIN_PASSWORD="root"
DB_ADMIN_DATABASE="postgres"
```

### 3.3 Frontend

```bash
# project root
npm install
npm run dev
```

App: `http://127.0.0.1:3000` (or next available port like 3001 if 3000 is in use)

Frontend API base URL (`src/services/api.js`):
```js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

Optional `.env` in project root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.4 Default Users and Companies

#### Super Admin (Global Access)
- **Login URL**: `http://127.0.0.1:3000/login` (no tenant prefix)
- **Email**: `superadmin@test.com`
- **Password**: `12345678`
- **Role**: `superadmin`

#### Karmaa Source Company
- **Login URL**: `http://127.0.0.1:3000/karmaa-source/login`
- **Domain**: `karmaa-source`
- **Database**: `todolist_karmaa-source`

| Role       | Email                  | Password  | Name               |
|------------|------------------------|-----------|--------------------|
| Admin      | admin@karmaa.com       | 12345678  | Karmaa Admin       |
| Manager    | manager@karmaa.com     | 1234567   | Karmaa Manager     |
| Employee   | employee@karmaa.com    | 123456    | Karmaa Employee    |

#### Admoni Company
- **Login URL**: `http://127.0.0.1:3000/admoni/login`
- **Domain**: `admoni`
- **Database**: `todolist_admoni`

| Role       | Email                  | Password  | Name               |
|------------|------------------------|-----------|--------------------|
| Admin      | admin@admoni.com       | 12345678  | Admoni Admin       |
| Manager    | manager@admoni.com     | 1234567   | Admoni Manager     |
| Employee   | employee@admoni.com    | 123456    | Admoni Employee    |

### 3.5 Super Admin Features
- **Root URL access**: No tenant domain prefix (`/login`, `/dashboard`, `/users`)
- **Create new companies**: When adding an Admin user, extra fields for Company Name and Domain appear
- **Company statistics**: Dashboard cards showing all companies and user breakdown (Admins, Managers, Employees, Total)
- **User stats in users table**: Each user row shows quick tenant user counts

---

## 4. Database Architecture (Multi-Tenant)

### Main database (`todolist_main`)
Stores platform-level data:

| Model | Purpose |
|---|---|
| `Company` | Company account, domain, isolated DB name, subscription type |
| `SuperAdmin` | Global super admin login identity (email, password, name) |
| `CompanyAuditLog` | Audit trail of company management operations |
| `GlobalSetting` | Global configuration settings |

### Tenant database (`todolist_<domain>`)
One database per company. Stores:

| Data | Examples |
|---|---|
| Users (org hierarchy) | admin → manager → employee |
| Tickets | title, status, assignee, URLs, source, managedBy |
| Projects / Sites | mapping for auto-assignment |
| Integrations | Email, Slack, WhatsApp config |
| Reports | performance, exports |

#### Ticket Table Schema
Includes the following key fields:
- `createdBy`: User ID who created the ticket
- `assignedTo`: User ID who the ticket is assigned to
- `managedBy`: User ID (manager) overseeing the ticket
- `source`: Source of the ticket (Email, Slack, Basecamp, Manual)
- `status`: Ticket status (Pending, In Progress, Completed, Posted, Reassigned)
- `priority`: Ticket priority (Low, Medium, High, Critical)

### Hierarchy rules (matches UI)

| Role | Can create | Must report to |
|---|---|---|
| Super Admin | Admin, Manager, Employee | — |
| Admin | Manager, Employee | Super Admin (for new admins) |
| Manager | Employee | Admin |
| Employee | — | Manager |

---

## 5. Frontend ↔ Backend Connection

```
Browser (React)
    │  axios + JWT in Authorization header
    ▼
http://localhost:5000/api/*
    │
    ├── POST /auth/login        → { user, accessToken, refreshToken }
    ├── POST /auth/refresh      → new accessToken
    ├── GET  /dashboard/stats   → role-based KPIs
    ├── GET  /dashboard/charts  → chart data
    ├── POST /tenants/create    → new company (superadmin)
    ├── /users, /tickets, /projects, /integrations, /reports
```

### Auth flow
1. User logs in → tokens + user saved to Redux (localStorage not used for initial data)
2. `api.js` interceptor attaches `Bearer <accessToken>` to every request
3. On 403, refresh token is used automatically
4. Redux `authSlice` holds current user and role (normalized to lowercase without underscores) for route/menu access

### Role Normalization
Backend roles like `SUPER_ADMIN` are normalized to `superadmin` in the frontend for consistent UI logic.

### CORS
Backend must allow the frontend origin. Current config supports:
- `http://127.0.0.1:3000`
- `http://localhost:3000`
- `http://127.0.0.1:3001`
- `http://localhost:3001`

---

## 6. Key Features

### 6.1 Manual Ticket Creation
- Form available in Tickets page
- Fields: Title, Description, Project, Source, Status, Priority, Managed By, Assigned To
- Data dynamically loaded from API (users and projects)

### 6.2 Reports & Analytics
- Dynamic reports showing tickets and users filtered by current tenant
- CSV export functionality for reports
- Real-time data from API

### 6.3 White Label Branding
Settings are saved in Redux and tenant database.

| Setting | Where it appears |
|---|---|
| Company Name | Sidebar, login page title |
| Dashboard Title | Top app bar |
| Logo | Login page, sidebar, preview |
| Primary / Secondary colors | Login gradient, app bar, buttons, MUI theme |

**Path:** White Label page → Save Settings → live update.

---

## 7. Connecting Ollama (Local LLM)

### 7.1 Install Ollama

1. Download from [https://ollama.com](https://ollama.com)
2. Install and start the Ollama service
3. Pull a model:

```bash
ollama pull llama3.2
# or: mistral, codellama, phi3, etc.
```

Verify:
```bash
curl http://localhost:11434/api/tags
```

### 7.2 Backend AI service (recommended pattern)

Create `backend/src/services/ollamaService.js`:

```js
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function chat(prompt, systemPrompt = '') {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });
  const data = await response.json();
  return data.message?.content || '';
}

module.exports = { chat };
```

### 7.3 AI use cases in this system

| Phase | Ollama task | Input | Output |
|---|---|---|---|
| 1 – Channels | Extract tasks from messages | Email/Slack/WhatsApp text | Structured JSON |
| 2 – Tickets | Auto-create tickets | Extracted task JSON | Ticket record |
| 3 – App | Task suggestions | Ticket + employee skills | Steps, ETA, best practices |
| 3 – App | Writing assistant | Draft report/notes | Polished professional text |
| 3 – App | Smart assignment | Skills, workload, history | Recommended assignee |
| 3 – App | Performance analysis | Ticket metrics | Manager/admin reports |

---

## 8. Project Structure

```
├── backend/
│   ├── prisma-main/         # Prisma schema & migrations for main DB
│   ├── prisma-tenant/       # Prisma schema & migrations for tenant DBs
│   ├── src/
│   │   ├── config/
│   │   │   └── dbManager.js # Dynamic tenant DB connection & creation
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Auth middleware
│   │   └── app.js           # Backend entrypoint
│   ├── setup-database.js    # Automated DB setup & seeding
│   ├── SETUP_GUIDE.md       # Detailed DB setup guide
│   └── package.json
│
└── src/                     # Frontend
    ├── api/                 # API client modules
    ├── components/          # Reusable UI components
    ├── hooks/               # Custom React hooks
    ├── layouts/             # Page layouts (Auth, Dashboard)
    ├── pages/               # Application pages
    ├── services/            # Business logic services
    ├── store/               # Redux slices
    ├── theme/               # MUI theme config
    ├── utils/               # Utility functions
    ├── App.jsx
    └── main.jsx
```

---

## 9. Key File Reference

| Area | Path |
|---|---|
| Frontend entry | `src/main.jsx`, `src/App.jsx` |
| API client | `src/services/api.js` |
| Auth state | `src/store/authSlice.js` |
| Ticket service | `src/services/ticketService.js` |
| Ticket page | `src/pages/Tickets/Tickets.jsx` |
| User hierarchy utils | `src/utils/userHierarchy.js` |
| White label | `src/store/whiteLabelSlice.js`, `src/pages/WhiteLabel/WhiteLabel.jsx` |
| Backend entry | `backend/src/app.js` |
| Auth API | `backend/src/controllers/authController.js` |
| Tenant DB manager | `backend/src/config/dbManager.js` |
| Main Prisma schema | `backend/prisma-main/schema.prisma` |
| Tenant Prisma schema | `backend/prisma-tenant/schema.prisma` |
| DB setup | `backend/setup-database.js` |
| DB setup guide | `backend/SETUP_GUIDE.md` |

---

## 10. Troubleshooting

| Issue | Fix |
|---|---|
| `EADDRINUSE :5000` | Kill stale `node.exe` or stop old backend terminal |
| `ERR_CONNECTION_REFUSED :3000` | Run `npm run dev` in project root |
| CORS blocked | Set `CORS_ORIGIN` in `backend/.env` to match frontend URL |
| Dashboard 404 | Ensure `/api/dashboard` routes registered in `app.js` |
| Users menu missing | Log out/in; user.role must be set in Redux |
| Logo not showing | Click **Save Settings** on White Label page |
| Import errors (data folder) | Fixed - static data removed, all data from API |

---

## 11. Security Notes

- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- Never expose Ollama directly to the public internet
- Store integration tokens encrypted per tenant
- Use HTTPS in production
- Enforce row-level tenant isolation in all tenant DB queries
- All user passwords are hashed using bcrypt

---

*Last updated: June 2026 — aligns with current codebase structure.*
