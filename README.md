# 🏛️ KREIS - Multi-School DC Bill Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-15c38b?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-dc--bill--system.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dc-bill-system.vercel.app/)

**Live URL**: [https://dc-bill-system.vercel.app/](https://dc-bill-system.vercel.app/)

A secure, multi-tenant administrative SaaS platform designed for **Karnataka Residential Educational Institutions Society (KREIS)** schools. Each registered school operates independently, configures its profile, and programmatically compiles official **Detailed Contingency (DC) Bills** onto pre-printed layouts.

---

## 🌟 Upgraded & New Feature Highlights

### 📊 1. Live Interactive PDF Simulator
* **Side-by-Side Visual Twin**: Directly on the landing page, users can test bill generation live with a high-fidelity visual copy of the generated PDF sheet layout.
* **A4 Paper Representation**: Replicates the physical A4 format page, complete with outer and inner border margins, pre-printed Kannada school headings, and conditional signature lines.
* **Divided Metadata Grid Box**: Recreates the official grid coordinates table containing DC Bill Numbers, Cheque Numbers, Dates, and Vendor details.
* **On-the-Fly Calculations**: Computes gross totals, deducts tax structures (percentage or fixed TDS/GST), and calculates Net Payable values with instant page updates.

### 🔤 2. Custom Nudi Unicode Font Engine
* **High-Fidelity Browser Rendering**: Registered the official `NudiUni` font face (`/fonts/NudiUni01e.ttf`) for native browser text styling. The HTML live preview now mirrors the exact font face used in the generated PDF files.
* **Native Vector PDF Drawing**: Server-side rendering compiles Kannada scripts natively using scale multiplier logic (1.4x) and synthetic bolding algorithms via `pdf-lib` and `@pdf-lib/fontkit`.

### 🏢 3. Multi-School Tenancy & Onboarding Setup
* **Isolated Tenancies**: sandboxed registers for each school using email credentials.
* **Onboarding Setup Wizard**: Compulsory step-by-step onboarding screen to record Kannada school names, addresses, active bank accounts, and signature preferences.
* **Protected Dashboard Access**: Next.js route middleware prevents dashboard access until onboarding is successfully completed.
* **Principal Name Integration**: Dynamically greets the authenticated school principal on the dashboard navigation.

### 📋 4. Contingency Bills Management
* **Sequential Bill Numbering**: Automatically computes the next consecutive sequence (e.g., `01 / 2026-27`) based on the school's fiscal year.
* **Real-time Cheque Validation**: Prevents cheque collisions by checking 6-digit cheque number uniqueness against the Supabase database.
* **One-Click Duplication**: Duplicate templates of previous payees or vouchers to save entry time.
* **Debounced Ledger Search**: Search bills instantly by sequence numbers (e.g. `3` matches `03`) ignoring suffixes.

### 🛡️ 5. Base-UI Delete Confirmation Flow
* **Verification Modals**: Safe deletion of ledger records using base-ui dialog boxes that prompt users to enter the sequential bill number to confirm.
* **Active-State Alerts**: Color-coded buttons transition from warning light-red to solid crimson when verification matches.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router, Turbopack, React 19)
* **Styling**: Tailwind CSS v4, Vanilla CSS
* **Database & Auth**: Supabase (PostgreSQL with Row-Level Security)
* **PDF Utility**: `pdf-lib` & Fontkit (Custom glyph vector drawing)
* **Interactions**: Base UI React (`@base-ui/react`), Lucide React Icons

---

## 💻 Local Setup & Development

### 1. Configure environment files
Create a `.env.local` file in the root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. Local Installation & Run
```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal locally.

### 3. Build Compilation
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

This app is optimized for seamless deployment on Vercel:
1. Import this repository into your Vercel Account.
2. In Project Settings, configure the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Click **Deploy**. Vercel will build and assign your production domain.
4. Custom Cron schedules configured in `vercel.json` will automatically map to the keep-alive pings (`/api/cron`) every 3 days.

---

## 👨‍💻 Developer Profile & Contact Details

* **Project Developer**: **Manoj Kumar V** ([GitHub Profile](https://github.com/SVM3116))
* **Email**: [svmmdrpu@gmail.com](mailto:svmmdrpu@gmail.com)
* **Phone**: [+91 7975464020](tel:+917975464020)
* **Associated Institutions**: Morarji Desai Residential School (Sulibele) & Morarji PU College (Hosakote)
* **Platform Purpose**: Administrative utility supporting Karnataka Residential Educational Institutions Society (KREIS) schools.
