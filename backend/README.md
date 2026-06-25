# AI Task Manager - Backend

## Setup Instructions

### 1. Database Setup

Make sure you have PostgreSQL installed and running. Then create the database:

```sql
CREATE DATABASE "demoappDB"
WITH
OWNER = postgres
ENCODING = 'UTF8'
CONNECTION LIMIT = -1;
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/demoappDB?schema=public"
JWT_SECRET="your_super_secret_jwt_secret_key_here"
JWT_REFRESH_SECRET="your_super_secret_refresh_token_secret_here"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="./uploads"
CORS_ORIGIN="http://localhost:3000"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the Database

```bash
npm run prisma:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

Server is now running at http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users (tenant-based)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tickets

- `GET /api/tickets` - Get all tickets (role-based)
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard stats
- `GET /api/dashboard/charts` - Get dashboard chart data

## Demo Credentials

- Super Admin: superadmin@test.com / 123456
- Admin (TechCorp): admin1@test.com / 123456
- Manager (Admin1): admin1-manager1@test.com / 123456
- Employee (Admin1 Manager1): a1m1-emp1@test.com / 123456
