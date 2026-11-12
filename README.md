# Secure Cross-Platform Authentication System

A secure cross-platform web application built with **React Native (via React Native for Web)**, **Node.js**, **Express**, **MongoDB Atlas**, and **Firebase Authentication**.

The application implements Google OAuth 2.0 login with strict domain restriction, allowing only users from a specified organization domain (`@hbplus.fit`) to access the system, while rejecting all other domains.

---

## 🌐 Live Deployments

- **Frontend (Netlify - Preferred):** [https://graceful-starlight-3eff9b.netlify.app](https://graceful-starlight-3eff9b.netlify.app)
- **Frontend (Vercel):** [https://hb-assessment-mu.vercel.app](https://hb-assessment-mu.vercel.app)
- **Backend API (Render):** [https://mern-auth-backend-qkwp.onrender.com](https://mern-auth-backend-qkwp.onrender.com)
- **API Health Endpoint:** [https://mern-auth-backend-qkwp.onrender.com/api/health](https://mern-auth-backend-qkwp.onrender.com/api/health)

---

## 📋 Features Implemented

### Core Requirements
- **Google OAuth 2.0 Sign-In:** One-click authentication via Firebase Auth with popup flow.
- **Strict Domain Validation:** Enforces `@hbplus.fit` domain on the backend during token verification.
- **Domain Rejection Message:** Returns exact required response:  
  `"Access restricted. Please login using your official domain email."`
- **Protected Dashboard Page:** Restricted route accessible only with a valid authenticated session.
- **Cross-Platform Architecture:** Unified codebase with React Native for Web compatibility.
- **Logout Functionality:** Complete session destruction (Firebase signOut + JWT token clearance).
- **Loading & Error States:** Clear visual indicators during authentication and error alerts for rejected attempts.
- **Responsive Modern UI:** Clean, dark-mode design with responsive layout and alignment.

### Bonus Features Implemented
- **Role-Based Access Control (RBAC):** Admin and standard User roles.
- **Admin Management Panel (`/admin`):** Live user statistics, search, role editing, and account deletion.
- **Persistent Database Storage:** MongoDB Atlas database storing user records, roles, auth providers, and timestamps.
- **Server-Side Route Protection:** Express middleware (`protect` and `requireAdmin`) enforcing JWT authorization.

---

## 🔐 How Domain Restriction Works

The application employs a defense-in-depth approach where domain validation is enforced **authoritatively on the server**:

1. **Client Sign-In:** The user authenticates with Google via Firebase Auth (`signInWithPopup`).
2. **Token Transmission:** Upon Google sign-in, the client retrieves the cryptographic Firebase ID Token and transmits it to the backend via `POST /api/auth/firebase`.
3. **Cryptographic Verification:** The backend verifies the ID token using the Firebase Admin SDK (`admin.auth().verifyIdToken`). This confirms the token is genuinely issued by Google and has not been tampered with.
4. **Domain Enforcement:**
   ```typescript
   const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@hbplus.fit';

   if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
     return res.status(403).json({
       message: 'Access restricted. Please login using your official domain email.',
     });
   }
   ```
   - If `email` ends in `@hbplus.fit` &rarr; User is created/updated in MongoDB Atlas, and a signed JWT session token is returned.
   - If `email` ends in `@gmail.com` (or any other non-authorized domain) &rarr; Backend immediately aborts and returns HTTP 403 Forbidden with:
     > `"Access restricted. Please login using your official domain email."`
5. **Client Presentation:** The frontend catches the HTTP 403 response and surfaces the exact error message to the user.

---

## 🔄 Authentication Flow

```
User Click "Continue with Google"
               │
               ▼
Firebase OAuth Popup (Google Account Picker)
               │
               ▼
Client receives Google ID Token
               │
               ▼
POST /api/auth/firebase { token }
               │
               ▼
Backend verifies signature via Firebase Admin SDK
               │
        Is email valid?
        ├── NO  ──► Return 403 "Access restricted. Please login using your official domain email."
        │
        └── YES ──► Check/Upsert user in MongoDB Atlas
                    Issue 7-day signed application JWT
                    Return user profile + JWT to frontend
                    Redirect to /dashboard
```

---

## 🛠️ Tech Stack

- **Cross-Platform Frontend:** React Native, React Native for Web (`react-native-web`), React 18, Vite, Tailwind CSS, Axios, Firebase Web SDK v11, React Router v7.
- **Backend API:** Node.js, Express.js, TypeScript, Firebase Admin SDK v12, Mongoose, jsonwebtoken, bcryptjs, Zod.
- **Database:** MongoDB Atlas (Cloud Cluster).
- **Deployment:** Netlify / Vercel (Frontend), Render (Backend).

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18 or later
- npm or yarn
- MongoDB Atlas cluster or local MongoDB instance

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Abhishek2005-ard/HB-Assessment.git
cd HB-Assessment

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/mern_auth_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=crowddensitymahakumbh
ALLOWED_EMAIL_DOMAIN=@hbplus.fit
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyAkqVYAMQfYZ_FLkD3Y8vXuwE4zhE44F_4
VITE_FIREBASE_AUTH_DOMAIN=crowddensitymahakumbh.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crowddensitymahakumbh
VITE_FIREBASE_STORAGE_BUCKET=crowddensitymahakumbh.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=990163081493
VITE_FIREBASE_APP_ID=1:990163081493:web:52ef8d066e2e166ca7311c
```

### 3. Seed Test Accounts
To populate the database with default test accounts:
```bash
cd backend
npm run seed
```

### 4. Run Locally
In terminal 1 (Backend):
```bash
cd backend
npm run dev
```
In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Test Credentials (Pre-Seeded)

| Role | Email | Password | Access Tier |
|---|---|---|---|
| **Admin** | `admin@hbplus.fit` | `admin123` | Dashboard + User Management (`/admin`) |
| **User** | `john@hbplus.fit` | `user1234` | Profile Dashboard (`/dashboard`) |
| **User** | `jane@hbplus.fit` | `user1234` | Profile Dashboard (`/dashboard`) |

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas & Firebase Admin configuration
│   │   ├── controllers/     # Authentication, User profile, Admin management
│   │   ├── middleware/      # JWT protection, Admin RBAC, Error handling
│   │   ├── models/          # Mongoose User schema with bcrypt hashing
│   │   ├── routes/          # API routes (/api/auth, /api/users)
│   │   ├── utils/           # JWT generation utility
│   │   ├── seed.ts          # Database seed script
│   │   └── server.ts        # Express server entry point (0.0.0.0 binding)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext (React Context API)
│   │   ├── pages/           # LoginPage, DashboardPage, AdminPage
│   │   ├── firebase.ts      # Firebase Authentication initialization
│   │   └── App.tsx          # Client routing & protected routes
│   ├── public/              # _redirects (SPA routing for Netlify)
│   ├── netlify.toml         # Netlify build & redirect configuration
│   ├── vercel.json          # Vercel routing configuration
│   ├── .env.example
│   └── package.json
├── netlify.toml             # Root Netlify configuration
├── vercel.json              # Root Vercel configuration
├── package.json             # Root monorepo scripts
└── README.md                # Project documentation
```
