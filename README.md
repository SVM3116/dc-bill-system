# 🏛️ KREIS - Multi-School DC Bill & Hand Voucher Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-15c38b?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dc-bill-system.vercel.app/)

A secure, multi-tenant administrative software platform custom-built for **Karnataka Residential Educational Institutions Society (KREIS)** schools (such as Morarji Desai Residential Schools and PU Colleges). 

The platform replaces manual typewriter entries and physical record tracking by programmatically compiling official **Detailed Contingency (DC) Bills** and **Hand Vouchers** onto standardized pre-printed layouts using high-fidelity vector PDF drawing and local Kannada (Nudi) fonts.

---

## 🔗 Live Application
* **Production Deployment**: [https://dc-bill-system.vercel.app/](https://dc-bill-system.vercel.app/)

---

## 🌟 Core System Architecture

### 🏢 1. Multi-School Tenancy & Isolation
* **Supabase Row-Level Security (RLS)**: Strictly isolates all database operations (inserts, updates, queries) by the authenticated school's user ID (`school_id`). Schools operate in virtual silos and can never view or modify another school's data.
* **Onboarding Setup Wizard**: Guides newly registered schools through a structured profile setup to input institutional details in Kannada (Nudi):
  * Kannada School Name (e.g., `ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ (ಹಿಂ.ವ-05), ಸೂಲಿಬೆಲೆ`)
  * Kannada School Address & Pincode
  * Maintenance and Salary Bank Account Numbers
  * Signature Labels (e.g., `ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ` on the right side and optionally `ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ` on the left side)
* **Onboarding Guard Middleware**: Next.js route middleware checks the profile status of users and intercepts unauthorized dashboard navigation, forcing onboarding completion.

### 💰 2. Dual-Account Ledger Separation
KREIS operational rules require absolute separation of funding and expense accounts:
1. **Maintenance Account (ನಿರ್ವಹಣಾ ಖಾತೆ)**: Used for daily operations, rentals, milling, and transport.
2. **Salary Account (ಸಂಬಳ ಖಾತೆ)**: Used for staff pay, guest lecturers, and honorariums.

The platform manages these accounts with:
* **Independent Sequential Numbering**: DC Bills are automatically numbered sequentially (e.g., `01 / 2026-27`, `02 / 2026-27`) restarting at `01` per account type per financial year.
* **Automated Rules Integration**: Configures signature layouts and maintained-by details dynamically on the PDF template based on the chosen account type.

---

## 🚀 Key Feature Modules

### 📋 1. Contingency Bills (DC Bills)
* **Itemized Sub-vouchers Grid**: Office staff can enter unlimited sub-bills with individual dates, invoice numbers, particulars (Kannada/English), and values.
* **Cheque Collision Verification**: Enforces exactly 6-digit cheque numbers and runs real-time queries to guarantee cheque number uniqueness within the school's ledger.
* **One-Click Template Duplication**: Allows duplicating existing bills to instantly generate new bills with copied payees, addresses, and line items under a newly calculated sequence number.
* **Debounced Search Index**: Search bar dynamically filters bills by Payee Name, Cheque Number, or sequential number (e.g. typing `2` matches `02 / 2026-27` directly).

### ✍️ 2. Hand Vouchers Module
A completely separate administrative ledger supporting four pre-defined layouts mapped to KREIS templates:
1. **Guest Teacher (ಗೌರವ ಧನ)**: Automatically compiles introductory paragraphs and certification fields for guest lecturers' monthly salaries.
2. **Milling & Cleaning (ಮಿಲ್ಲಿಂಗ್ ಮತ್ತು ಕ್ಲೀನಿಂಗ್)**: Includes columns for Date, Qty (Kg), and Rate.
3. **Labor / Coolie (ಕೂಲಿ)**: Includes fields for Qty/People and Rate.
4. **Gas / Transport (ಗ್ಯಾಸ್ / ಸಾಗಣೆ)**: Includes fields for Date and transport remarks.
* **Dynamic Amount Calculation**: Keystroke-level listeners capture quantity and rate entries to automatically compute row amounts and update the Gross Total on the fly.

### 📊 3. Cheque issue Register
* **Automatic Compilation**: Aggregates Net Payable amounts and concatenates multiple DC Bill sub-item purposes into a serial-wise numbered list of particulars (e.g., `1. Rent...\n2. Rent...`).
* **Interactive Filtering**: Filter panels update the register immediately upon selecting Financial Year, Date Range, or Account Type (Maintenance, Salary, or All).
* **Landscape A4 PDF Export**: Compiles landscape registers using pdf-lib, measuring row heights dynamically to span multiple pages gracefully.
* **Excel Export**: Generates zero-dependency spreadsheet files containing multi-line cells using HTML formatting.

### 📦 4. Bulk Document Downloader
* **ZIP Generation**: Located on the View Bills list page, allowing users to enter a date range and select Maintenance, Salary, or Combined documents.
* **Asynchronous Progress Tracker**: Fetches PDFs sequentially, tracks the compilation process (displaying document names and percentages), and bundles them into a ZIP archive using `jszip` on the client-side.

### 🛡️ 5. Secure PDF Watermarks
* **Audit Vector Stamp**: Draws an elegant vector watermark at the bottom-right corner of both DC Bills and Hand Vouchers containing the document ID and timezone-independent generation timestamp (`DD-MM-YYYY HH:MM:SS AM/PM`) to prevent fraudulent tampering.

### 📊 6. Interactive Live Simulator
* **Landing Sandbox**: On the public home page, a live simulator allows new users to test out both Portrait DC Bill templates and Landscape Cheque Registers.
* **Real-time Vector Previews**: Renders form entries dynamically into simulated A4 sheets featuring authentic Nudi fonts, watermark stamps, and layout alignments.

---

## 🛠️ Technology Stack & Core Utilities

* **Framework**: Next.js 16 (App Router, Turbopack, React 19)
* **Styling**: Tailwind CSS v4, Vanilla CSS
* **Database & Authentication**: Supabase (PostgreSQL with Row-Level Security)
* **PDF Vector Engine**: `pdf-lib` & `@pdf-lib/fontkit`
* **Kannada Unicode Font**: Custom `NudiUni01e.ttf` embedded natively for vector drawing and styled HTML previews.
* **Interactions**: Base UI React (`@base-ui/react`), Lucide React Icons
* **Compression**: `jszip` (Browser ZIP compilation)

---

## 📂 Project Structure

```
dc-bill-system/
├── public/                 # Static assets (fonts, logo, guide images)
├── src/
│   ├── app/                # Next.js App Router Pages & API Endpoints
│   │   ├── (auth)/         # Auth pages (Login, Signup)
│   │   ├── (dashboard)/    # Secure admin panel pages
│   │   ├── actions/        # Next.js Server Actions
│   │   ├── api/            # PDF generation and Cron endpoints
│   │   ├── globals.css     # Global styles & design system configuration
│   │   └── page.tsx        # Public landing home page
│   ├── components/         # Reusable UI components (Forms, Tables, Dialogs)
│   ├── lib/                # Database clients, conversion and text cleaning utilities
│   └── middleware.ts       # Auth checking & onboarding redirect guards
├── vercel.json             # Vercel cron and rewrite configurations
└── package.json            # Scripts & dependencies definition
```

---

## 💻 Local Setup & Development

### 1. Prerequisite Environment Variables
Create a `.env.local` file in the project's root folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. Local Installation & Run
```bash
# Install NPM packages
npm install

# Start the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal locally.

### 3. Production Compilation
```bash
# Compile and optimize for production
npm run build
```

---

## ☁️ Deployment on Vercel

The application is fully optimized for Vercel:
1. Import this repository into your Vercel Dashboard.
2. Configure the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel settings.
3. Deploy the application.
4. Vercel automatically maps the `cron` schedule configured in `vercel.json` to ping the keep-alive route `/api/cron` every 3 days. This prevents the free-tier Supabase database from going into auto-pause.

---

## 👨‍💻 Developer Profile & Contact Details

* **Project Developer**: **Manoj Kumar V** ([GitHub Profile](https://github.com/SVM3116) / [LinkedIn Profile](https://www.linkedin.com/in/manoj-kumar-v-svm/))
* **Email**: [svmmdrpu@gmail.com](mailto:svmmdrpu@gmail.com)
* **Phone**: [+91 7975464020](tel:+917975464020)
* **Associated Institutions**: Morarji Desai Residential School (Sulibele) & Morarji PU College (Hosakote)
* **Platform Purpose**: Administrative SaaS utility supporting Karnataka Residential Educational Institutions Society (KREIS) schools.
