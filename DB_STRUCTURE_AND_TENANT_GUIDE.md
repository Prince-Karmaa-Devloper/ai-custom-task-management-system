# Database Structure & Multi-Tenant Architecture Guide

## 1. System Overview
This AI Task Management System uses a **multi-database multi-tenant architecture**:
- **Main Database**: Stores global users (superadmins), tenants (companies), global settings, and audit logs.
- **Tenant Databases**: Each company has its own isolated database for tickets, projects, integrations, roles, permissions, users, comments, attachments, notifications, etc.

---

## 2. Main Database (`todolist_main`) Tables
### `companies`
Stores information about each company/tenant.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Display name of the company |
| `domain` | String | Unique tenant domain/identifier (used in login URLs like /{domain}/login) |
| `databaseName` | String | Name of the tenant's isolated database (e.g., todolist_admin1) |
| `isActive` | Boolean | Whether the tenant is active (can log in or not) |
| `subscriptionType`| String | Subscription tier (basic/premium) |
| `subscriptionEnd` | DateTime? | Subscription end timestamp |
| `dbHost` | String | Database host |
| `dbPort` | Int | Database port |
| `dbUser` | String | Database username |
| `dbPassword` | String | Database password |
| `createdAt` | DateTime | Timestamp when company was created |
| `updatedAt` | DateTime | Timestamp when company was last updated |
| `createdBy` | Int? | ID of the Super Admin who created this company |

---

### `super_admins`
Stores Super Administrator accounts across the global platform.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `email` | String | Unique user email |
| `password` | String | Hashed password |
| `name` | String | User's full name |
| `avatar` | String? | User's avatar initials |
| `isActive` | Boolean | Whether user account is active |
| `createdAt` | DateTime | Timestamp when user was created |
| `updatedAt` | DateTime | Timestamp when user was last updated |

---

### `company_audit_logs`
Audit logs for tenant management.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `companyId` | Int | Foreign key to `companies.id` |
| `action` | String | Action type performed (COMPANY_CREATED, etc.) |
| `details` | Json? | Dynamic JSON field containing log details |
| `performedBy` | Int? | ID of the Super Admin who performed the action |
| `createdAt` | DateTime | Log timestamp |

---

### `global_settings`
System settings.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `key` | String | Unique setting key |
| `value` | String? | Setting value |
| `description`| String? | Setting description |
| `createdAt` | DateTime | Timestamp when setting was created |
| `updatedAt` | DateTime | Timestamp when setting was last updated |

---

## 3. Tenant Database Tables (e.g., `todolist_admin1`, `todolist_admin2`, etc.)
Each tenant has its own isolated database with the following tables:

### `roles`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Role name (e.g., ADMIN, MANAGER, EMPLOYEE) |
| `description` | String? | Role description |

---

### `permissions`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Permission name |
| `description` | String? | Permission description |
| `resource` | String? | Resource this permission applies to |
| `action` | String? | Action (create/read/update/delete) |

---

### `role_permissions`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `roleId` | Int | Foreign key to `roles.id` |
| `permissionId`| Int | Foreign key to `permissions.id` |
| **Unique Constraint** | [roleId, permissionId] | Permission can't be assigned to same role twice |

---

### `users`
Tenant-specific users table with hierarchy and details.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `email` | String | Unique user email in tenant |
| `password` | String | Hashed password |
| `name` | String | User's full name |
| `avatar` | String? | User avatar |
| `roleId` | Int | Foreign key to `roles.id` |
| `parentId` | Int? | Foreign key to `users.id` (manager/admin this user reports to) |
| `linkedin` | String? | LinkedIn profile URL |
| `skills` | String[] | User skills |
| `knowledge` | String[] | User knowledge areas |
| `isActive` | Boolean | Account status |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |
| `createdBy` | Int? | ID of user who created this one |
| `updatedBy` | Int? | ID of user who last updated this one |

---

### `projects`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Project name |
| `siteName` | String? | Associated website or client site |
| `basecampUrl` | String? | Basecamp project URL (if used) |
| `websiteUrl` | String? | Project website URL |
| `status` | String | Project status |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |
| `createdBy` | Int? | Created by user ID |
| `updatedBy` | Int? | Updated by user ID |

---

### `project_members`
Links users to projects.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `projectId` | Int | Foreign key to `projects.id` |
| `userId` | Int | Foreign key to `users.id` |
| `role` | String | Role in project |
| `createdAt` | DateTime | Created timestamp |
| **Unique Constraint** | [projectId, userId] | User can't be added to same project twice |

---

### `tickets`
Core task/ticket management table.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `ticketId` | String | Unique human-readable ticket ID |
| `title` | String | Ticket title |
| `description` | String | Ticket description |
| `status` | String | Ticket status (Pending, In Progress, Completed, etc.) |
| `priority` | String | Priority (Low, Medium, High, Critical) |
| `source` | String | How ticket was created (Manual, Email, Slack, WhatsApp) |
| `emailSubject`| String? | Email subject (if created from email) |
| `basecampUrl` | String? | Link to Basecamp (if applicable) |
| `websiteUrl` | String? | Link to project website |
| `projectId` | Int | Foreign key to `projects.id` |
| `assignedTo` | Int? | Foreign key to `users.id` (employee assigned to ticket) |
| `managedBy` | Int? | Foreign key to `users.id` (manager responsible) |
| `createdBy` | Int | Foreign key to `users.id` (who created ticket) |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |
| `estimatedHours` | Int? | Estimated time |
| `actualHours` | Int? | Actual time spent |
| `aiScore` | Int? | AI-generated priority/complexity score |

---

### `ticket_comments`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `ticketId` | Int | Foreign key to `tickets.id` |
| `userId` | Int | Foreign key to `users.id` |
| `content` | String | Comment content |
| `createdAt` | DateTime | Created timestamp |

---

### `ticket_attachments`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `ticketId` | Int | Foreign key to `tickets.id` |
| `userId` | Int | Foreign key to `users.id` |
| `fileName` | String | File name |
| `filePath` | String | Path to file on server |
| `fileSize` | Int | File size in bytes |
| `fileType` | String | File type (MIME) |
| `createdAt` | DateTime | Created timestamp |

---

### `ticket_history`
Audit log of ticket changes.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `ticketId` | Int | Foreign key to `tickets.id` |
| `userId` | Int | Foreign key to `users.id` (who made change) |
| `action` | String | Action performed (created, updated, reassigned, etc.) |
| `field` | String? | Which field changed |
| `oldValue` | String? | Previous value |
| `newValue` | String? | New value |
| `createdAt` | DateTime | Timestamp of change |

---

### `integrations`
Integration configuration for external services (email, Slack, WhatsApp, etc.).
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Integration name |
| `type` | String | Type of integration (email, slack, whatsapp, etc.) |
| `status` | String | Status (disconnected, connected, etc.) |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |
| `lastSync` | DateTime? | Last successful sync time |
| `config` | Json? | Encrypted integration configuration (tokens, credentials) |

---

### `integration_logs`
Activity logs for integrations.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `integrationId` | Int | Foreign key to `integrations.id` |
| `message` | String | Log message |
| `type` | String | Log type (info, warning, error) |
| `createdAt` | DateTime | Created timestamp |

---

### `notifications`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `userId` | Int | Foreign key to `users.id` (who gets notification) |
| `title` | String | Notification title |
| `message` | String | Notification message |
| `type` | String | Notification type |
| `isRead` | Boolean | Whether user has read the notification |
| `createdAt` | DateTime | Created timestamp |

---

### `reports`
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Report name |
| `type` | String | Report type |
| `filters` | Json? | Filters used to generate report |
| `fileUrl` | String? | URL to exported report file (if applicable) |
| `createdBy` | Int | Foreign key to `users.id` (who created report) |
| `createdAt` | DateTime | Created timestamp |

---

### `activity_logs`
Global audit log for user actions in tenant.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `userId` | Int | Foreign key to `users.id` (who performed action) |
| `action` | String | Action performed (e.g., created_ticket, updated_user) |
| `resource` | String? | Type of resource (ticket, user, project, etc.) |
| `resourceId` | Int? | ID of affected resource |
| `details` | Json? | Additional details about the action |
| `createdAt` | DateTime | Action timestamp |

---

### `company_settings`
Tenant-specific settings.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `settings` | Json? | Custom tenant settings |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

---

### `white_label_settings`
Tenant-specific branding settings.
| Column | Type | Description |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `companyName` | String? | Company display name |
| `dashboardTitle`| String? | Dashboard title |
| `logoUrl` | String? | Logo image URL |
| `primaryColor` | String? | Primary theme color |
| `secondaryColor`| String? | Secondary theme color |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

## 4. Tenant Creation Workflow
When a super admin creates a new tenant (company) via the Users page:
1. Super admin fills in: admin email, admin name, admin password, company name, domain
2. Backend calls `POST /api/tenants/create`
3. Steps executed:
   a. Create new `Company` record in main DB with provided company name and domain
   b. Generate tenant DB name (e.g., `todolist_{domain}`)
   c. Create new tenant database and migrate it with `prisma-tenant` schema
   d. Seed database with default data (roles, permissions, white-label, etc.) and create company Admin user
   e. The tenant admin is immediately active and can configure their team

---

## 5. Tenant Isolation
- **Database Level**: Each tenant has a 100% isolated database.
- **Application Level**: All tenant-specific API endpoints resolve database connection dynamically using the request's tenant domain context.
- **Frontend Level**: Users navigate via tenant domain in the URL path, isolating active token and context queries.

---

## 6. User Roles & Permissions
| Role | Description |
|---|---|
| **Super Admin** | Global user that can manage all tenants, create new companies, view company statistics and audit logs |
| **Admin** | Manages a single tenant (company): creates managers/employees, views all tickets/projects in tenant |
| **Manager** | Reports to admin, manages specific employees, views assigned tickets |
| **Employee** | Reports to manager, works on assigned tickets |

---

## 7. Environment Configuration
The backend uses these `.env` variables:
```env
MAIN_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_main?schema=public"
TENANT_DATABASE_URL="postgresql://postgres:root@localhost:5432/todolist_template?schema=public"
PORT=5000
NODE_ENV="development"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key"
CORS_ORIGIN="http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001"
```

---

## 8. Development Setup
1. Configure `.env` files in both root (for frontend) and `backend` directories.
2. Generate Prisma clients:
   ```bash
   cd backend
   npm run prisma:main:generate
   npm run prisma:tenant:generate
   ```
3. Migrate main DB:
   ```bash
   npm run prisma:main:migrate
   ```
4. Seed initial data (creates Super Admin and active company databases):
   ```bash
   npm run seed:main
   ```
5. Start servers:
   ```bash
   # Backend (terminal 1)
   npm run dev
   
   # Frontend (terminal 2)
   npm run dev
   ```

---

## 9. Login Credentials (Default Seed Data)
All passwords are `123456`.
| Role | URL | Email |
|---|---|---|
| Super Admin | http://127.0.0.1:3000/login | superadmin@test.com |
| Admin 1 | http://127.0.0.1:3000/admin1/login | admin1@test.com |
| Manager 1 | http://127.0.0.1:3000/admin1/login | admin1-manager1@test.com |
| Employee 1 | http://127.0.0.1:3000/admin1/login | a1m1-emp1@test.com |
| Admin 2 | http://127.0.0.1:3000/admin2/login | admin2@test.com |
| Admin 3 | http://127.0.0.1:3000/admin3/login | admin3@test.com |
| Karma Admin | http://127.0.0.1:3000/karma/login | admin@karma.com |
| WebBiz Admin | http://127.0.0.1:3000/webbiz/login | admin@webbiz.com |
| Globus Admin | http://127.0.0.1:3000/globus/login | admin@globus.com |
