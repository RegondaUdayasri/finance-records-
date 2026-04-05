# Finance Dashboard API

A production-quality REST API for a Finance Dashboard, built with **Node.js**, **Express**, and **MongoDB**.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Runtime      | Node.js ≥ 18                   |
| Framework    | Express 4                      |
| Database     | MongoDB via Mongoose 8         |
| Auth         | JWT (jsonwebtoken + bcryptjs)  |
| Validation   | Joi                            |
| Security     | Helmet, CORS                   |

### Why MongoDB over PostgreSQL?
- Financial records are document-oriented — flexible `notes`, `category` fields map naturally to documents
- MongoDB **aggregation pipelines** make dashboard analytics (group by month, sum by category) elegant and fast
- Horizontal scaling is simpler for time-series financial data

---

## Folder Structure

```
finance-dashboard-api/
├── server.js                        ← Entry point
├── .env.example                     ← Environment variable template
├── package.json
└── src/
    ├── app.js                       ← Express setup, middleware, routes, error handler
    ├── config/
    │   └── db.js                    ← MongoDB connection
    ├── models/
    │   ├── User.model.js            ← User schema (name, email, password, role, status)
    │   └── Transaction.model.js     ← Financial record schema (amount, type, category, date, notes)
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── transaction.controller.js
    │   └── dashboard.controller.js
    ├── services/
    │   ├── auth.service.js          ← Signup/login logic, JWT generation
    │   ├── user.service.js          ← Admin user management
    │   ├── transaction.service.js   ← CRUD with filtering
    │   └── dashboard.service.js     ← MongoDB aggregation pipelines
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── transaction.routes.js
    │   └── dashboard.routes.js
    ├── middleware/
    │   ├── auth.middleware.js       ← JWT verification → sets req.user
    │   └── rbac.middleware.js       ← Role-based route protection
    └── utils/
        ├── ApiError.js              ← Custom error class with HTTP status codes
        ├── ApiResponse.js           ← Standardized success responses
        └── validators/
            ├── auth.validator.js
            ├── user.validator.js
            └── transaction.validator.js
```

---

## Database Design

### User Schema
```
User {
  _id        ObjectId
  name       String (2–100 chars)
  email      String (unique, lowercase)
  password   String (bcrypt hash, never returned in responses)
  role       Enum: viewer | analyst | admin   (default: viewer)
  status     Enum: active | inactive           (default: active)
  createdAt  Date
  updatedAt  Date
}
```

### Transaction Schema
```
Transaction {
  _id        ObjectId
  userId     ObjectId  → references User._id
  amount     Number (> 0)
  type       Enum: income | expense
  category   String (e.g. "Salary", "Food", "Rent")
  date       Date
  notes      String (optional)
  createdAt  Date
  updatedAt  Date
}
```

**Relationship:** One User → Many Transactions (userId foreign key on Transaction).

**Indexes** (for performance):
- `{ userId, date }` — date-range dashboard queries
- `{ userId, type }` — income/expense filter
- `{ userId, category }` — category aggregations

---

## Role-Based Access Control

| Permission              | Viewer | Analyst | Admin |
|-------------------------|--------|---------|-------|
| Manage own transactions | ✅     | ✅      | ✅    |
| View dashboard/analytics| ❌     | ✅      | ✅    |
| Manage users            | ❌     | ❌      | ✅    |

---

## Setup

### 1. Clone and install
```bash
git clone <repo-url>
cd finance-dashboard-api
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
```

### 3. Generate a strong JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint        | Auth | Description        |
|--------|-----------------|------|--------------------|
| POST   | /auth/signup    | ❌   | Register new user  |
| POST   | /auth/login     | ❌   | Login, get token   |
| GET    | /auth/me        | ✅   | Get own profile    |

### User Management (Admin only)

| Method | Endpoint        | Auth       | Description             |
|--------|-----------------|------------|-------------------------|
| GET    | /users          | Admin      | List all users          |
| GET    | /users/:id      | Admin      | Get user by ID          |
| PATCH  | /users/:id      | Admin      | Update role/status      |
| DELETE | /users/:id      | Admin      | Delete user + their data|

### Transactions (All roles — own records only)

| Method | Endpoint              | Auth | Description             |
|--------|-----------------------|------|-------------------------|
| GET    | /transactions         | ✅   | List with filters       |
| GET    | /transactions/:id     | ✅   | Get one                 |
| POST   | /transactions         | ✅   | Create                  |
| PATCH  | /transactions/:id     | ✅   | Update                  |
| DELETE | /transactions/:id     | ✅   | Delete                  |

**Query params for GET /transactions:**
```
?page=1&limit=20
&dateFrom=2024-01-01&dateTo=2024-12-31
&type=expense
&category=Food
```

### Dashboard (Analyst + Admin only)

| Method | Endpoint                  | Auth              | Description              |
|--------|---------------------------|-------------------|--------------------------|
| GET    | /dashboard/summary        | Analyst, Admin    | Income, expenses, balance|
| GET    | /dashboard/categories     | Analyst, Admin    | Category-wise totals     |
| GET    | /dashboard/trends         | Analyst, Admin    | Monthly trends           |
| GET    | /dashboard/recent         | Analyst, Admin    | Recent transactions      |

---

## Sample API Requests (Postman / curl)

### 1. Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "Alice Chen",
  "email": "alice@example.com",
  "password": "secure123",
  "role": "analyst"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "_id": "...", "name": "Alice Chen", "email": "alice@example.com", "role": "analyst" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "secure123"
}
```

---

### 3. Create a Transaction
```http
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2024-03-01",
  "notes": "March salary"
}
```

---

### 4. List Transactions with Filters
```http
GET /api/v1/transactions?type=expense&category=Food&dateFrom=2024-01-01&dateTo=2024-03-31&page=1&limit=10
Authorization: Bearer <token>
```

---

### 5. Dashboard Summary
```http
GET /api/v1/dashboard/summary?dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Dashboard summary fetched.",
  "data": {
    "totalIncome": 60000,
    "totalExpenses": 38500,
    "netBalance": 21500,
    "transactionCount": 47
  }
}
```

---

### 6. Category Totals
```http
GET /api/v1/dashboard/categories?type=expense
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    { "category": "Rent",    "type": "expense", "total": 15000, "count": 3 },
    { "category": "Food",    "type": "expense", "total": 8200,  "count": 12 },
    { "category": "Utilities","type": "expense","total": 4300,  "count": 6 }
  ]
}
```

---

### 7. Monthly Trends
```http
GET /api/v1/dashboard/trends?months=6
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    { "monthLabel": "Oct 2024", "income": 5000, "expenses": 3200, "netBalance": 1800, "transactions": 8 },
    { "monthLabel": "Nov 2024", "income": 5000, "expenses": 4100, "netBalance": 900,  "transactions": 11 }
  ]
}
```

---

### 8. Admin: Update User Role
```http
PATCH /api/v1/users/64f1a2b3c4d5e6f7a8b9c0d1
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "analyst",
  "status": "active"
}
```

---

## Error Response Format

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Common HTTP status codes used:
- `400` — Validation error / bad request
- `401` — Not authenticated
- `403` — Authenticated but forbidden (wrong role / inactive account)
- `404` — Resource not found
- `409` — Conflict (e.g. email already exists)
- `500` — Internal server error

---

## Security Notes

- Passwords are hashed with **bcrypt** (salt rounds: 10) — never stored or returned in plaintext
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Inactive users are rejected at the middleware level even with a valid token
- Users can only access their own transactions — ownership is enforced at the query level
- Admins cannot modify or delete their own account (prevents lock-out)
- `helmet` sets secure HTTP headers on all responses
