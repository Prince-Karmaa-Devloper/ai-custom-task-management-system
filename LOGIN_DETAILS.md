# Tenant Login URLs & Credentials

Each company (tenant) has its own login portal URL. **All passwords are `123456`**.

---

## Super Admin (Global Platform)

| Field | Value |
|---|---|
| **Login URL** | http://127.0.0.1:3000/login |
| **Email** | superadmin@test.com |
| **Password** | 123456 |
| **Features** | Create new companies, manage all users, view company statistics (dashboard cards) |

---

## Admin 1 Company (admin1)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/admin1/login | admin1@test.com | 123456 |
| **Manager** | http://127.0.0.1:3000/admin1/login | admin1-manager1@test.com | 123456 |
| **Employee** | http://127.0.0.1:3000/admin1/login | a1m1-emp1@test.com | 123456 |

---

## Admin 2 Company (admin2)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/admin2/login | admin2@test.com | 123456 |
| **Manager** | http://127.0.0.1:3000/admin2/login | admin2-manager1@test.com | 123456 |
| **Employee** | http://127.0.0.1:3000/admin2/login | a2m1-emp1@test.com | 123456 |

---

## Admin 3 Company (admin3)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/admin3/login | admin3@test.com | 123456 |
| **Manager** | http://127.0.0.1:3000/admin3/login | admin3-manager1@test.com | 123456 |
| **Employee** | http://127.0.0.1:3000/admin3/login | a3m1-emp1@test.com | 123456 |

---

## Karma Corp (karma)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/karma/login | admin@karma.com | 123456 |
| **Manager** | http://127.0.0.1:3000/karma/login | manager@karma.com | 123456 |
| **Employee** | http://127.0.0.1:3000/karma/login | employee@karma.com | 123456 |

---

## WebBiz Solutions (webbiz)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/webbiz/login | admin@webbiz.com | 123456 |
| **Manager** | http://127.0.0.1:3000/webbiz/login | manager@webbiz.com | 123456 |
| **Employee** | http://127.0.0.1:3000/webbiz/login | employee@webbiz.com | 123456 |

---

## Globus Inc (globus)

| Role | Login URL | Email | Password |
|---|---|---|---|
| **Admin** | http://127.0.0.1:3000/globus/login | admin@globus.com | 123456 |
| **Manager** | http://127.0.0.1:3000/globus/login | manager@globus.com | 123456 |
| **Employee** | http://127.0.0.1:3000/globus/login | employee@globus.com | 123456 |

---

## URL Patterns

### Super Admin Routes (No Tenant Domain)
```
http://127.0.0.1:3000/login
http://127.0.0.1:3000/dashboard
http://127.0.0.1:3000/users
http://127.0.0.1:3000/tickets
```

### Tenant-Specific Routes
```
http://127.0.0.1:3000/{tenant-domain}/login
http://127.0.0.1:3000/{tenant-domain}/dashboard
http://127.0.0.1:3000/{tenant-domain}/users
```

| Tenant domain | Company |
|---|---|
| admin1 | Admin 1 Company |
| admin2 | Admin 2 Company |
| admin3 | Admin 3 Company |
| karma | Karma Corp |
| webbiz | WebBiz Solutions |
| globus | Globus Inc |

---

## Super Admin User Creation Flow
When a Super Admin creates a new **Admin** user:
1. Fill in the Admin details (name, email, password)
2. **New fields appear**: Company Name and Domain Name
3. Click "Add" — this:
   a. Creates a new tenant/company in the system
   b. Creates the admin user linked to that tenant
   c. The tenant's users will log in at `http://127.0.0.1:3000/{domain}/login`

---

## Database

| Database | Purpose |
|---|---|
| **PostgreSQL** todolist_main | Tenants, users, login accounts |
| **PostgreSQL** todolist_{domain} | Per-company business data (tickets, etc.) |

Connection: `postgresql://postgres:root@localhost:5432/todolist_main`

---

## Re-seed users (if needed)

```bash
cd backend
npm run seed:main
```

---

## Notes

- Admin, Manager, and Employee of the **same company** share the **same login URL** (tenant domain).
- Users can only log in to portals they belong to.
- **Super Admin MUST use the root `/login` URL** (not `/global/login`).
- Tenant users (Admin/Manager/Employee) MUST use the tenant-specific URL (e.g., `/admin1/login`).
- Super Admin can view all companies and their user statistics (number of admins, managers, employees, total users) on the Users page.
