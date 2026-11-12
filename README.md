# MERN Role-Based Authentication System

A full-stack authentication and authorization platform built with Node.js, Express, React, TypeScript, and MongoDB. Supports email/password authentication, Google OAuth via Firebase Authentication, JSON Web Token (JWT) session handling, and role-based access control (RBAC) with an administrative user management dashboard.

---

## Architecture Overview

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Firebase Admin configuration
│   │   ├── controllers/     # Authentication, user profile, and admin handlers
│   │   ├── middleware/      # JWT protection, role authorization, error handling
│   │   ├── models/          # Mongoose User schema with bcrypt password hashing
│   │   ├── routes/          # Express route definitions (/api/auth, /api/users)
│   │   ├── utils/           # JWT generation utility
│   │   ├── seed.ts          # Database seed script for initial testing
│   │   └── server.ts        # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext (React Context API)
│   │   ├── pages/           # LoginPage, DashboardPage, AdminPage
│   │   ├── firebase.ts      # Client Firebase SDK initialization
│   │   └── App.tsx          # Client routing & layout
│   ├── .env.example
│   └── package.json
└── package.json             # Root scripts
```

---

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript, Mongoose (MongoDB ODM), Firebase Admin SDK, jsonwebtoken, bcryptjs, Zod
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router v7, Firebase Web SDK
- **Database:** MongoDB (Local or MongoDB Atlas)

---

## Prerequisites

- **Node.js**: v18 or later (`node -v`)
- **npm**: v9 or later (`npm -v`)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection URI

---

## Setup & Installation

### 1. Clone & Install Dependencies

Install dependencies for both frontend and backend services:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` files in both `backend` and `frontend` directories based on the provided templates.

#### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/mern_auth_db
JWT_SECRET=your_jwt_secret_key_min_32_characters
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
ALLOWED_EMAIL_DOMAIN=@hbplus.fit
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## Database Seeding

Populate the database with default accounts (admin and standard user) for testing:

```bash
cd backend
npm run seed
```

### Seed Accounts

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| Admin | `admin@hbplus.fit` | `admin123` | Dashboard + User Management (`/admin`) |
| User | `john@hbplus.fit` | `user1234` | User Dashboard (`/dashboard`) |
| User | `jane@hbplus.fit` | `user1234` | User Dashboard (`/dashboard`) |

---

## Running the Application

### Start Backend API Server
```bash
cd backend
npm run dev
```
The server starts at `http://localhost:5000` with hot reloading via `tsx`.

### Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
The Vite development server starts at `http://localhost:5173`.

---

## Authentication & Authorization Flow

### 1. Local Authentication (Email & Password)
- Registration validates payload schema via Zod (minimum password length, valid email syntax).
- Passwords are salt-hashed using `bcryptjs` (cost factor 10) in a pre-save Mongoose hook.
- Successful login issues a signed JWT containing the user ID with a 7-day expiration.

### 2. Google OAuth via Firebase
- Frontend invokes Firebase client SDK popup (`signInWithPopup`).
- The retrieved client ID token is sent to `POST /api/auth/firebase`.
- Backend verifies the ID token cryptographically using Firebase Admin SDK (`admin.auth().verifyIdToken`).
- **Domain Restriction:** The backend verifies that the authenticated email ends with `@hbplus.fit`. Unauthorized domains are rejected with HTTP 403 (`Access restricted. Please login using your official domain email.`).
- If valid, the user record is provisioned or synchronized in MongoDB and an application JWT is returned.

### 3. Role-Based Access Control (RBAC)
- Routes requiring authentication pass through `protect` middleware verifying the Bearer token.
- Administrative endpoints pass through `requireAdmin` middleware checking `req.user.role === 'admin'`.
- Non-admin attempts to access administrative endpoints return HTTP 403 Forbidden.
- Frontend route guards (`ProtectedRoute`) enforce client-side navigation restrictions based on authentication state and user role.

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user with email and password |
| `POST` | `/api/auth/firebase` | Public | Verify Firebase ID token and issue JWT |

### User Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Retrieve authenticated user profile |

### Admin Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/stats` | Admin | Aggregate user counts, role breakdown, provider stats |
| `GET` | `/api/users` | Admin | Paginated user list with search and role filter |
| `GET` | `/api/users/:id` | Admin | Retrieve single user details by ID |
| `PUT` | `/api/users/:id` | Admin | Update user information (name, email, role) |
| `DELETE` | `/api/users/:id` | Admin | Delete a user (prevents self-deletion) |

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and health check |

---

## Build & Production Deployment

To produce optimized production builds:

```bash
# Build backend TypeScript to ./dist
cd backend
npm run build

# Build frontend to ./dist
cd ../frontend
npm run build
```

Run backend in production mode:
```bash
cd backend
npm start
```
