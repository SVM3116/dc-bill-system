# 🏛️ MDRS Malur - DC Bill Automation System

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-15c38b?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://mdrs-malur-dc-bill-system.vercel.app/)

A secure, responsive, and automated administrative platform custom-built for **Morarji Desai Residential School, Malur** to manage, track, and programmatically compile **Detailed Contingency (DC) Bills** onto pre-printed official government layouts.

🔗 **Production Site URL**: [https://mdrs-malur-dc-bill-system.vercel.app](https://mdrs-malur-dc-bill-system.vercel.app/)

---

## 🌟 Key Modules & Feature Highlights

### 📋 1. Contingency Bills Management
* **Smart Bill Number Sequencer**: Automatically computes the next sequential DC Bill Number based on the active academic year context (e.g., `01 / 2026-27`), zero-padded to two digits.
* **Cheque Constraint & Validation**: Strict 6-digit cheque number verification with **real-time Supabase uniqueness queries** to prevent duplicate database entries on active sessions.
* **One-Click Duplication**: Duplicate any existing bill's payee info and line items with automatic sequential numbering in a single click.
* **On-Type Live Filtering**: Debounced search bar (350ms) filters contingency records instantly by sequence numbers (e.g. searching `2` matches `02` but ignores the `2026` year suffix).

### 🏷️ 2. Dynamic Deductions System (ಕಡಿತಗಳು)
* **Unlimited Custom Rows**: Support for creating arbitrary deduction line items (e.g., TDS, GST, retention fees, security deposits).
* **Dual Calculation Modes**: Define deductions as percentages or fixed rupee values with real-time browser recalculation.
* **Auto-Translation Engine**: Automatically translates the calculated **Net Payable Amount** (instead of the Gross Total) into professional English wording.

### 📄 3. Programmatic PDF Generation Engine
* **Vector Layout Rendering**: Generates official contingency layouts from scratch using coordinate mapping, lines, and borders via `pdf-lib`.
* **Multi-Page Pagination Grid**: Handles items dynamically—fits 8–10 rows on the first page, wraps long descriptions, and appends overflow details across subsequent pages.
* **Signatures & Alignment**: Draws the Principal and District Officer approval fields dynamically 50 pt below the last content row, avoiding visual overlaps.
* **Kannada Unicode Support**: Native rendering of Kannada scripts (`NudiUni01e.ttf`) using custom scale multiplier logic (1.4x) and a synthetic bolding algorithm.

### 🛡️ 4. Delete Confirmation Flow
* **Sequence-Only Modal Verification**: Toggling deletion opens an interactive `@base-ui/react` dialog requiring the user to confirm by entering only the sequence bill number (e.g., `02` or `2`).
* **Active-States Color Coding**: The confirmation button displays with a subtle light-red warning color (`bg-red-50 text-red-600`) when the input mismatch occurs and changes to a solid dark-red state (`bg-red-600 text-white`) when the code matches.

### ⚡ 5. Database Performance & Integrations
* **Secure Server Actions (RLS Fix)**: Relocated database inserts, updates, and deletes from client-side calls to Server Actions. This secures transaction sequences and ensures cookie-based authorization headers are sent directly, preventing Supabase RLS policy failures.
* **Database Keep-Alive Cron**: Set up Vercel-scheduled keep-alive pings (`/api/cron`) triggered every 3 days to keep the free-tier Supabase database hot and prevent auto-pausing.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Next.js 16 (App Router, Turbopack, React 19)
* **Styling**: Tailwind CSS v4, Vanilla CSS
* **Database & Auth**: Supabase (PostgreSQL with Row-Level Security)
* **PDF Utility**: `pdf-lib` & Fontkit (Custom glyph vector drawing)
* **Forms & Validation**: React Hook Form, Zod Resolver
* **Interactions**: Base UI React (`@base-ui/react`), Lucide React Icons

---

## 💻 Local Setup & Development

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher is recommended)
* A [Supabase](https://supabase.com) Project instance

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Local Installation & Run
```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal locally.

### 4. Build Compilation
To check type-safety and build static pages:
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

This app is optimized for seamless deployment on Vercel:

1. Import this repository into your Vercel Account.
2. In Project Settings, configure the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**. Vercel will build and assign your production domain.
4. Custom Cron schedules configured in `vercel.json` will automatically map to the project logs.

---

## 👨‍💻 Developer & School Profile

* **Project Developer**: **Manoj Kumar V** ([GitHub Profile](https://github.com/SVM3116))
* **School Context**: Morarji Desai Residential School ( Sulibele ) & Morarji PU College ( Hosakote )
* **Administrative Branch**: Morarji Desai Residential School, Malur Town, Malur Taluk, Kolar District - 563130.
