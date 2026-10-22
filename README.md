# Enterprise Role-Based Ticket Management System (MERN Stack)

A production-grade, full-stack IT service desk and support ticket management platform engineered with the MERN stack (MongoDB, Express, React, Node.js). Features strict dual-layer Role-Based Access Control (RBAC), multi-party collaboration, real-time SLA breach detection, background automated escalation, immutable audit logging, and analytical dashboards.

---

## 1. System Overview & Core Capabilities

- **Strict Multi-Role Separation**: Granular permissions across three personas: **Employee**, **Support Agent**, and **Administrator**.
- **Deterministic State Machine**: Enforces valid ticket lifecycle transitions (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `PENDING` → `RESOLVED` → `CLOSED` / `REOPENED`).
- **SLA Calculation & Escalation Engine**: Automated computation of response and resolution deadlines per priority matrix (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), with 80% threshold warnings, breach flags, and background cron escalations.
- **Immutable Audit Trail**: Append-only activity logging tracking assignments, state shifts, priority modifications, and internal actions.
- **Collaborative Threading & Internal Notes**: Public conversation thread with support for file attachments plus role-restricted internal notes visible only to agents and administrators.
- **Feedback & Rating Subsystem**: 1 to 5-star customer satisfaction ratings with reviews for resolved and closed tickets.
- **Interactive Analytics**: Visual distribution charts and performance metrics powered by Recharts for workloads, SLA compliance, and agent leaderboards.

---

## 2. Technology Stack & Architecture

### Backend
- **Runtime & Framework**: Node.js (v18+) with Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Authentication & Security**: JSON Web Tokens (JWT), bcryptjs password hashing, CORS, express-validator
- **File Handling**: Multer for attachment uploads (stored in `server/uploads/`)
- **Job Scheduling**: node-cron for automated SLA monitoring and auto-escalation sweeps

### Frontend
- **Framework & Tooling**: React 18, Vite, React Router DOM (v6)
- **Styling**: Tailwind CSS with custom glassmorphism design system & light/dark mode support
- **State & Context**: AuthContext (session & token handling), ThemeContext, NotificationContext
- **Visualizations & Icons**: Recharts for analytics charts and Lucide React icons
- **HTTP Client**: Axios with request and response interceptors (JWT header attachment & auto-redirects)

---

## 3. Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: MongoDB Atlas Cluster connection URI, local MongoDB daemon (`mongodb://127.0.0.1:27017`), or embedded memory server (automatic fallback in test/dev)

---

## 4. Environment Configuration

1. Copy the example environment template in `server/`:
   ```bash
   cp server/.env.example server/.env
   ```
2. Open `server/.env` and update the values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fsd_ticket_system?retryWrites=true&w=majority
   JWT_SECRET=replace_with_a_secure_random_jwt_secret_key_in_production
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   UPLOAD_PATH=uploads
   ```

> **Note on MongoDB URI**:
> - If connecting to **MongoDB Atlas**, paste your cluster connection string into `MONGODB_URI`.
> - If a local MongoDB instance is running on port 27017, use `mongodb://127.0.0.1:27017/fsd_ticket_system`.
> - If no MongoDB daemon is running locally, the server test and development runner automatically boots an embedded high-performance in-memory MongoDB instance.

---

## 5. Installation & Quick Start Commands

The project root contains convenient cross-workspace management scripts defined in [package.json](package.json).

### Step 1: Install Dependencies
Install dependencies for both backend and frontend in a single step:
```bash
npm run install:all
```
*(Alternatively: `npm --prefix server install` and `npm --prefix client install`)*

### Step 2: Seed Development Database
Populate SLA rules, categories, demo users across all roles, and realistic sample tickets:
```bash
npm run seed
```
*(Under the hood, this executes `node server/seed/seedData.js`)*

### Step 3: Run the Application
Open two separate terminal windows (or run concurrently):

**Terminal 1 — Backend API Server (Port 5000):**
```bash
npm run server
```
*(Runs `nodemon server.js` from `server/`)*

**Terminal 2 — Frontend Development Client (Port 5173):**
```bash
npm run client
```
*(Runs `vite` dev server from `client/`)*

Access the application in your browser at: **`http://localhost:5173`**

---

## 6. Seeded Development Accounts

The database seed script initializes the following verified accounts:

| Role | Name | Email Address | Password | Department | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Admin Supervisor | `admin@example.com` | `Admin123!` | IT Operations | System-wide queue, assign tickets, manage users, SLA configuration, analytics |
| **AGENT** | Alex Rivera (Tier 1) | `agent@example.com` | `Agent123!` | IT Service Desk | Assigned ticket queue, status updates, internal notes, resolve tickets |
| **AGENT** | Sarah Connor (Tier 2) | `agent2@example.com` | `Agent123!` | Network & Infrastructure | Tier-2 technical resolution, SLA compliance tracking |
| **EMPLOYEE** | Emily Davis | `employee@example.com` | `Employee123!` | Software Engineering | Create tickets, view own history, add public comments, confirm closure, submit rating |
| **EMPLOYEE** | Marcus Johnson | `employee2@example.com` | `Employee123!` | Financial Analytics | Create tickets, monitor real-time ticket status |

---

## 7. User Roles & Permission Matrix

| Operation / Feature | Employee | Support Agent | Administrator | Backend Security Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Register & Login** | Yes | Yes | Yes | Public endpoints (`/api/auth/*`). Inactive accounts blocked. |
| **Create Ticket** | Yes | Optional | Yes | `createdBy` automatically set from validated JWT token. |
| **View Ticket List** | Own tickets only | Assigned tickets only | All system tickets | Query scoping strictly enforced in service layer. |
| **View Ticket Detail** | Own tickets only | Assigned tickets only | All tickets | Verified in `checkTicketAccess` middleware. |
| **Assign / Reassign Ticket** | No (403) | No (403) | Yes | Admin-only route (`/api/tickets/:id/assign`). |
| **Accept Ticket** | No (403) | Yes (If assigned) | Yes | Transition from `ASSIGNED` → `IN_PROGRESS`. |
| **Update Ticket Status** | Close / Reopen | Workflow transitions | All transitions | Enforced state machine matrix. |
| **Internal Staff Notes** | No (Hidden) | Yes | Yes | `isInternal: true` excluded from employee queries. |
| **Rate & Review Ticket** | Yes (1-5 stars) | No (403) | Read-only | Allowed only once on `RESOLVED` or `CLOSED` tickets. |
| **User & SLA Management**| No (403) | No (403) | Full CRUD | Protected by `authorize('ADMIN')` middleware. |

---

## 8. Ticket Lifecycle & SLA Rules

### Ticket State Transitions
```
[ OPEN ]
   │
   ▼ (Admin assigns agent)
[ ASSIGNED ]
   │
   ▼ (Agent accepts ticket)
[ IN_PROGRESS ] ◄───────────────┐
   │         │                  │
   │ (Hold)  │ (Resolve)        │ (Employee reopens)
   ▼         ▼                  │
[ PENDING ] [ RESOLVED ] ───────┘
   │             │
   │ (Resume)    │ (Employee confirms closure)
   └────────►    ▼
              [ CLOSED ] ──► [ Employee submits 1-5 Star Feedback ]
```

### Configured SLA Targets
| Priority | Response Target | Resolution Target | Warning Threshold | Escalation Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | 15 minutes | 2 hours (120 min) | 80% (at 96 min) | Exceeding 120 minutes |
| **HIGH** | 30 minutes | 4 hours (240 min) | 80% (at 192 min) | Exceeding 240 minutes |
| **MEDIUM** | 2 hours (120 min) | 12 hours (720 min) | 80% (at 576 min) | Exceeding 720 minutes |
| **LOW** | 4 hours (240 min) | 24 hours (1440 min)| 80% (at 1152 min)| Exceeding 1440 minutes |

---

## 9. REST API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update personal profile details |
| `GET` | `/api/tickets` | Authenticated | Fetch role-scoped ticket list |
| `POST` | `/api/tickets` | Employee, Admin | Create new ticket with optional attachments |
| `GET` | `/api/tickets/:id` | Scoped RBAC | Fetch ticket details, SLA countdown, and audit log |
| `PATCH`| `/api/tickets/:id/assign` | Admin | Assign ticket to an active agent |
| `PATCH`| `/api/tickets/:id/status` | Scoped RBAC | Update status through validated transitions |
| `PATCH`| `/api/tickets/:id/priority`| Admin | Change priority and recalculate SLA deadlines |
| `GET` | `/api/tickets/:id/comments`| Scoped RBAC | List ticket comments (filters internal notes) |
| `POST`| `/api/tickets/:id/comments`| Scoped RBAC | Post public reply or private staff note |
| `POST` | `/api/feedback` | Employee | Submit 1–5 star rating for resolved/closed ticket |
| `GET` | `/api/notifications` | Authenticated | Fetch unread in-app notifications |
| `PATCH`| `/api/notifications/read-all` | Authenticated | Mark all notifications as read |
| `GET` | `/api/analytics/dashboard` | Admin | Fetch system KPIs, status & priority distributions |
| `GET` | `/api/analytics/agent-leaderboard` | Admin | Agent turnaround and resolution rankings |
| `GET` | `/api/users` | Admin | Full user and agent directory management |
| `GET` | `/api/sla/rules` | Authenticated | View configured SLA deadline matrices |

---

## 10. Automated Testing & Production Build

### Run Backend Integration Tests
Executes the 10-stage automated end-to-end integration test suite using Node's native test runner:
```bash
npm --prefix server test
```
*Tests cover system health, multi-role registration, RBAC permission barriers (403), SLA auto-calculation, assignment history, state machine transitions, internal notes isolation, resolution compliance, and analytics.*

### Run Status Workflow Test
Directly tests all state machine rules and illegal transition blocks:
```bash
node server/utils/testStatusWorkflow.js
```

### Build Frontend for Production
Verifies all React components, Tailwind styling, and asset bundling:
```bash
npm --prefix client run build
```
Generates production distribution files in `client/dist/`.

---

## 11. Troubleshooting & Security Best Practices

1. **MongoDB Connectivity**:
   - If connecting to MongoDB Atlas, ensure your IP address is added to the Atlas **Network Access / IP Access List** (`0.0.0.0/0` for development).
   - If running without an internet connection or local MongoDB daemon, the backend test suite safely spins up an embedded in-memory MongoDB instance.
2. **File Upload Security**:
   - Uploads are restricted to 5MB per file and checked for allowed MIME types (`image/jpeg`, `image/png`, `application/pdf`, etc.) in `server/middleware/upload.js`.
   - Uploaded files are served statically from `/uploads`.
3. **Dual-Layer Authorization**:
   - The frontend `ProtectedRoute.jsx` and `RoleRedirect.jsx` provide client-side route guards.
   - All sensitive operations are redundantly guarded on the backend by `protect`, `authorize()`, and `checkTicketAccess`. Never rely solely on client-side gating.
