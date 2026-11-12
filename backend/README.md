# MIRAX MEDIA — Backend API & Neon PostgreSQL Service

Production-ready backend architecture for **MIRAX MEDIA**, built with **Node.js, Express.js, Prisma ORM, Neon PostgreSQL, Zod validation, Helmet security, and Nodemailer**.

---

## 1. System Architecture

```
React Frontend (Vite)
      │
      ▼  POST /api/contact
Express Backend (Node.js)
      ├── Security: Helmet, CORS, express-rate-limit
      ├── Validation: Zod (input sanitization & type safety)
      ├── ORM: Prisma Client
      ▼
Neon Cloud PostgreSQL Database (`contacts` table)
      │
      ▼ (Asynchronous Non-Blocking Dispatch)
Nodemailer SMTP Service
      ├── 1. Internal Team Alert: hello@miraxmedia.in
      └── 2. Client Confirmation: customer@example.com
```

---

## 2. Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Prisma schema with Neon pooled/direct URL support
│   └── schema.sql          # Raw PostgreSQL SQL CREATE TABLE & index script
├── src/
│   ├── config/
│   │   └── database.js     # Singleton Prisma Client & DB health check
│   ├── controllers/
│   │   ├── contactController.js # Public enquiry submission & health check
│   │   └── adminController.js   # Protected enquiry management (CRUD)
│   ├── middleware/
│   │   ├── authMiddleware.js    # Timing-safe Admin API Key verification
│   │   ├── errorMiddleware.js   # Centralized error & 404 handlers
│   │   └── validateMiddleware.js# Zod schema validation middleware
│   ├── routes/
│   │   ├── contactRoutes.js     # Public /api/contact & /api/health
│   │   └── adminRoutes.js       # Protected /api/admin/contacts endpoints
│   ├── services/
│   │   └── emailService.js      # Nodemailer SMTP notification engine
│   ├── validators/
│   │   └── contactValidator.js  # Zod schemas for payload & query validation
│   ├── app.js              # Express app with Helmet, CORS, Rate Limiters
│   └── server.js           # Server entrypoint with graceful shutdown
├── .env.example            # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Neon PostgreSQL Database Setup

### Step 1: Create a Neon Project
1. Log in to [Neon Console](https://console.neon.tech/).
2. Create a new project named **`mirax_media`**.
3. In your project dashboard, copy the **Connection string**.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your Neon connection string:
```env
# Neon Connection String with SSL required:
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/mirax_media?sslmode=require&pgbouncer=true"

# Direct URL for Prisma migrations:
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/mirax_media?sslmode=require"
```

### Step 3: Run Database Migrations
Run Prisma migration to generate the `contacts` table in Neon:
```bash
npx prisma migrate dev --name init
```
Or push schema directly:
```bash
npx prisma db push
```

Alternatively, run the SQL script `prisma/schema.sql` directly inside Neon's SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    CREATE TYPE contact_status AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company_name VARCHAR(150),
  service VARCHAR(100) NOT NULL,
  budget VARCHAR(100),
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
```

---

## 4. API Reference

### Health Check
* **`GET /api/health`**
* **Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "service": "mirax-media-backend",
  "timestamp": "2026-11-12T12:00:00.000Z",
  "uptimeSeconds": 120,
  "database": {
    "provider": "Neon PostgreSQL",
    "connected": true,
    "latencyMs": 42
  }
}
```

---

### Submit Contact Enquiry (Public)
* **`POST /api/contact`**
* **Rate Limit:** 10 requests / 15 minutes per IP
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "fullName": "Vimal",
  "email": "customer@example.com",
  "phone": "+91 98765 43210",
  "companyName": "ABC Technologies",
  "service": "SEO Services",
  "budget": "₹25,000 - ₹50,000",
  "message": "We need complete SEO and content optimization for our e-commerce platform."
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Thank you! Your enquiry has been received. Our strategy team will contact you within 24 hours.",
  "data": {
    "id": "e7b1a209-411a-4286-9a5d-a60d6e6f98b2",
    "fullName": "Vimal",
    "email": "customer@example.com",
    "service": "SEO Services",
    "status": "NEW",
    "createdAt": "2026-11-12T12:05:00.000Z"
  }
}
```

---

### Admin Endpoints (Protected)
All admin endpoints require authentication via either:
* Header: `Authorization: Bearer <ADMIN_API_KEY>`
* Header: `x-admin-key: <ADMIN_API_KEY>`

#### 1. List All Enquiries
* **`GET /api/admin/contacts?page=1&limit=10&status=NEW`**
* **Query Parameters:**
  * `page` (integer, default: 1)
  * `limit` (integer, default: 10, max: 100)
  * `status` (NEW, CONTACTED, IN_PROGRESS, COMPLETED, REJECTED)
  * `search` (searches across name, email, phone, company, service)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "e7b1a209-411a-4286-9a5d-a60d6e6f98b2",
      "fullName": "Vimal",
      "email": "customer@example.com",
      "phone": "+91 98765 43210",
      "companyName": "ABC Technologies",
      "service": "SEO Services",
      "budget": "₹25,000 - ₹50,000",
      "message": "We need complete SEO and content optimization...",
      "status": "NEW",
      "createdAt": "2026-11-12T12:05:00.000Z",
      "updatedAt": "2026-11-12T12:05:00.000Z"
    }
  ],
  "pagination": {
    "totalRecords": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### 2. Get Single Enquiry
* **`GET /api/admin/contacts/:id`**

#### 3. Update Enquiry Status
* **`PATCH /api/admin/contacts/:id/status`**
* **Request Body:**
```json
{
  "status": "CONTACTED"
}
```

#### 4. Delete Enquiry
* **`DELETE /api/admin/contacts/:id`**

---

## 5. Running the Backend

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Start development server (with nodemon)
npm run dev

# 4. Start production server
npm start
```
Default server port is **`5000`** (`http://localhost:5000`).
