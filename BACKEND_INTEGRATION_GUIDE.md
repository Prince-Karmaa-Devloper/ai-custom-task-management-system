# Backend Integration Guide

This guide documents the API endpoints required for the AI-Powered Task Management SaaS frontend.

## Base URL

```
VITE_API_URL=http://your-api-domain.com/api
```

## Authentication Endpoints

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "avatar": "UN",
    "tenantId": "default"
  }
}
```

### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "avatar": "UN",
  "tenantId": "default"
}
```

## Ticket Endpoints

### Get All Tickets
```http
GET /tickets?status=Pending&priority=High&search=query&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "ticketId": "TCKT-1001",
      "title": "Fix login page bug",
      "description": "Description here",
      "projectName": "E-commerce Platform",
      "siteName": "ShopNow",
      "basecampUrl": "https://basecamp.com/project",
      "websiteUrl": "https://shopnow.com",
      "assignedEmployee": 4,
      "createdBy": 1,
      "priority": "High",
      "status": "Pending",
      "createdDate": "2024-01-15",
      "estimatedHours": 8,
      "actualHours": 0,
      "aiScore": 85,
      "tenantId": "default"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### Get Ticket by ID
```http
GET /tickets/:ticketId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "ticketId": "TCKT-1001",
    "title": "Fix login page bug",
    "description": "Description here",
    "projectName": "E-commerce Platform",
    "siteName": "ShopNow",
    "basecampUrl": "https://basecamp.com/project",
    "websiteUrl": "https://shopnow.com",
    "assignedEmployee": 4,
    "createdBy": 1,
    "priority": "High",
    "status": "Pending",
    "createdDate": "2024-01-15",
    "estimatedHours": 8,
    "actualHours": 0,
    "aiScore": 85,
    "tenantId": "default"
  }
}
```

### Create Ticket
```http
POST /tickets
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New ticket",
  "description": "Description",
  "projectName": "Project Name",
  "siteName": "Site Name",
  "basecampUrl": "https://basecamp.com",
  "websiteUrl": "https://example.com",
  "assignedEmployee": 4,
  "priority": "Medium",
  "status": "Pending",
  "estimatedHours": 16
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "ticketId": "TCKT-1051",
    "...": "..."
  }
}
```

### Update Ticket
```http
PUT /tickets/:ticketId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as create ticket

### Delete Ticket
```http
DELETE /tickets/:ticketId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

## User Endpoints

### Get All Users
```http
GET /users
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "avatar": "UN",
      "tenantId": "default"
    }
  ]
}
```

### Get User by ID
```http
GET /users/:id
```

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "employee"
}
```

### Update User
```http
PUT /users/:id
```

### Delete User
```http
DELETE /users/:id
```

## Project Endpoints

### Get All Projects
```http
GET /projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "projectName": "E-commerce Platform",
      "siteName": "ShopNow",
      "basecampUrl": "https://basecamp.com/shopnow",
      "websiteUrl": "https://shopnow.com",
      "managedBy": 3,
      "manager": "Manager Name",
      "employees": [4, 5],
      "status": "Active",
      "tenantId": "default"
    }
  ]
}
```

### Get Project by ID
```http
GET /projects/:id
```

### Create Project
```http
POST /projects
```

### Update Project
```http
PUT /projects/:id
```

### Delete Project
```http
DELETE /projects/:id
```

## AI Endpoints

### Generate AI Suggestion
```http
POST /ai/suggestion
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "ticket": {
    "ticketId": "TCKT-1001",
    "title": "Fix login page bug",
    "description": "..."
  }
}
```

**Response:**
```json
{
  "suggestion": "AI-generated suggestion here..."
}
```

### Generate Workflow
```http
POST /ai/workflow
```

**Request Body:**
```json
{
  "ticket": { "..." }
}
```

**Response:**
```json
{
  "workflow": [
    { "step": 1, "title": "Analysis", "description": "..." },
    { "step": 2, "title": "Design", "description": "..." }
  ]
}
```

### Generate Report
```http
POST /ai/report
```

**Request Body:**
```json
{
  "ticket": { "..." }
}
```

**Response:**
```json
{
  "report": "Task Report: ..."
}
```

### Task Guidance
```http
POST /ai/guidance
```

**Request Body:**
```json
{
  "query": "How to implement user authentication?"
}
```

### Workflow Recommendation
```http
POST /ai/workflow-recommendation
```

**Request Body:**
```json
{
  "projectType": "software"
}
```

### Improve Writing
```http
POST /ai/improve-writing
```

**Request Body:**
```json
{
  "text": "Text to improve..."
}
```

## Local LLM Endpoints

### Extract Task from Message
```http
POST /llm/extract-task
```

**Request Body:**
```json
{
  "message": "We need to fix the login page by Friday"
}
```

**Response:**
```json
{
  "task": {
    "title": "Fix login page",
    "description": "We need to fix the login page by Friday",
    "priority": "Medium",
    "estimatedHours": 8
  }
}
```

### Generate LLM Workflow
```http
POST /llm/workflow
```

### Estimate Task Time
```http
POST /llm/estimate-time
```

### Improve Writing (LLM)
```http
POST /llm/improve-writing
```

### Generate Performance Report
```http
POST /llm/performance-report
```

## Webhook Endpoints

### Ticket Webhook
```http
POST /webhooks/ticket
```

**Headers:**
```
X-Webhook-Signature: <signature>
```

### Project Webhook
```http
POST /webhooks/project
```

## Slack Integration Endpoints

### Connect Slack
```http
POST /integrations/slack/connect
```

**Response:**
```json
{
  "authUrl": "https://slack.com/oauth/authorize?..."
}
```

### Slack Callback
```http
GET /integrations/slack/callback
```

### Disconnect Slack
```http
POST /integrations/slack/disconnect
```

### Send Slack Message
```http
POST /integrations/slack/message
```

**Request Body:**
```json
{
  "channel": "#general",
  "text": "Hello from Task Manager"
}
```

## WhatsApp Integration Endpoints

### Connect WhatsApp
```http
POST /integrations/whatsapp/connect
```

### Disconnect WhatsApp
```http
POST /integrations/whatsapp/disconnect
```

### Send WhatsApp Message
```http
POST /integrations/whatsapp/message
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "message": "Hello from Task Manager"
}
```

## Error Responses

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- 200 - Success
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## Multi-Tenancy

All requests should include tenant context. This can be done via:
- JWT token payload
- Custom header: `X-Tenant-ID`
- Subdomain

All database queries must filter by `tenantId` to ensure data isolation.
