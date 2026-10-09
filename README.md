# HRD Connect

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB_%26_Auth-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript)

**HRD Connect** is a comprehensive Human Resource Development (HRD) management platform developed for **Sapthagiri NPS University**. It streamlines campus placements, student skill tracking, attendance monitoring, and administrative workflows between Students, Trainers, and HRD Administrators.

---

## ✨ Key Features

- **Role-Based Dashboards**: Secure, distinct interfaces for Students, Trainers, and HRD Admins.
- **Attendance & Progress Tracking**: Trainers can seamlessly mark and monitor student attendance.
- **Permission Workflows**: Automated systems for students to submit leave or permission requests, featuring an HRD approval/rejection pipeline.
- **HRD Admin Management**: Secure portal for administrators to elevate user roles and audit overall cohort performance.
- **Official Reporting**: Dynamic, client-side generation of PDF and CSV reports for administrative auditing.
- **Premium User Interface**: Modern design leveraging Tailwind CSS, Glassmorphism aesthetics, and GSAP micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Lucide React
- **Reporting**: jsPDF, jsPDF-AutoTable

### Backend & Infrastructure
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email/Password)
- **Security**: Strict Row-Level Security (RLS) and server-side authorization triggers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- A Supabase Project (for Authentication and Database)

### 1. Clone the repository
```bash
git clone https://github.com/Tejas-D07/PromptXErrorZero.git
cd PromptXErrorZero
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup
Execute the required SQL schema in your Supabase SQL Editor. 
Key tables include:
- `profiles`
- `classes`
- `attendance`
- `requests`

*Note: Ensure that the RLS policies and the `enforce_role_update` security trigger are properly applied to prevent privilege escalation.*

### 5. Start the development server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the application.

---

## 🛡️ Architecture & Security Highlights

- **Row Level Security (RLS)**: Data access is strictly isolated at the database level. Students can only view their own records, Trainers manage only their assigned classes, and HRDs have full oversight.
- **Role Assignment**: User registration explicitly defaults to the `student` role. Promotion to `trainer` or `hrd` requires explicit administrative action via the secure Admin Management portal, enforced by PostgreSQL `BEFORE UPDATE` triggers.
- **Server Actions**: Form submissions and sensitive data mutations are handled securely on the server via Next.js Server Actions, bypassing the need for exposed API keys on the client.

---

## 🧪 Testing

The project includes an end-to-end testing suite to verify authentication workflows, RLS isolation, and data persistence.

1. Configure test accounts in a `.env.test` file.
2. Run the test script:
```bash
node test-e2e-final.js
```

---

## 📄 License
All rights reserved &copy; Sapthagiri NPS University.
