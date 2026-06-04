# 🏛️ KREIS DC Bill System - Step-by-Step User Guide

Welcome to the **KREIS Detailed Contingency (DC) Bill Automation Platform**. This guide provides a detailed, step-by-step walkthrough of the platform's features, interfaces, and operations to help new users configure their school profiles and generate error-free contingency bills.

---

## 📋 Table of Contents
1. [Introduction](#-1-introduction)
2. [Step-by-Step User Walkthrough](#-2-step-by-step-user-walkthrough)
   * [Step 1: Landing Page & Core Information](#step-1-landing-page--core-information)
   * [Step 2: Key Features Overview](#step-2-key-features-overview)
   * [Step 3: Interactive Live A4 PDF Simulator](#step-3-interactive-live-a4-pdf-simulator)
   * [Step 4: Login Interface](#step-4-login-interface)
   * [Step 5: signup Page for New Schools](#step-5-signup-page-for-new-schools)
   * [Step 6: School Profile Onboarding Setup](#step-6-school-profile-onboarding-setup)
   * [Step 7: School Dashboard & Analytics](#step-7-school-dashboard--analytics)
   * [Step 8: Contingency Bills Ledger](#step-8-contingency-bills-ledger)
   * [Step 9: Creating & Editing Contingency Bills](#step-9-creating--editing-contingency-bills)
   * [Step 10: Bill Detailed View](#step-10-bill-detailed-view)
   * [Step 11: PDF Compilation & Print Controls](#step-11-pdf-compilation--print-controls)
3. [⚙️ Calculations & Deductions Engine](#%EF%B8%8F-3-calculations--deductions-engine)
4. [💡 Troubleshooting & FAQs](#-4-troubleshooting--faqs)

---

## 🌅 1. Introduction
The KREIS DC Bill System is a multi-tenant administrative platform designed specifically for schools operating under the **Karnataka Residential Educational Institutions Society (KREIS)**. It eliminates manual typewriter entry and database calculations by compiling ready-to-print official contingency sheets dynamically utilizing server-side PDF vector rendering and official Kannada fonts.

---

## 🚶‍♂️ 2. Step-by-Step User Walkthrough

### Step 1: Landing Page & Core Information
When you visit the platform, you are welcomed by a clean, modern landing page providing a concise description of the application.

![1. Landing Page](public/guide/01_landing_page.png)

---

### Step 2: Key Features Overview
The features section lists the core functionalities of the platform, including Indic script vector compilation, custom signatures, unique cheque constraints, and multi-tenant isolation.

![2. Features Listing](public/guide/02_landing_features.png)

---

### Step 3: Interactive Live A4 PDF Simulator
Directly on the home page, a live interactive sandbox lets you try out the bill layout sheet. You can type in particulars, change amounts, and add taxes to instantly see how the A4 grid box updates calculations in real time.

![3. Live PDF Simulator](public/guide/03_landing_simulator.png)

---

### Step 4: Login Interface
To manage your school's bills, enter your registered institutional email and secure password.

![4. Login Page](public/guide/04_login_page.png)

---

### Step 5: signup Page for New Schools
For first-time registration, enter your school's official name (in English), the Principal's name, email address, and desired password.

![5. signup Page](public/guide/05_signup_page.png)

---

### Step 6: School Profile Onboarding Setup
Upon registration, you will be guided through a 3-step setup wizard to record details in **Kannada Unicode (Nudi)**:
* Kannada School Name (e.g., `ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಮಾಲೂರು ಟೌನ್`)
* Kannada School Address & Pincode
* Bank Account Details (Account Number & Type)
* Custom footer signature labels (e.g., Principal and District Officer)

![6. School Onboarding Setup](public/guide/09_school_setup_step1.png)

---

### Step 7: School Dashboard & Analytics
Once onboarded, your dashboard displays real-time metrics summarizing total contingency bills generated, gross expenditure, total taxes deducted, net payable amount, and a ledger of recent modifications.

![7. Admin Dashboard](public/guide/06_dashboard.png)

---

### Step 8: Contingency Bills Ledger
The ledger view lists your past bills. It features:
* Debounced search to match sequence numbers (e.g., searching `03` or `3` matches `03 / 2026-27` directly).
* Multi-year sorting filters.
* Reusable template copying options.

![8. Bills Listing Ledger](public/guide/07_bills_listing.png)

---

### Step 9: Creating & Editing Contingency Bills
When adding a new transaction:
* Enter the Cheque Number (must be exactly 6 digits; the database checks for duplicate entries under your school).
* Set the Cheque Date and Payee details.
* Add itemized sub-vouchers (specifying invoice numbers, dates, particulars, and cost).
* The net payable amount and its English word equivalent are computed on the fly.

![9. Create/Edit Bill Interface](public/guide/08_create_bill_step1.png)

---

### Step 10: Bill Detailed View
After saving, the system creates a full invoice details page summarizing the voucher breakdown, the gross totals, and the net payable calculations after deductions.

![10. Bill Detailed View](public/guide/10_bill_detail.png)

---

### Step 11: PDF Compilation & Print Controls
At the bottom of the details page, click **Download PDF** to compile the document. The system generates a high-fidelity vector PDF mapping all fields precisely onto standard government pre-printed formats using shaped Kannada characters.

![11. Document Print Options](public/guide/11_bill_detail_bottom.png)

---

## ⚙️ 3. Calculations & Deductions Engine

The platform automatically computes taxes and deductions based on your inputs:
* **Gross Amount**: Sum of all voucher line items.
* **Percentage Deductions** (e.g., TDS, GST): Calculated as a percentage of the Gross Amount.
* **Fixed Deductions**: Flat rupee values subtracted from the Gross Amount.
* **Net Payable**: Gross Amount minus Total Deductions. 

*Note: English amount in words are automatically generated based on the calculated Net Payable.*

---

## 💡 Troubleshooting & FAQs

### Q1: The generated PDF has misaligned text or overlapping characters.
* Ensure you have downloaded/printed in standard **A4 portrait layout** with **no margins (Scale: 100%)** selected in your print settings.

### Q2: Why does the system throw an error on Cheque Numbers?
* Cheque numbers must be exactly **6 digits** and must be **unique** within your school tenant to prevent double-entry errors.

### Q3: How do I change the signature labels on my PDF?
* Go to the **School Setup** route in the navigation sidebar, update step 2, and submit to save your new footer layouts.
