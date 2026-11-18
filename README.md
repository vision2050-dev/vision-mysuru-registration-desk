# 🏛️ Vision Mysuru 2050 — Event Registration Desk & E-Pass Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)
[![Vision Mysuru 2050](https://img.shields.io/badge/Branding-visionmysuru2050.in-8f1b1b)](https://visionmysuru2050.in)

A simple, modern, and production-ready **Registration Desk Platform** engineered for the marketing and delegate check-in operations of **Vision Mysuru 2050** (spearheaded by the SDM Institute for Management Development — SDMIMD, in partnership with CII Young Indians and Mysuru Grahakara Parishat).

---

## 🌟 Key Capabilities & Requirements Addressed

| Requirement | Implementation & Highlights |
| :--- | :--- |
| **1. Unique Individual E-Pass** | Generates verifiable, cryptographic digital passes with high-contrast QR codes (`VM2050-XXXX-MYS`), delegate USN, college badges, and printable PDF pass layout. |
| **2. Automated Email Delivery** | Sends official Vision Mysuru 2050 invitations with embedded scannable QR passes, event schedules, and direct mobile wallet links. Supports Gmail SMTP, Resend, and live simulator mode. |
| **3. Live Check-In Scanner** | Real-time smartphone/laptop camera scanner (`html5-qrcode`), continuous rapid scanning, duplicate entry warning (Pretix-style), manual search lookup, and live attendance metrics. |
| **4. Official Branding** | Faithful 1:1 match with [`visionmysuru2050.in`](https://visionmysuru2050.in): Mysuru Royal Crimson (`#8f1b1b`), Heritage Gold (`#b07c12`), and warm ivory cream (`#fffefc`). |

---

## 🔬 Architectural Design & Open-Source Inspirations

This platform blends the best design patterns from leading open-source ticketing engines:

* **[hi.events](https://github.com/hi-events/hi.events)**: Lightweight, mobile-first browser QR scanner with audio/haptic feedback and zero native app installation required for volunteers.
* **[pretix](https://github.com/pretix/pretix)**: Robust duplicate check-in prevention. If an e-pass is scanned twice, the screen flashes amber with the exact prior check-in timestamp and volunteer desk name to prevent pass-backs.
* **[alf.io](https://github.com/alfio-event/alf.io)**: Clean digital ticket badges with live admission watermarks, multi-category delegate classification, and undo capabilities.
* **[fossasia/open-event](https://github.com/fossasia/open-event-frontend)**: Bulk CSV attendee onboarding, pre-loaded Mysuru college directories, and real-time attendance CSV exports for event organizers.

---

## 📸 Platform Views & Routes

* **⚡ Check-In Scanner Desk (`/`)**: 
  * Live camera scanner with continuous auto-resume
  * Instant manual code entry & USB laser scanner support
  * Student lookup bar (search by Name, USN, or College for delegates without phones)
  * Real-time activity feed with 1-click Undo capability
  * Top metrics strip: Total Registered, Checked In (%), Pending Arrival, Emails Sent

* **👥 Attendees & E-Pass Registry (`/attendees`)**:
  * Filterable directory with search, status filters (Checked In vs Pending), and college filters
  * Single student walk-in registration modal
  * Bulk CSV upload modal with downloadable standard template
  * Send/resend e-pass email buttons
  * Live CSV attendance report export

* **✉️ Automated Email Dispatch (`/emails`)**:
  * One-click "Send All Pending E-Passes" bulk dispatch with progress tracking
  * Live interactive email preview iframe showing the exact email received by students
  * SMTP / Resend configuration status

* **🎫 Public Digital E-Pass (`/pass/[code]`)**:
  * Clean, responsive student pass card matching Vision Mysuru 2050 royal styling
  * High-res QR code, student USN, college name, and delegate category
  * Live "ADMITTED & VERIFIED" watermark stamp upon check-in
  * Print / Save as PDF button and SDMIMD campus Google Maps directions link

* **📊 Live Analytics & Reporting (`/analytics`)**:
  * Attendance percentage gauge
  * Institutional breakdown (SDMIMD, NIE Mysuru, SJCE / JSS STU, University of Mysore, VVCE, MITM, etc.)
  * Delegate category distribution (Student Delegate, Ideathon Finalist, Paper Presenter, VIP)

---

## 🚀 Hosting on Vercel (Recommended)

This project is built with **Next.js App Router** and is natively optimized for 1-click deployment on **Vercel**:

### 1. Deploy via GitHub:
1. Push this repository to your GitHub account (already linked to `https://github.com/vision2050-dev/vision-mysuru-registration-desk`).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository **`vision-mysuru-registration-desk`**.
4. Click **Deploy**. Vercel will automatically detect Next.js and build the production bundle.

### 2. Configure Environment Variables on Vercel:
In your Vercel Project Settings > **Environment Variables**, add:

```env
# Optional: Gmail SMTP credentials for sending actual e-pass emails
EMAIL_USER=visionmysuru2050@gmail.com
EMAIL_PASS=your-google-app-password
EMAIL_SERVICE=gmail

# Optional: Set your production URL
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Optional: Serverless Postgres (Neon / Supabase / Vercel Postgres)
# DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require
```

> **Note:** If no email credentials or database URLs are provided, the platform automatically runs with built-in zero-config state and simulation mode! It is 100% testable immediately after deployment.

---

## 🌐 Alternative Hosting Options

If you prefer self-hosting or institutional dedicated hosting:

### 1. **Railway / Render**
* Connect your GitHub repo.
* Build Command: `npm run build`
* Start Command: `npm start`
* Port: `3000`

### 2. **Docker Container**
Create a `Dockerfile` with standard Node.js alpine:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/vision2050-dev/vision-mysuru-registration-desk.git
cd vision-mysuru-registration-desk

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env.local

# 4. Start local development server
npm run dev

# 5. Open in browser
http://localhost:3000
```

---

## 🎨 Color Palette & Visual System

* **Mysuru Royal Crimson**: `#8f1b1b` (Primary brand color, headers, CTAs)
* **Mysuru Heritage Gold**: `#b07c12` (Accents, badges, borders)
* **Warm Sandalwood Cream**: `#fffefc` / `#f6f2ea` (Page background & ticket surface)
* **Deep Umber**: `#1f140c` (Headings & typography)
* **Success Green**: `#15803d` (Check-in verification badges)

---

## 👥 Credits & Organization

* **Event**: Vision Mysuru 2050 (A 25-Year Youth & Civic Think-Tank Summit)
* **Lead Institutions**: Shri Dharmasthala Manjunatheshwara Institute for Management Development (SDMIMD), Mysuru
* **Partners**: Confederation of Indian Industry (CII) Mysuru, Young Indians, Mysuru Grahakara Parishat (MGP)
* **Official Website**: [https://visionmysuru2050.in](https://visionmysuru2050.in)
