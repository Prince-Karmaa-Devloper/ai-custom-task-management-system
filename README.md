<<<<<<< HEAD
# AI-Powered Task Management SaaS Frontend

A modern, fully responsive, production-ready React.js application for AI-Powered Task Management with Local LLM Integration.

## Technology Stack

- **React.js** - Latest version
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Material UI (MUI)** - UI components
- **React Hook Form** - Form management
- **Recharts** - Charts and data visualization
- **Framer Motion** - Animations
- **React Query** - Data fetching and caching (ready for integration)
- **JWT Authentication** - Ready for integration

## Project Structure

```
src/
├── api/                # API layer for backend integration
│   ├── authApi.js
│   ├── ticketApi.js
│   ├── userApi.js
│   ├── projectApi.js
│   └── integrationApi.js
├── data/               # Mock data
│   ├── users.js
│   ├── tickets.js
│   ├── projects.js
│   ├── analytics.js
│   └── integrations.js
├── layouts/            # Layout components
│   ├── DashboardLayout.jsx
│   └── AuthLayout.jsx
├── pages/              # Page components
│   ├── Login/
│   ├── Dashboard/
│   ├── Tickets/
│   ├── Users/
│   ├── Reports/
│   ├── Integrations/
│   ├── AIInsights/
│   ├── WhiteLabel/
│   ├── Settings/
│   └── Profile/
├── components/         # Reusable components
├── routes/             # Route guards
│   ├── PrivateRoute.jsx
│   └── RoleRoute.jsx
├── store/              # Redux store setup
│   ├── authSlice.js
│   ├── ticketSlice.js
│   ├── userSlice.js
│   └── index.js
├── services/           # Business logic and services
│   ├── authService.js
│   ├── aiService.js
│   ├── ticketService.js
│   ├── integrationService.js
│   └── localLLMService.js
├── theme/              # Theme configuration
├── constants/
├── utils/
├── contexts/
├── hooks/
├── App.jsx
└── main.jsx
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Build

```bash
npm run build
```

## Demo Accounts

| Role         | Email                  | Password |
|--------------|------------------------|----------|
| Super Admin  | superadmin@test.com    | 123456   |
| Admin        | admin@test.com         | 123456   |
| Manager      | manager@test.com       | 123456   |
| Employee 1   | employee1@test.com     | 123456   |
| Employee 2   | employee2@test.com     | 123456   |

## Features

### Authentication
- Mock authentication system
- Role-based access control
- Session stored in localStorage
- Login/Logout functionality

### User Roles & Dashboards
- **Super Admin**: Complete system overview, total companies, employees, tickets, revenue, AI performance
- **Admin**: Manage users, projects, and tickets with performance analytics
- **Manager**: Team management and project status
- **Employee**: Personal task view and AI productivity score

### Ticket Management
- Ticket list with search, filter, and sorting
- Ticket details view
- AI-powered suggestions, workflow generation, and reports
- Status management (Pending, In Progress, Completed, Posted, Reassigned)
- Priority levels (Low, Medium, High, Critical)

### AI Integration
- AI Assistant panel with task guidance
- Workflow recommendations
- Content improvement
- Writing assistant
- Local LLM integration ready (see `src/services/localLLMService.js`)

### Integrations
- Email integration
- Slack integration
- WhatsApp integration
- Connection status and last sync time

### White Label Settings
- Custom company name
- Dashboard title
- Logo upload
- Primary and secondary color customization

### Reports
- Date range filtering
- Employee and project filters
- Export to CSV, Excel, PDF

### User Management
- View and manage users (role-based access)
- User profiles and roles
- Multi-tenant support architecture

### Theme Support
- Dark mode
- Light mode
- Toggle switch in dashboard

## Authentication Flow

1. User enters email and password on login page
2. Credentials are validated against mock data
3. User session is stored in localStorage
4. User is redirected to dashboard based on role
5. Private routes check authentication status
6. Role routes check user role permissions

## API Integration Guide

The frontend is fully ready for backend integration. All API calls are separated in:
- `src/api/` - Axios instances and endpoint definitions
- `src/services/` - Business logic and service layer

Set the backend URL via environment variable:
```env
VITE_API_URL=http://localhost:5000/api
```

See `BACKEND_INTEGRATION_GUIDE.md` for detailed API endpoint documentation.

## Local LLM Integration

The architecture for Local LLM integration is in place:
- `src/services/localLLMService.js` - All LLM functions are defined
- Functions return mock data for now
- Replace with actual LLM API calls when ready

Available LLM functions:
- `extractTaskFromMessage()`
- `generateWorkflow()`
- `estimateTaskTime()`
- `improveWriting()`
- `generatePerformanceReport()`

## Multi-Tenant Support

The application architecture supports multi-tenancy:
- All data models include `tenantId` field
- Queries and operations are tenant-aware
- Ready for tenant-based data isolation

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, AWS S3, etc.)

3. Set environment variables for production

## License

MIT
=======
# ai-custom-task-management-system
>>>>>>> 36163dfc5a216b319b3e5cdf417997c67432f27c
