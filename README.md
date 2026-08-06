# CollaboWrite_2.0

A modern fullstack MERN application for collaborative writing.

## Project Structure

- `/client` - React + Vite + TypeScript application with Tailwind CSS (v4), Zustand, TanStack Query, Framer Motion, and React Router.
- `/server` - Express + Node.js + TypeScript server with Mongoose (MongoDB), Socket.io, JWT authentication, and bcrypt.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas URI)

### Setup Environment Variables

Both `/client` and `/server` require configuration. Copy the respective `.env.example` files to `.env` and fill in the details.

1. **Server Setup**:
   ```bash
   cd server
   cp .env.example .env
   # Or on Windows PowerShell:
   copy .env.example .env
   ```
   Fill in your `MONGODB_URI`, `JWT_SECRET`, etc.

2. **Client Setup**:
   ```bash
   cd client
   cp .env.example .env
   # Or on Windows PowerShell:
   copy .env.example .env
   ```

### Installation

Install dependencies for both folders:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Running the Application

For local development:

1. **Start the Express Server**:
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000` (or the configured `SERVER_PORT`).
   Verify the health endpoint at: `http://localhost:5000/api/health`

2. **Start the Vite Dev Server**:
   ```bash
   cd client
   npm run dev
   ```
   The client will start on `http://localhost:5173`.
   Vite's proxy is pre-configured to forward `/api` requests to the Express server to prevent CORS issues.
