# Rohon Kumar Dutta — Portfolio 2.0

A modern, high-performance portfolio website built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Express.js** backed by **Turso (libSQL)**. Features real-time content management via a secure TOTP admin panel, in-memory PDF streaming for resumes, custom toast notifications, automated YouTube thumbnail extraction, and smooth physics-driven animations.

---

## 🚀 Features & Recent Updates

### 🎨 Design & Aesthetic System
- **Warm Parchment Theme (`#FDF4DC`)** — Default light mode is styled with a warm cream/parchment background, matched cards, and soft ambient glows with zero blue/cyan tinting.
- **Deep High-Contrast Typography** — Ultra-crisp `#0F0E0B` primary text and `#241D12` secondary text designed to meet WCAG AAA contrast standards on `#FDF4DC`.
- **Theme Switcher** — Seamless toggle between warm light mode (`#FDF4DC`) and deep dark mode (`#0B0B12`).
- **Interactive Mouse Background** — High-density particle matrix built with HTML5 Canvas using spring-physics repulsion without UI lag.
- **Strict 100% Minimum Zoom Lock** — Prevents accidental or intentional browser zoom-out below 100% across keyboard shortcuts (`Ctrl + -`), wheel gestures, pinch-to-zoom, and browser settings.

### ⏳ Cinematic Loading Screen
- **Paced Loading Counter** — Counts smoothly from 0% to 100% over ~3.5s with natural ease-out deceleration.
- **Milestone Pause** — Brief 300ms pause once 100% is reached.
- **Curtain Slide-Up Reveal** — Smooth 900ms cubic-bezier transition (`translateY(-100%)`) that lifts the white screen like a theater curtain to reveal the hero section.

### 📄 In-Page Resume Preview & Direct Download
- **Full-Screen Modal Overlay** — Rendered through a React Portal directly to `document.body` (`z-[99999]`), guaranteeing it sits strictly above the navigation bar.
- **Server-Side PDF Streaming Proxy (`/api/resume-proxy`)** — Bypasses slow Google Drive viewer embeds by streaming the PDF directly from the backend with in-memory caching (~14ms response time).
- **Direct 1-Click Download** — Directly downloads the file (`Content-Disposition: attachment`) without external redirects.

### 🎵 Music Recommendations & Auto-Thumbnails
- **Auto YouTube Cover Extraction** — Pasting any YouTube URL automatically extracts the high-resolution video thumbnail (`hqdefault.jpg`) for the album cover.
- **Integrated Video Player** — Clicking any recommendation launches a responsive in-page YouTube modal player.

### 🔐 Admin Panel & Content Management
- **One-Shortcut Access** — Press `Ctrl + Shift + A` anywhere on the site or navigate to `/#/admin`.
- **TOTP / 2FA Security** — RFC 6238 two-factor authentication with QR code setup, brute-force lockout, and password protection.
- **Full CRUD Management** — Real-time editing for Projects, Skills, Music recommendations, Work timeline, and Avatar settings.
- **Interactive Analytics Dashboard** — Real-time visitor interaction metrics (page views, project clicks, GitHub links, resume downloads) with refresh & clear capabilities.
- **Strategy Call Bookings** — Live meeting schedule management with automated conflict prevention and status updates.

### ⚡ Performance, Storage & Backend
- **Turso Edge Database (libSQL)** — Fast, lightweight SQLite edge database replacing legacy Supabase tables.
- **One-Command Dev Environment** — `npm run dev` concurrently boots both Vite (frontend on `:3000`) and Express with hot reload (`node --watch` on `:3001`).
- **Toast Notification Engine** — Custom animated toast system (`Toast.tsx`) giving instant visual feedback on all operations.
- **2MB Upload Guard & 25MB Body Limit** — Enforces client-side image limits while allowing 25MB JSON batches on Express for seamless base64 sync.
- **Instant Client-Side Cache** — Immediate `localStorage` mirroring ensures instant UI updates even before network roundtrips.

---

## 📋 Tech Stack

| Category               | Technology                                             |
| ---------------------- | ------------------------------------------------------ |
| **Frontend Framework** | React 19.0.1                                           |
| **Backend Framework**  | Node.js & Express.js 4.21                              |
| **Database**           | Turso (@libsql/client, SQLite Edge DB)                 |
| **Email Service**      | Nodemailer (Gmail SMTP)                                |
| **Language**           | TypeScript 5.8                                         |
| **Build Tool**         | Vite 6.2.3                                             |
| **Styling**            | Tailwind CSS 4.1.14 & PostCSS                          |
| **Animations**         | Motion 12.23 (Framer Motion), HTML5 Canvas             |
| **Icons**              | Lucide React 0.546, React Icons 5.7                    |
| **Authentication**     | OTPAuth 9.5.1 (TOTP / RFC 6238 standard)              |
| **Process Runner**     | Concurrently 10.0 (unified frontend + backend startup) |

---

## 🛠️ Prerequisites

- **Node.js** 18+ (tested on Node v20 & v24)
- **npm** 8+
- **Turso Database Account** (free tier at [turso.tech](https://turso.tech))

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rohonDutta/portfolio2.0.git
cd portfolio-2.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (also replicated in `backend/.env` if running services separately):

```env
# Application URLs
VITE_APP_URL="http://localhost:3000"
VITE_API_URL="http://localhost:3001"
SERVER_PORT=3001

# Turso Database Credentials
TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"

# Admin Authentication
VITE_TOTP_SECRET=""

# Email Configuration (Nodemailer - Optional for Strategy Calls)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-google-app-password"
```

### 4. Run Locally (Unified Command)

Start both the frontend and backend with a single command:

```bash
npm run dev
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **Admin Panel:** `http://localhost:3000/#/admin` (or press `Ctrl + Shift + A`)

---

## 🏗️ Project Structure

```
portfolio-2.0/
├── backend/
│   └── index.js             # Express API (Turso CRUD, PDF proxy, Nodemailer, Bookings)
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.tsx       # Navigation bar with theme toggle
│   │   ├── Hero.tsx         # Hero section with interactive speech bubble & avatar
│   │   ├── About.tsx        # Bio & work experience timeline
│   │   ├── Skills.tsx       # Technical skills categorized
│   │   ├── Projects.tsx     # Featured projects gallery
│   │   ├── MusicSection.tsx # YouTube tunes with auto-thumbnail extraction
│   │   ├── BookCall.tsx     # Strategy call booking with calendar conflict check
│   │   ├── ResumeModal.tsx  # In-page PDF preview & direct download modal
│   │   ├── AdminPanel.tsx   # Authenticated CMS for live portfolio editing
│   │   ├── Toast.tsx        # Toast notifications system
│   │   ├── LoadingScreen.tsx# 0-100% counter with curtain reveal transition
│   │   ├── MouseEffectBackground.tsx # Canvas interactive particles
│   │   └── Footer.tsx       # Footer links & status
│   ├── pages/
│   │   └── AdminPage.tsx    # Standalone full-screen admin route
│   ├── lib/
│   │   ├── storage.ts       # Turso API client + instant localStorage sync
│   │   ├── totp.ts          # RFC 6238 TOTP authentication
│   │   └── validate.ts      # Input validation & XSS sanitization
│   ├── App.tsx              # Root component & route manager
│   ├── index.css            # Tailored theme colors & global CSS variables
│   ├── types.ts             # TypeScript interfaces
│   └── data.ts              # Fallback seed data
├── index.html               # Entry HTML with 100% zoom lock & theme pre-init
├── package.json             # Root scripts & dependencies
└── vite.config.ts           # Vite build configuration
```

---

## 🔐 Admin Panel Guide

1. **Accessing:** Press `Ctrl + Shift + A` on any page or visit `/#/admin`.
2. **Default Password:** `admin` (changeable in `AdminPanel.tsx`).
3. **2FA Setup:** On first login, scan the QR code using Google Authenticator or Authy.
4. **Editable Sections:**
   - **Hero & Profile:** Avatar photo upload, status badge text.
   - **Projects:** Add, reorder, or edit descriptions, tags, and links.
   - **Music:** Input YouTube link (auto-fetches thumbnail) or upload custom cover (max 2MB).
   - **Skills & Experience:** Update technical stacks and career milestones.
   - **Resume:** Update Google Drive PDF link (automatically serviced via local proxy).
   - **Analytics:** View real-time clicks and page loads; clear or refresh logs.

---

## 📚 Available Scripts

```bash
npm run dev        # Run both backend API & Vite frontend concurrently
npm run server     # Run backend standalone with auto-reloading (node --watch)
npm run lint       # Run strict TypeScript compiler check (tsc --noEmit)
npm run build      # Create production build in dist/
npm run preview    # Preview production build locally
```

---

## 📄 License

This portfolio is developed for personal branding and open-source learning. Feel free to use it as inspiration or a template for your own developer portfolio.

---

**Built with ❤️ by Rohon Kumar Dutta**
