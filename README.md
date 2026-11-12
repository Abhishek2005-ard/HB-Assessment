# MERN Authentication Assessment

Full-stack MERN Authentication System with Role-Based Access Control (RBAC), JWT authentication, Firebase integration, and an Administrator Management Dashboard.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (verified with v20.19.6)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`
  - Check status: `Get-Service MongoDB`
  - Start if stopped: `Start-Service MongoDB`

### 2. Seed Database
Populate test accounts (Admin & Users):
```bash
npm run seed
```

### 3. Start Backend
```bash
cd backend
npm run dev
```
Backend runs at: **http://localhost:5000**

### 4. Start Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@hbplus.fit` | `admin123` | Full access + Admin Panel (`/admin`) |
| **Standard User** | `john@hbplus.fit` | `user1234` | Profile Dashboard (`/dashboard`) |
| **Standard User** | `jane@hbplus.fit` | `user1234` | Profile Dashboard (`/dashboard`) |

> 💡 **Convenience Feature**: On the login page, you can click on the credentials box to auto-fill the login form instantly!

---

## 🛠️ Features & Completed Architecture

### Frontend (React + TypeScript + Vite + Tailwind CSS)
- **Secure Authentication Flow**: Login and registration with email/password and Firebase Google Sign-In.
- **Fail-Safe Firebase Initialization**: Fallbacks prevent browser runtime crashes even when third-party Firebase environment keys are unconfigured.
- **Protected Routing**: Route guards (`ProtectedRoute`) redirect unauthenticated users to `/login`.
- **Responsive Top Navigation Bar**: Persistent navigation with user avatar, role indicator, page switching, and secure logout.
- **User Profile Dashboard (`/dashboard`)**: Displays user details, account creation timestamp, verified status badge, and role level.
- **Admin Management Panel (`/admin`)**:
  - Live statistical overview cards (Total Users, Admins, Standard Users, Providers).
  - Search and filter users by name, email, or role (`admin` / `user`).
  - Edit user information (Name, Email, Role) via modal dialog.
  - Delete users with confirmation (prevents self-deletion by active admin).
  - Role-based protection: non-admin users attempting to visit `/admin` receive an "Access Denied" notice.

### Backend (Node.js + Express + TypeScript + MongoDB + JWT)
- **Role-Based Access Control**:
  - `authMiddleware` (`protect`): Validates Bearer JWT tokens.
  - `adminMiddleware` (`requireAdmin`): Verifies `user.role === 'admin'`.
- **Database Resilience**: Configured Mongoose to prioritize IPv4 (`127.0.0.1`) over Windows IPv6 (`::1`) to eliminate connection dropouts.
- **Port Conflict Handling**: Graceful error listener prevents unhandled crashes if port 5000 is occupied.
- **API Endpoints**:
  - `POST /api/auth/register` — Register a new account
  - `POST /api/auth/login` — Sign in with email and password
  - `POST /api/auth/firebase` — Firebase ID token verification and exchange
  - `GET /api/users/me` — Authenticated current user profile
  - `GET /api/users/stats` — Admin dashboard user statistics
  - `GET /api/users` — Admin list users with pagination & search
  - `GET /api/users/:id` — Admin get user by ID
  - `PUT /api/users/:id` — Admin update user details
  - `DELETE /api/users/:id` — Admin delete user account
  - `GET /api/health` — Server health monitoring

