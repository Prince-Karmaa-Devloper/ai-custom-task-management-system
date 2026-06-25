# 🚀 Multi-Database Multi-Tenant Setup Guide

## Architecture Overview
- **Main DB**: `todolist_main` - Stores companies (tenants), super admins, company audit logs
- **Tenant DBs**: Each company has its own database (`todolist_<domain>`) - Stores all business data (users, projects, tickets, etc.)

## Step 1: Database Setup

### Prerequisites
- PostgreSQL installed and running
- Update `.env` file with your PostgreSQL credentials

### Environment Variables (`.env` file)
```env
MAIN_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_main?schema=public"
TENANT_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_template?schema=public"
JWT_SECRET="your_super_secret_jwt_secret_key_change_this_in_production"
PORT=5000
DB_ADMIN_HOST="localhost"
DB_ADMIN_PORT=5432
DB_ADMIN_USER="postgres"
DB_ADMIN_PASSWORD="root"
DB_ADMIN_DATABASE="postgres"
```

## Step 2: Initialize and Set Up Database

### Run the Automated Setup Script
This script will:
1. Clean up existing unwanted data
2. Create default companies (Developer, Karmaa Source, Admoni)
3. Seed each company with users and sample data

```bash
cd backend
node setup-database.js
```

## Step 3: Start Backend Server
```bash
cd backend
npm start
```

Backend will be available at: `http://localhost:5000`

## Step 4: Start Frontend Server
```bash
cd ..  # go back to project root
npm run dev
```

Frontend will be available at: `http://localhost:3000` (or next available port like 3001)

## Default Companies and Users

### 1. Super Admin (Global Access)
- **Email**: `superadmin@test.com`
- **Password**: `12345678`
- **Role**: `superadmin`

### 2. Developer Company
- **Domain**: `developer`
- **Database**: `todolist_developer`
- **Users**: (Already exists from previous setup)

### 3. Karmaa Source Company
- **Company Name**: `Karmaa Source`
- **Domain**: `karmaa-source`
- **Database**: `todolist_karmaa-source`

#### Users for Karmaa Source:
| Role       | Email                  | Password  | Name               |
|------------|------------------------|-----------|--------------------|
| Admin      | admin@karmaa.com       | 12345678  | Karmaa Admin       |
| Manager    | manager@karmaa.com     | 1234567   | Karmaa Manager     |
| Employee   | employee@karmaa.com    | 123456    | Karmaa Employee    |

### 4. Admoni Company
- **Company Name**: `Admoni`
- **Domain**: `admoni`
- **Database**: `todolist_admoni`

#### Users for Admoni:
| Role       | Email                  | Password  | Name               |
|------------|------------------------|-----------|--------------------|
| Admin      | admin@admoni.com       | 12345678  | Admoni Admin       |
| Manager    | manager@admoni.com     | 1234567   | Admoni Manager     |
| Employee   | employee@admoni.com    | 123456    | Admoni Employee    |

## Ticket Schema
The Ticket table includes the following fields:
- `assign by`: User ID who created/assigned the ticket
- `managed by`: User ID (manager) overseeing the ticket
- `Source`: Source of the ticket (e.g., Email, Slack, Basecamp, Manual)

## Key Files

- `prisma-main/schema.prisma` - Main DB schema (companies, super admins)
- `prisma-tenant/schema.prisma` - Tenant DB schema (business data)
- `src/config/dbManager.js` - Dynamic DB connection & tenant creation
- `src/controllers/tenantController.js` - Tenant API endpoints
- `setup-database.js` - Automated database setup and seeding

## Notes

- All tenant databases are completely isolated
- Use `superadmin` credentials for global access
- Use company-specific domain URLs to access tenant dashboards (e.g., `/karmaa-source/login`, `/admoni/login`)
