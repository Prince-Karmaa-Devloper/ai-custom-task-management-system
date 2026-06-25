# Multi-Tenant Database Architecture

## Overview

This document describes the complete multi-tenant database architecture for the ToDoList application. The architecture uses a **separate database per tenant** pattern, with one central main database for global configuration and tenant management.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Main Database                         │
│                      (todolist_main)                        │
├─────────────────────────────────────────────────────────────┤
│  • Super Admin Accounts                                     │
│  • Company (Tenant) Records                                 │
│  • Company Subscription Details                             │
│  • Database Connection Information                          │
│  • Global Settings                                          │
│  • Audit Logs                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Creates & Manages
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Tenant DB   │  │   Tenant DB   │  │   Tenant DB   │
│(todolist_abc) │  │(todolist_def) │  │(todolist_ghi) │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ • Users       │  │ • Users       │  │ • Users       │
│ • Roles       │  │ • Roles       │  │ • Roles       │
│ • Permissions │  │ • Permissions │  │ • Permissions │
│ • Projects    │  │ • Projects    │  │ • Projects    │
│ • Tickets     │  │ • Tickets     │  │ • Tickets     │
│ • Etc...      │  │ • Etc...      │  │ • Etc...      │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Database Structure

### Main Database: `todolist_main`

The central database contains only global, cross-tenant information.

#### Tables:

##### `super_admins`
Global super administrator accounts with full system access.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| email | String | Unique email address |
| password | String | Hashed password |
| name | String | Admin full name |
| avatar | String? | Avatar/initials |
| isActive | Boolean | Account status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `companies`
Registered tenant companies and their database configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Company name |
| domain | String | Unique domain identifier |
| databaseName | String | Unique database name |
| isActive | Boolean | Company status |
| subscriptionType | String | Subscription tier |
| subscriptionEnd | DateTime? | Subscription end date |
| dbHost | String | Database host |
| dbPort | Int | Database port |
| dbUser | String | Database username |
| dbPassword | String | Database password |
| createdBy | Int? | Super Admin who created |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `company_audit_logs`
Audit trail of company management operations.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| companyId | Int | Foreign key to companies |
| action | String | Action performed |
| details | Json? | Additional details |
| performedBy | Int? | Super Admin ID |
| createdAt | DateTime | Creation timestamp |

##### `global_settings`
Global system-wide configuration settings.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| key | String | Unique setting key |
| value | String? | Setting value |
| description | String? | Setting description |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Tenant Database: `todolist_{domain}`

Each company has its own dedicated database with the following structure.

#### Tables:

##### `roles`
User roles within the company.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Unique role name |
| description | String? | Role description |

Default roles: `ADMIN`, `MANAGER`, `EMPLOYEE`

##### `permissions`
Granular permissions that can be assigned to roles.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Unique permission name |
| description | String? | Permission description |
| resource | String? | Resource type |
| action | String? | Action type |

##### `role_permissions`
Many-to-many relationship between roles and permissions.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| roleId | Int | Foreign key to roles |
| permissionId | Int | Foreign key to permissions |

##### `users`
Company users with their role assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| email | String | Unique email |
| password | String | Hashed password |
| name | String | Full name |
| avatar | String? | Avatar/initials |
| roleId | Int | Foreign key to roles |
| parentId | Int? | Manager (hierarchy) |
| linkedin | String? | LinkedIn profile |
| skills | String[] | Array of skills |
| knowledge | String[] | Areas of knowledge |
| isActive | Boolean | Account status |
| createdBy | Int? | Creator user ID |
| updatedBy | Int? | Updater user ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `projects`
Projects managed by the company.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Project name |
| siteName | String? | Site name |
| basecampUrl | String? | Basecamp URL |
| websiteUrl | String? | Website URL |
| status | String | Project status |
| createdBy | Int? | Creator user ID |
| updatedBy | Int? | Updater user ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `project_members`
Users assigned to projects.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| projectId | Int | Foreign key to projects |
| userId | Int | Foreign key to users |
| role | String | Role in project |
| createdAt | DateTime | Creation timestamp |

##### `tickets`
Support/task tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| ticketId | String | Unique ticket identifier |
| title | String | Ticket title |
| description | String | Ticket description |
| status | String | Ticket status |
| priority | String | Priority level |
| source | String | Ticket source |
| emailSubject | String? | Email subject |
| basecampUrl | String? | Basecamp URL |
| websiteUrl | String? | Website URL |
| projectId | Int | Foreign key to projects |
| assignedTo | Int? | Assigned user ID |
| managedBy | Int? | Manager user ID |
| createdBy | Int | Creator user ID |
| estimatedHours | Int? | Estimated hours |
| actualHours | Int? | Actual hours |
| aiScore | Int? | AI priority score |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `ticket_comments`
Comments on tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| ticketId | Int | Foreign key to tickets |
| userId | Int | Foreign key to users |
| content | String | Comment content |
| createdAt | DateTime | Creation timestamp |

##### `ticket_attachments`
File attachments on tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| ticketId | Int | Foreign key to tickets |
| userId | Int | Foreign key to users |
| fileName | String | File name |
| filePath | String | File path |
| fileSize | Int | File size in bytes |
| fileType | String | MIME type |
| createdAt | DateTime | Creation timestamp |

##### `ticket_history`
Change history for tickets.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| ticketId | Int | Foreign key to tickets |
| userId | Int | Foreign key to users |
| action | String | Action performed |
| field | String? | Field changed |
| oldValue | String? | Previous value |
| newValue | String? | New value |
| createdAt | DateTime | Creation timestamp |

##### `integrations`
Third-party integrations configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Integration name |
| type | String | Integration type |
| status | String | Connection status |
| config | Json? | Configuration data |
| lastSync | DateTime? | Last sync timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `integration_logs`
Logs for integration operations.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| integrationId | Int | Foreign key to integrations |
| message | String | Log message |
| type | String | Log type |
| createdAt | DateTime | Creation timestamp |

##### `notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| userId | Int | Foreign key to users |
| title | String | Notification title |
| message | String | Notification message |
| type | String | Notification type |
| isRead | Boolean | Read status |
| createdAt | DateTime | Creation timestamp |

##### `reports`
Generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | Report name |
| type | String | Report type |
| filters | Json? | Report filters |
| fileUrl | String? | Report file URL |
| createdBy | Int | Creator user ID |
| createdAt | DateTime | Creation timestamp |

##### `activity_logs`
User activity audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| userId | Int | Foreign key to users |
| action | String | Action performed |
| resource | String? | Resource type |
| resourceId | Int? | Resource ID |
| details | Json? | Additional details |
| createdAt | DateTime | Creation timestamp |

##### `company_settings`
Company-specific configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| settings | Json? | Settings data |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

##### `white_label_settings`
White-label customization settings.

| Column | Type | Description |
|--------|------|-------------|
| id | Int | Primary key, auto-increment |
| companyName | String? | Company display name |
| dashboardTitle | String? | Dashboard title |
| logoUrl | String? | Logo image URL |
| primaryColor | String? | Primary theme color |
| secondaryColor | String? | Secondary theme color |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

## Domain Rules

The company domain is a critical unique identifier with specific validation rules:

### Requirements:
1. **Required**: Every company must have a domain
2. **Unique**: No two companies can share the same domain
3. **Format**: 
   - Only lowercase letters (a-z)
   - Numbers (0-9)
   - Hyphens (-)
   - No spaces or special characters
4. **Immutable**: Cannot be changed after creation (except by Super Admin)

### Valid Examples:
- `karmaa`
- `webbiz` 
- `global-corp-2024`

### Invalid Examples:
- `Karmaa` (uppercase not allowed)
- `karmaa!` (special characters not allowed)
- `kar maa` (spaces not allowed)

---

## Tenant Creation Workflow

When a Super Admin creates a new company, the following steps are executed atomically:

### Step 1: Validate Input
- Check that domain is valid format
- Verify domain uniqueness in `todolist_main`
- Validate all required fields

### Step 2: Create Company Record (Main DB)
- Insert new record into `companies` table
- Generate database name: `todolist_{domain}`
- Store connection information
- Create audit log entry

### Step 3: Create Tenant Database (PostgreSQL)
- Connect to PostgreSQL admin database
- Execute `CREATE DATABASE todolist_{domain}`

### Step 4: Run Migrations
- Apply Prisma migrations to the new database
- Creates all required tables and relationships

### Step 5: Seed Default Data
- Create default permissions
- Create default roles (ADMIN, MANAGER, EMPLOYEE)
- Assign permissions to roles
- Create Company Admin user with provided credentials
- Create default white-label settings

### Step 6: Verify Connection
- Test connection to the new database
- Verify data was created correctly

### Step 7: Complete
- Return success response
- Company is ready to use

---

## Login Workflow

### Super Admin Login:
1. User navigates to `/login`
2. Enters email and password
3. System validates credentials against `todolist_main.super_admins`
4. Issues JWT token with `isSuperAdmin: true`
5. Grants access to global management UI

### Company User Login:
1. User navigates to `/{domain}/login`
2. Enters email and password
3. System looks up company by domain in `todolist_main.companies`
4. Verifies company is active
5. Connects to `todolist_{domain}` database
6. Validates credentials against tenant's `users` table
7. Issues JWT token with `tenantDomain: {domain}` and `isSuperAdmin: false`
8. Grants access to company-specific UI

---

## Tenant Resolution Process

For each authenticated request:

1. **Extract JWT Token**: Get token from Authorization header
2. **Decode Token**: Parse JWT to get `isSuperAdmin` and `tenantDomain`
3. **Super Admin**:
   - Connect to `todolist_main`
   - Allow access to global endpoints
4. **Company User**:
   - Look up company in `todolist_main` by `tenantDomain`
   - Verify company exists and is active
   - Get database connection info
   - Create connection to `todolist_{domain}`
   - Attach tenant DB client to request object
5. **Proceed**: Pass request to controller with appropriate DB connections

---

## Database Creation Process

The `dbManager.js` module handles all database operations:

### Key Functions:
- `getMainDb()` - Returns Prisma client for main database
- `getTenantDbByDomain(domain)` - Gets/creates tenant DB connection
- `createCompany(companyData)` - Full company creation workflow
- `updateCompanyStatus()` - Activate/deactivate company
- `validateDomain(domain)` - Validates domain format

### Connection Pooling:
- Tenant database connections are cached by domain
- Reused for subsequent requests
- Cleared when company is deactivated

---

## Prisma Architecture

### Two Separate Prisma Schemas:

#### 1. `prisma-main/schema.prisma`
- Models for main database tables
- Generates `@prisma-main/client`

#### 2. `prisma-tenant/schema.prisma`
- Models for tenant database tables
- Generates `@prisma-tenant/client`

### Migration Strategy:
- **Main Database**: Manual migrations as needed
- **Tenant Databases**: 
  - Migrations run automatically on tenant creation
  - Can be applied to existing tenants via script

---

## Security Considerations

### Database Isolation:
- Each tenant has completely separate database
- No risk of cross-tenant data leaks
- Different credentials can be used per tenant

### Authentication:
- JWT tokens with short expiration
- Passwords hashed with bcrypt
- Role-based authorization

### Input Validation:
- Domain format validation
- SQL injection prevented via Prisma ORM
- XSS protection via input sanitization

### Audit Logs:
- Company creation tracked in main DB
- User activity tracked in each tenant DB

---

## Backup and Recovery

### Recommendations:

#### Main Database:
- Full daily backup
- Point-in-time recovery enabled
- Store off-site

#### Tenant Databases:
- Individual backups per tenant
- Can be restored independently
- Consider automated backup schedule

### Restoration Process:
1. Restore main database first
2. Restore individual tenant databases as needed
3. Verify all connections still work
4. Check audit logs for consistency

---

## Environment Configuration

### Required `.env` Variables:
```env
MAIN_DATABASE_URL="postgresql://user:pass@localhost:5432/todolist_main?schema=public"
TENANT_DATABASE_URL="postgresql://user:pass@localhost:5432/todolist_template?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=5000
NODE_ENV="development"
DB_ADMIN_HOST="localhost"
DB_ADMIN_PORT=5432
DB_ADMIN_USER="postgres"
DB_ADMIN_PASSWORD="root"
DB_ADMIN_DATABASE="postgres"
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"
```

---

## Setup Instructions

### First-time Setup:

1. **Create Main Database**:
   ```sql
   CREATE DATABASE todolist_main;
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Generate Prisma Clients**:
   ```bash
   npm run prisma:main:generate
   npm run prisma:tenant:generate
   ```

4. **Run Main Migrations**:
   ```bash
   npm run prisma:main:migrate
   ```

5. **Seed Main Database**:
   ```bash
   npm run seed:main
   ```

6. **Start Server**:
   ```bash
   npm run dev
   ```

### Quick Setup (Single Command):
```bash
npm run setup
```

---

## Default Credentials

After seeding, the following Super Admin account is available:

- **Email**: `superadmin@todolist.com`
- **Password**: `SuperAdmin123!`
- **Login URL**: `http://localhost:3000/login`

---

## API Endpoints

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Tenants (Super Admin Only):
- `GET /api/tenants` - List all companies
- `POST /api/tenants/create` - Create new company
- `PUT /api/tenants/:companyId/status` - Toggle company status
- `GET /api/tenants/public/:domain` - Get public company info

### Tenant-Specific Endpoints:
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/charts` - Dashboard charts
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma-main/schema.prisma` | Main database models |
| `prisma-tenant/schema.prisma` | Tenant database models |
| `src/config/dbManager.js` | Database connection & tenant creation |
| `src/middleware/auth.js` | Authentication & tenant resolution |
| `src/controllers/*` | API controllers |
| `src/routes/*` | API routes |
| `src/app.js` | Express server setup |

---

## Best Practices

1. **Never store tenant data in main database**
2. **Always validate domains before company creation**
3. **Use transactions for company creation**
4. **Cache tenant connections but implement TTL**
5. **Monitor database sizes per tenant**
6. **Regular backups of all databases**
7. **Rotate database credentials periodically**
8. **Log all tenant creation/modification operations**

---

## Troubleshooting

### Common Issues:

**Tenant Database Creation Fails**:
- Check PostgreSQL user has CREATEDB privilege
- Verify DB_ADMIN_* environment variables
- Check PostgreSQL logs for details

**Cannot Connect to Tenant DB**:
- Verify company is marked as active
- Check database exists
- Verify connection credentials

**Migration Errors**:
- Ensure both Prisma clients are generated
- Check migration files exist
- Verify database user has sufficient privileges

---

## Summary

This architecture provides:
- ✅ Complete data isolation between tenants
- ✅ Easy scalability (add DB servers as needed)
- ✅ Customizable per-tenant configurations
- ✅ Clear separation of global vs tenant data
- ✅ Proper security boundaries
- ✅ Easy backup and restore
- ✅ Audit logging for compliance
