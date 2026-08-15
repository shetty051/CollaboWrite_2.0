# 🖋️ CollaboWrite 2.0

> **A Next-Generation Real-Time Collaborative Writing & Editorial Studio**

CollaboWrite 2.0 is a full-stack MERN TypeScript web platform designed to combine the mechanical speed of real-time collaborative compilers with a quiet, editorial reading studio. Built with **React 19**, **Vite**, **Node.js**, **Express**, **MongoDB Atlas**, and **Socket.io**.

---

## 🌟 Key Features

* **⚡ Real-Time Collaborative Editor**: Co-author manuscripts simultaneously using Tiptap rich-text editor with instant Socket.io document syncing.
* **👥 Reader & Author Profiles**: Interactive public author profiles (`/profile/:id`), follower system, follower/following counters, and role-based workspace views.
* **📚 Curated Library Archive**: Browse public manuscripts, search by keyword/title, and filter by genre. Includes responsive empty-state handling for new deployments.
* **🔔 Live Socket Notifications**: Real-time notifications for follow events, collaboration requests, and manuscript updates.
* **🛡️ JWT Cookie Authentication**: HttpOnly cookie-based authentication with bcrypt password hashing and MongoDB Atlas integration.
* **🌙 Dynamic Theme System**: Warm paper/dark editorial theme switcher crafted for comfortable long-form reading and writing.
* **📱 Fully Responsive**: Custom mobile layouts optimized for all device viewports (320px – 1920px+).

---

## 🏗️ Tech Stack

### **Frontend** (`/client`)
* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS v4 + Vanilla CSS + Framer Motion
* **State Management**: Zustand (Auth, Toasts, Theme)
* **Data Fetching**: TanStack React Query v5
* **Editor**: Tiptap Rich Text Editor (`@tiptap/react`)
* **Icons**: Lucide React

### **Backend** (`/server`)
* **Runtime**: Node.js + TypeScript
* **Framework**: Express.js
* **Database**: MongoDB Atlas + Mongoose ORM
* **Real-Time Sync**: Socket.io
* **Authentication**: JSON Web Tokens (JWT) in HttpOnly cookies + bcrypt

---

## 📁 Repository Structure

```
CollaboWrite_2.0/
├── client/                 # React 19 + Vite Frontend App
│   ├── src/
│   │   ├── api/            # API client wrapper
│   │   ├── components/     # UI components (Header, Footer, ProfileView, etc.)
│   │   ├── pages/          # Pages (Home, Library, Dashboard, UserProfile, etc.)
│   │   ├── store/          # Zustand state stores
│   │   └── types/          # Shared TypeScript interfaces
│   ├── vercel.json         # Vercel deployment SPA rewrite config
│   └── package.json
│
├── server/                 # Node.js + Express Backend API & Socket Server
│   ├── src/
│   │   ├── config/         # Database & JWT configurations
│   │   ├── controllers/    # API endpoint handlers (auth, stories, users, etc.)
│   │   ├── middleware/     # Auth & error handling middlewares
│   │   ├── models/         # Mongoose database schemas
│   │   ├── routes/         # Express API routes
│   │   └── scripts/        # Seeding & utility scripts
│   └── package.json
│
└── README.md               # Project Documentation
```

---

## 🚀 Quick Start (Local Development)

### **Prerequisites**
* Node.js (v18 or higher recommended)
* npm or yarn
* MongoDB Atlas cluster or local MongoDB instance

### **1. Setup Environment Variables**

#### Backend (`/server/.env`)
```env
SERVER_PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_jwt_key
```

#### Frontend (`/client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

### **2. Install Dependencies**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### **3. Launch Development Servers**

```bash
# Terminal 1 — Express Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Vite Frontend Server (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 🌐 Production Deployment

* **Frontend Hosting**: **Vercel** *(Hobby Tier)* — Automatic builds with SPA rewrites via `vercel.json`.
* **Backend Hosting**: **Render** *(Web Service)* — Long-running Node.js process supporting WebSockets.
* **Database**: **MongoDB Atlas** *(M0 Shared Cluster)*.

---

## 📝 License & Credits

Created by **Aakash B Shetty** ([@shetty051](https://github.com/shetty051)).  
Built for thoughtful creators and collaborative writers.
