# DC Bill Automation System

A secure, responsive, and automated administrative platform custom-built for **Morarji Desai Residential School, Malur** to manage, track, and programmatically compile **Detailed Contingency (DC) Bills** onto pre-printed official government layouts.

---

## 🌟 Key Features

### 1. Automated DC Bill Number Sequencer
- Automatically computes the next sequential DC Bill Number based on the active financial year (e.g., `01 / 2026-27`, `02 / 2026-27`), zero-padded to two digits.
- Handles custom spacing and formats gracefully to prevent numbering collisions.

### 2. Multi-Page Programmatic PDF Engine
- Generates official contingency sheets using custom coordinate vector mapping (`pdf-lib`) to print text precisely on pre-printed government templates.
- **Smart Dynamic Pagination**: Fits 8–10 rows on the first page alongside school metadata, wraps longer particulars, and spans seamlessly across multiple pages.
- **Dynamic Signature Blocks**: Renders authorization blocks (Principal and District Officer) exactly 50 pt below the last row on the final page instead of static bottom alignment.

### 3. Dual-Language Kannada & English Support
- Supports rendering of Kannada Unicode text using embedded fonts (`NudiUni01e.ttf`, `NUDI01.TTF`, `NotoSansKannada-Regular.ttf`).
- Uses custom text scaling multipliers (1.4x) and a synthetic text bolding algorithm (combining fill & stroke) to make Kannada glyphs legible and match standard English lettering.

### 4. Interactive Bill Form & Overlay Bug Fixes
- Supports editing items on both desktop grid tables and responsive mobile item cards.
- Viewport-conditional rendering prevents DOM registration collisions.
- Features dynamic recalculation of total amounts and live validation.

### 5. Cheque Number Constraints
- Implements strict validation of 6-digit numeric cheque numbers (`z.string().regex(/^\d{6}$/)`).
- Runs **real-time database uniqueness checks** via Supabase to flag duplicate cheque numbers and block draft saves.

### 6. Bill Duplication & Advanced Live Search
- **Duplication**: One-click duplication clones all metadata, payee, and item rows into a new bill form while pre-generating the next sequential bill number.
- **On-Type Search**: Features debounced (350ms) search filtering that instantly scopes items by active sequential number, bypassing year matches.
- **Financial Year Scope**: Instantly scopes entire platform stats, records, and listings to a selected academic year (from `2024-25` to `2027-28`).

### 7. Modern Responsive Design
- Frosted-glass animated sidebar navigation drawer for mobile and tablet devices.
- Grid inputs scale from 1-column on mobile to 3-column on desktop screen widths.
- Clean typography and premium CSS glassmorphism effects.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind CSS, Turbopack)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with custom Row-Level Security)
- **PDF Generation**: [pdf-lib](https://pdf-lib.js.org/) (Custom programmatic vector drawing & Font embedding)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (Validation schema validation)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Sonner, Dialog, Table, Cards)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended).

### 2. Environment Setup
Create a `.env.local` file in the root directory and configure your Supabase variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Running Locally
Run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Production Build
Compile the project for production:
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `mdrs-malur-dc-bill-system` repository.
4. Expand the **Environment Variables** section and configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically build and publish your project!

---

## 👥 Authors & Credits
- **Developer**: [Manoj Kumar V](https://github.com/SVM3116) (Proud Alumnus of Morarji Desai Residential School).
- Official Site: Morarji Desai Residential School, Malur Town, Malur Taluk, Kolar District - 563130.
