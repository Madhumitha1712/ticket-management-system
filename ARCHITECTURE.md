# Enterprise Role-Based Ticket Management System (MERN Stack)
## Comprehensive Architecture & Technical Specification

---

## 1. System Overview & Core Objectives

The **Enterprise IT Support Ticket Management Platform** is a secure, role-based, production-ready system providing complete lifecycle management for organizational support tickets.

Key capabilities:
- **Authentication & Dual-Layer RBAC**: Strict JWT-based role enforcement at both backend API level (controllers/middleware) and frontend routing/component level.
- **Three Core Personas**: `EMPLOYEE`, `AGENT`, `ADMIN` with segregated dashboards, permissions, and ticket visibility.
- **Strict Ticket Workflow**: Enforced state-machine transitions (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `PENDING` → `RESOLVED` → `CLOSED` / `REOPENED`).
- **Real-Time SLA & Escalation Engine**: Automated computation of response and resolution deadlines based on priority matrices, warning triggers at 80% threshold, breach detection, and admin escalation.
- **Audit Trails & Activity History**: Immutable logging of all state mutations, assignments, priority shifts, and comments.
- **Collaborative Features & Attachments**: Rich multi-party commenting, file uploads, ratings, and in-app notifications.
- **Interactive Analytics**: Real-time aggregated metrics and charts (Recharts) for workloads, SLAs, and category distributions.

---

## 2. User Roles & Permission Matrix

| Feature / Action | `EMPLOYEE` | `AGENT` | `ADMIN` | Backend Enforcement Rules |
| :--- | :---: | :---: | :---: | :--- |
| **Register / Login** | Yes | Yes | Yes | Public authentication endpoints (`/api/auth/*`). Inactive accounts blocked. |
| **View Dashboard** | Employee Metrics | Assigned Queue Metrics | System-Wide Metrics | `/api/analytics/dashboard` returns role-scoped data only. |
| **Create Ticket** | Yes | Optional/No | Yes | `createdBy` automatically set to `req.user.id`. Unique ID `TKT-XXXX` generated. |
| **View Ticket List** | Own Tickets Only | Assigned Tickets Only | All System Tickets | Query filters strictly injected in service layer (`createdBy: userId` or `assignedTo: userId`). |
| **View Ticket Details** | Own Tickets Only | Assigned Tickets Only | All Tickets | Verified in `ticketAuthorization` middleware before execution. |
| **Assign / Reassign Ticket** | No (403) | No (403) | Yes | Only `ADMIN` can update `assignedTo`. Status shifts to `ASSIGNED`. |
| **Accept Ticket** | No (403) | Yes (If assigned) | Yes | State transition: `ASSIGNED` → `IN_PROGRESS`. |
| **Update Ticket Status** | Close/Reopen (Resolved only) | Workflow transitions | All transitions | Strict transition matrix validation in `ticketService.js`. |
| **Add Comment** | Yes (Own ticket) | Yes (Assigned ticket) | Yes (Any ticket) | Enforced ticket ownership/assignment check. |
| **File Attachment** | Yes (Upload on creation/comment)| Yes (Upload on comment) | Yes | Stored with validation (mime-type, size <= 5MB). |
| **SLA Tracking & Warnings** | View deadline | View countdown & warning | View breach & escalations | Backend calculates deadlines at creation; periodic job updates breach status. |
| **Feedback & Rating** | Yes (1-5 stars + review) | No (403) | View only | Allowed only once on `CLOSED` / `RESOLVED` tickets owned by employee. |
| **User & Agent Management** | No (403) | No (403) | Full CRUD & status toggle | `/api/users/*` and `/api/admin/*` protected by `verifyRole('ADMIN')`. |
| **Category & SLA Config** | No (403) | No (403) | Full CRUD | `/api/categories/*`, `/api/sla/*` restricted to `ADMIN`. |

---

## 3. Database Schema Design (MongoDB / Mongoose)

### 3.1. `User` Collection
- `_id`: ObjectId
- `name`: String (required, trimmed)
- `email`: String (required, unique, lowercase, indexed)
- `password`: String (required, hashed via bcrypt, select: false)
- `role`: String (enum: `['EMPLOYEE', 'AGENT', 'ADMIN']`, default: `'EMPLOYEE'`, indexed)
- `department`: String (required: e.g., 'Engineering', 'HR', 'Finance', 'Operations', 'IT Support')
- `phone`: String (optional)
- `avatar`: String (optional)
- `isActive`: Boolean (default: `true`, indexed)
- `createdAt`, `updatedAt`: Timestamps

### 3.2. `Category` Collection
- `_id`: ObjectId
- `name`: String (required, unique: e.g., 'Hardware', 'Software', 'Network', 'Access & Security', 'Email', 'Infrastructure')
- `description`: String
- `isActive`: Boolean (default: `true`)
- `createdAt`, `updatedAt`: Timestamps

### 3.3. `SLARule` Collection
- `_id`: ObjectId
- `priority`: String (enum: `['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']`, unique, required)
- `responseDeadlineMinutes`: Number (e.g. Critical: 15, High: 30, Medium: 120, Low: 240)
- `resolutionDeadlineMinutes`: Number (e.g. Critical: 120, High: 240, Medium: 720, Low: 1440)
- `warningThresholdPercent`: Number (default: 80)
- `description`: String
- `createdAt`, `updatedAt`: Timestamps

### 3.4. `Ticket` Collection
- `_id`: ObjectId
- `ticketId`: String (unique, human-readable e.g. `TKT-1001`, indexed)
- `title`: String (required, max 200 chars)
- `description`: String (required)
- `category`: ObjectId (ref: `'Category'`, required, indexed)
- `priority`: String (enum: `['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']`, default: `'MEDIUM'`, indexed)
- `status`: String (enum: `['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED', 'REOPENED']`, default: `'OPEN'`, indexed)
- `createdBy`: ObjectId (ref: `'User'`, required, indexed)
- `assignedTo`: ObjectId (ref: `'User'`, default: null, indexed)
- `attachments`: Array of Subdocuments:
  - `fileName`: String
  - `fileUrl`: String
  - `fileType`: String
  - `fileSize`: Number
  - `uploadedBy`: ObjectId (ref: `'User'`)
  - `uploadedAt`: Date
- `sla`:
  - `rule`: ObjectId (ref: `'SLARule'`)
  - `responseDeadline`: Date (indexed)
  - `resolutionDeadline`: Date (indexed)
  - `firstRespondedAt`: Date
  - `responseStatus`: String (enum: `['PENDING', 'MET', 'BREACHED']`, default: `'PENDING'`)
  - `resolutionStatus`: String (enum: `['PENDING', 'MET', 'BREACHED']`, default: `'PENDING'`)
  - `warningTriggered`: Boolean (default: `false`)
  - `isBreached`: Boolean (default: `false`, indexed)
- `escalation`:
  - `isEscalated`: Boolean (default: `false`, indexed)
  - `escalatedAt`: Date
  - `reason`: String
  - `escalatedTo`: ObjectId (ref: `'User'`)
- `resolvedAt`: Date
- `closedAt`: Date
- `reopenedCount`: Number (default: 0)
- `createdAt`, `updatedAt`: Timestamps

### 3.5. `Comment` Collection
- `_id`: ObjectId
- `ticket`: ObjectId (ref: `'Ticket'`, required, indexed)
- `user`: ObjectId (ref: `'User'`, required)
- `message`: String (required)
- `attachments`: Array of Subdocuments
- `isInternal`: Boolean (default: false - agent/admin note)
- `createdAt`, `updatedAt`: Timestamps

### 3.6. `TicketHistory` Collection (Immutable Audit Log)
- `_id`: ObjectId
- `ticket`: ObjectId (ref: `'Ticket'`, required, indexed)
- `performedBy`: ObjectId (ref: `'User'`, required)
- `action`: String (e.g. `'CREATED'`, `'ASSIGNED'`, `'STATUS_CHANGED'`, `'PRIORITY_CHANGED'`, `'COMMENT_ADDED'`, `'SLA_WARNING'`, `'SLA_BREACHED'`, `'ESCALATED'`, `'RESOLVED'`, `'REOPENED'`, `'CLOSED'`)
- `previousValue`: Schema.Types.Mixed
- `newValue`: Schema.Types.Mixed
- `details`: String
- `timestamp`: Date (default: `Date.now`)

### 3.7. `Notification` Collection
- `_id`: ObjectId
- `recipient`: ObjectId (ref: `'User'`, required, indexed)
- `type`: String (enum: `['TICKET_CREATED', 'TICKET_ASSIGNED', 'NEW_COMMENT', 'STATUS_UPDATED', 'SLA_WARNING', 'SLA_BREACHED', 'ESCALATION', 'TICKET_RESOLVED', 'TICKET_REOPENED', 'TICKET_CLOSED']`)
- `title`: String (required)
- `message`: String (required)
- `ticket`: ObjectId (ref: `'Ticket'`, required)
- `isRead`: Boolean (default: `false`, indexed)
- `createdAt`, `updatedAt`: Timestamps

### 3.8. `Feedback` Collection
- `_id`: ObjectId
- `ticket`: ObjectId (ref: `'Ticket'`, required, unique, indexed)
- `employee`: ObjectId (ref: `'User'`, required)
- `agent`: ObjectId (ref: `'User'`)
- `rating`: Number (required, min: 1, max: 5)
- `comment`: String
- `createdAt`: Timestamps

---

## 4. Ticket Lifecycle & State Machine

```
               [ EMPLOYEE / ADMIN ]
                      │
               Creates Ticket
                      │
                      ▼
                  ┌───────┐
                  │ OPEN  │
                  └───┬───┘
                      │
         [ ADMIN: Assigns to Agent ]
                      │
                      ▼
                ┌──────────┐
                │ ASSIGNED │
                └─────┬────┘
                      │
            [ AGENT: Accepts / Starts ]
                      │
                      ▼
             ┌─────────────────┐
             │   IN_PROGRESS   │◄────────────────┐
             └───────┬───┬─────┘                 │
                     │   │                       │
      [ Needs Info ] │   │ [ AGENT: Resolves ]   │ [ Employee: Reopens ]
                     │   │                       │
                     ▼   │                       │
             ┌───────────┤                       │
             │  PENDING  │                       │
             └─────┬─────┘                       │
                   │                             │
    [ Agent/Emp Resumes ]                        │
                   │                             │
                   ▼                             │
             ┌───────────┐                       │
             │ RESOLVED  ├───────────────────────┘
             └─────┬─────┘
                   │
         [ EMPLOYEE: Confirms / Auto-closes ]
                   │
                   ▼
              ┌────────┐
              │ CLOSED │ ──► [ EMPLOYEE Submits 1-5 Star Feedback ]
              └────────┘
```

### Transition Validation Rules:
1. `OPEN` → `ASSIGNED`: Allowed by `ADMIN`.
2. `ASSIGNED` → `IN_PROGRESS`: Allowed by assigned `AGENT` or `ADMIN`.
3. `IN_PROGRESS` → `PENDING`: Allowed by `AGENT` or `ADMIN` (when awaiting information).
4. `PENDING` → `IN_PROGRESS`: Allowed by `AGENT`, `EMPLOYEE`, or `ADMIN`.
5. `IN_PROGRESS` → `RESOLVED`: Allowed by assigned `AGENT` or `ADMIN`.
6. `RESOLVED` → `CLOSED`: Allowed by ticket creator (`EMPLOYEE`) or `ADMIN`.
7. `RESOLVED` → `REOPENED`: Allowed by ticket creator (`EMPLOYEE`) within reopen window.
8. `REOPENED` → `IN_PROGRESS` / `ASSIGNED`: Handled automatically.

---

## 5. SLA & Escalation Engine Architecture

### SLA Timetable Defaults:
| Priority | Response Target | Resolution Target | Warning Window (80%) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | 15 minutes | 2 hours (120 min) | At 96 minutes |
| **HIGH** | 30 minutes | 4 hours (240 min) | At 192 minutes |
| **MEDIUM** | 2 hours (120 min) | 12 hours (720 min) | At 576 minutes |
| **LOW** | 4 hours (240 min) | 24 hours (1440 min) | At 1152 minutes |

### SLA Engine Execution:
1. **At Ticket Creation**:
   - Query `SLARule` matching ticket priority.
   - Compute `sla.responseDeadline = createdAt + rule.responseDeadlineMinutes`.
   - Compute `sla.resolutionDeadline = createdAt + rule.resolutionDeadlineMinutes`.
2. **First Responded Tracking**:
   - First comment or status change from an agent sets `sla.firstRespondedAt = now`.
   - Compares against `responseDeadline` → marks `responseStatus = 'MET'` or `'BREACHED'`.
3. **Background Cron Service (`slaService.checkSLABreaches`)**:
   - Scans non-closed/non-resolved tickets.
   - If `currentTime >= 80% of deadline` & `warningTriggered == false`:
     - Sets `warningTriggered = true`.
     - Creates `SLA_WARNING` notification for assigned Agent & Admin.
     - Logs `SLA_WARNING` to `TicketHistory`.
   - If `currentTime > resolutionDeadline` & `isBreached == false`:
     - Sets `isBreached = true`, `sla.resolutionStatus = 'BREACHED'`.
     - Sets `escalation = { isEscalated: true, escalatedAt: now, reason: 'SLA Resolution Deadline Exceeded' }`.
     - Creates `SLA_BREACHED` / `ESCALATION` notification for Admin & Agent.
     - Logs `SLA_BREACHED` and `ESCALATED` to `TicketHistory`.

---

## 6. REST API Endpoints Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Public: Register new Employee (or initial Admin via seed).
- `POST /api/auth/login` - Public: Login with email/password, returns JWT token + user profile.
- `GET /api/auth/me` - Protected (Any Authenticated): Return current user profile.
- `PUT /api/auth/profile` - Protected (Any Authenticated): Update own name, phone, department, avatar.
- `PUT /api/auth/password` - Protected (Any Authenticated): Change password.

### User & Agent Management (`/api/users` - Admin Only)
- `GET /api/users` - Protected (`ADMIN`): List users with filters (role, department, status, search).
- `GET /api/users/agents` - Protected (`ADMIN`, `AGENT`): List active support agents (with workload count).
- `POST /api/users` - Protected (`ADMIN`): Create user/agent account with assigned role.
- `PUT /api/users/:id` - Protected (`ADMIN`): Update user profile/role/department.
- `PATCH /api/users/:id/status` - Protected (`ADMIN`): Activate / deactivate user account.

### Ticket Categories & SLA Rules (`/api/categories`, `/api/sla`)
- `GET /api/categories` - Protected (All Roles): List active ticket categories.
- `POST /api/categories` - Protected (`ADMIN`): Create new category.
- `PUT /api/categories/:id` - Protected (`ADMIN`): Update category.
- `DELETE /api/categories/:id` - Protected (`ADMIN`): Deactivate category.
- `GET /api/sla/rules` - Protected (All Roles / `ADMIN`): View configured SLA rules.
- `PUT /api/sla/rules/:id` - Protected (`ADMIN`): Update SLA response/resolution thresholds.

### Ticket Operations (`/api/tickets`)
- `GET /api/tickets` - Protected:
  - `EMPLOYEE`: Returns tickets created by requester.
  - `AGENT`: Returns tickets assigned to requester.
  - `ADMIN`: Returns all tickets (supports filtering by status, priority, category, agent, SLA, search).
- `POST /api/tickets` - Protected (`EMPLOYEE`, `ADMIN`): Create new ticket with optional file attachments.
- `GET /api/tickets/:id` - Protected (Scoped authorization): Retrieve ticket details, SLA, escalation status.
- `PATCH /api/tickets/:id/assign` - Protected (`ADMIN`): Assign or reassign ticket to an Agent.
- `PATCH /api/tickets/:id/status` - Protected (Role validated state machine): Update ticket status (`IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`, `REOPENED`).
- `PATCH /api/tickets/:id/priority` - Protected (`ADMIN`): Change priority and recalculate SLA.
- `GET /api/tickets/:id/history` - Protected (Scoped): Retrieve immutable activity history log.

### Comments & Attachments (`/api/tickets/:id/comments`)
- `GET /api/tickets/:id/comments` - Protected (Scoped): Retrieve comments.
- `POST /api/tickets/:id/comments` - Protected (Scoped): Post new comment with optional attachment.

### Feedback & Ratings (`/api/feedback`)
- `POST /api/feedback` - Protected (`EMPLOYEE`): Submit 1-5 star review for resolved/closed ticket.
- `GET /api/feedback/ticket/:ticketId` - Protected (Scoped): Get feedback for specific ticket.
- `GET /api/feedback/agent/:agentId` - Protected (`ADMIN`, `AGENT`): Get agent performance reviews.

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` - Protected (Any User): Fetch unread + recent notifications for user.
- `PATCH /api/notifications/:id/read` - Protected: Mark notification as read.
- `PATCH /api/notifications/read-all` - Protected: Mark all notifications as read.

### Analytics & Reports (`/api/analytics`)
- `GET /api/analytics/dashboard` - Protected (Role-specific aggregation):
  - `ADMIN`: System summary cards, ticket breakdown by status, priority, category, SLA breach rate, agent workload & resolution stats.
  - `AGENT`: Assigned ticket count, resolved count, SLA compliance %, average turnaround time.
  - `EMPLOYEE`: Total raised, active, resolved, satisfaction rating.
- `GET /api/analytics/reports/sla` - Protected (`ADMIN`): Detailed SLA breach and escalation report.
- `GET /api/analytics/reports/agents` - Protected (`ADMIN`): Comparative agent performance leaderboard.

---

## 7. Frontend Architecture (React + Vite + Tailwind CSS)

### Directory Structure:
```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/         # Navbar, Sidebar, Modal, Badge, Toast, Loader, EmptyState
│   │   ├── tickets/        # TicketCard, TicketList, TicketFilter, TicketDetailsView, StatusTimeline, SLAIndicator
│   │   ├── comments/       # CommentBox, CommentList, AttachmentUpload
│   │   ├── analytics/      # MetricCards, StatusPieChart, PriorityBarChart, SLABreachGauge, AgentLeaderboard
│   │   └── notifications/  # NotificationBell, NotificationDropdown, NotificationItem
│   ├── context/
│   │   ├── AuthContext.jsx       # User state, token management, login/logout, profile updates
│   │   ├── NotificationContext.jsx # Polling / badge state for notifications
│   │   └── ThemeContext.jsx      # Dark/Light mode tokens
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTickets.js
│   │   └── useNotifications.js
│   ├── layouts/
│   │   ├── AuthLayout.jsx        # Login, Register, Forgot Password
│   │   ├── DashboardLayout.jsx   # Shared responsive sidebar, topbar, active user nav
│   │   ├── EmployeeLayout.jsx    # Employee-scoped routes & navigation items
│   │   ├── AgentLayout.jsx       # Agent-scoped routes & queue metrics
│   │   └── AdminLayout.jsx       # Admin management links (Users, SLA, Categories, Reports)
│   ├── pages/
│   │   ├── auth/                 # Login.jsx, Register.jsx
│   │   ├── employee/             # EmployeeDashboard.jsx, CreateTicket.jsx, MyTickets.jsx, TicketDetail.jsx, FeedbackModal.jsx
│   │   ├── agent/                # AgentDashboard.jsx, AssignedTickets.jsx, AgentTicketDetail.jsx, AgentPerformance.jsx
│   │   ├── admin/                # AdminDashboard.jsx, AllTickets.jsx, UserManagement.jsx, CategoryManagement.jsx, SLAManagement.jsx, EscalationsView.jsx, ReportsView.jsx
│   │   ├── profile/              # ProfilePage.jsx
│   │   └── NotFound.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx         # BrowserRouter configuration
│   │   ├── ProtectedRoute.jsx    # Authentication & Role gatekeeper
│   │   └── RoleRedirect.jsx      # Directs to role-specific root (/employee/dashboard, etc.)
│   ├── services/
│   │   ├── api.js                # Axios instance with interceptors (JWT header, 401/403 auto-handle)
│   │   ├── authService.js
│   │   ├── ticketService.js
│   │   ├── commentService.js
│   │   ├── notificationService.js
│   │   ├── adminService.js
│   │   └── analyticsService.js
│   ├── utils/
│   │   ├── constants.js          # Status & Priority color tokens, role enums
│   │   ├── formatters.js         # Date formatting, SLA time remaining calculator
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 8. Backend Directory Structure (Node.js / Express)

```
server/
├── config/
│   ├── db.js             # Mongoose connection & connection event handling
│   ├── constants.js      # Roles, Statuses, Priorities, SLA Defaults
│   └── env.js            # Environment variable validation & exports
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── ticketController.js
│   ├── commentController.js
│   ├── categoryController.js
│   ├── slaController.js
│   ├── notificationController.js
│   ├── feedbackController.js
│   └── analyticsController.js
├── middleware/
│   ├── auth.js           # JWT verification & req.user attachment
│   ├── checkRole.js      # Multi-role access control middleware
│   ├── ticketAuth.js     # Resource-level ticket access authorization
│   ├── upload.js         # Multer file upload configuration & size/type validation
│   ├── validate.js       # Request body/param schema validator
│   └── errorHandler.js   # Centralized error handler returning standard JSON format
├── models/
│   ├── User.js
│   ├── Category.js
│   ├── SLARule.js
│   ├── Ticket.js
│   ├── Comment.js
│   ├── TicketHistory.js
│   ├── Notification.js
│   └── Feedback.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── ticketRoutes.js
│   ├── commentRoutes.js
│   ├── categoryRoutes.js
│   ├── slaRoutes.js
│   ├── notificationRoutes.js
│   ├── feedbackRoutes.js
│   ├── analyticsRoutes.js
│   └── index.js
├── services/
│   ├── authService.js
│   ├── ticketService.js
│   ├── slaEngine.js      # SLA calculation, countdowns, warnings & breach detection
│   ├── historyService.js # Immutable audit log creator
│   ├── notificationService.js
│   └── analyticsService.js
├── jobs/
│   └── slaCronJob.js     # Scheduled task runner checking SLA thresholds
├── seed/
│   └── seedData.js       # Comprehensive demo seed script (Admin, Agents, Employees, SLA rules, Categories, Tickets)
├── uploads/              # Local storage for file attachments
├── .env.example
├── server.js             # Express app bootstrap & route registration
└── package.json
```

---

## 9. Phase Execution Roadmap

- **Phase 0**: Architecture, Specs & Plan Verification *(Current)*
- **Phase 1**: Project initialization, server and client folder structures, root configurations & dependencies.
- **Phase 2**: MongoDB connection, Mongoose schemas, models, and data validation rules.
- **Phase 3**: Authentication system (JWT, bcrypt, registration, login, profile, password change).
- **Phase 4**: Dual-layer Role-Based Authorization & Middlewares (verifyToken, checkRole, ticketAuth).
- **Phase 5**: Ticket creation, auto-generated ID formatting (`TKT-1001`), scoped retrieval & filtering.
- **Phase 6**: Ticket assignment & reassignment workflow (Admin controls, agent workload distribution).
- **Phase 7**: Ticket status state machine engine (enforced transitions & validations).
- **Phase 8**: Comments, file attachments, and immutable `TicketHistory` audit logs.
- **Phase 9**: SLA calculation engine (response/resolution target computation on ticket creation).
- **Phase 10**: SLA background monitor, 80% warning threshold triggers, breach detection & auto-escalation.
- **Phase 11**: In-app notifications subsystem (creation on events, read status management).
- **Phase 12**: Feedback & 1-5 star ratings for closed/resolved tickets.
- **Phase 13**: Admin analytics, aggregated metrics & chart data endpoints.
- **Phase 14**: Frontend setup: React + Vite + Tailwind CSS + Lucide icons + React Router + AuthContext.
- **Phase 15**: Employee Portal UI (Dashboard, Create Ticket, My Tickets, Ticket Detail, Confirm/Reopen, Feedback).
- **Phase 16**: Agent Portal UI (Dashboard, Assigned Queue, Ticket Processing, Add Notes, Resolve, SLA timer).
- **Phase 17**: Admin Portal UI (System Dashboard, Recharts Analytics, User/Agent Mgmt, SLA Config, Escalations).
- **Phase 18**: Complete Frontend-Backend integration & end-to-end API binding.
- **Phase 19**: Security & RBAC double-check audit (testing every 403 / 401 scenario).
- **Phase 20**: End-to-End demonstration walkthrough testing & bug fixes.
- **Phase 21**: UI Polish, responsive optimization, modern dark/light styling, and toast notifications.
- **Phase 22**: Production readiness, environment configs, seed script validation, and comprehensive README documentation.
