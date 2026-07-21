# Portfolio Project — Work Status Document
**Project:** Rohon Kumar Dutta — Portfolio 2.0  
**Stack:** React + TypeScript + Vite + Tailwind CSS + Motion  
**Date:** July 19, 2026

---

## OVERALL PROGRESS

| Area | Status | % Done |
|---|---|---|
| Resume & Personal Data Update | ✅ Complete | 100% |
| Projects Section | ✅ Complete | 100% |
| Skills Section | ✅ Complete | 100% |
| Work Experience | ✅ Complete | 100% |
| Resume Download (View in Browser) | ✅ Complete | 100% |
| Social Flip Button (Footer) | ✅ Complete | 95% |
| Input Validation & Sanitization | ✅ Complete | 100% |
| Source Map Protection | ✅ Complete | 100% |
| TOTP / OTP Admin Login | ✅ Complete | 100% |
| Brute-force Lockout | ✅ Complete | 100% |
| Admin Panel — Separate Page | 🔶 Partial | 60% |
| Admin Panel — Color / Theme Fix | 🔶 Partial | 40% |
| Admin Panel — Scrollable QR Screen | 🔶 Partial | 50% |
| Footer Links (Rohon's actual links) | ✅ Complete | 100% |
| Hero Bio Text | ✅ Complete | 100% |
| About Section Bio | ✅ Complete | 100% |

---

## COMPLETED & WORKING ✅

### 1. Resume & Personal Data
- Name updated to **Rohon Kumar Dutta** everywhere
- Location changed from Bongaon → **Kalyani**
- Hero bio updated: "B.Tech (IT) student at JIS College of Engineering"
- Expertise changed to "Full Stack Developer & Android Engineer"
- About section bio paragraphs updated to reflect real background

### 2. Skills
- `FRONTEND_TOOLS` → HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Git
- `BACKEND_TOOLS` → Node.js, Express.js, Django, Python, MongoDB, REST APIs
- `UI_LIBRARIES` → ReactJS, NextJS, NodeJS, ExpressJS, Tailwind CSS, Framer Motion
- Stale localStorage cache-busting added (auto-resets old data on load)

### 3. Projects
- All 6 old projects removed
- 3 real projects added:
  - **AI Money Mentor** — React/Node/Express/Gemini 2.0 Flash — live link + GitHub
  - **FitLife (Android)** — Kotlin/Jetpack Compose/Health Connect — live link + GitHub
  - **Online Mechanic Booking System** — Django/Python — GitHub only
- Each card shows: project image (MacBook mockup), GitHub button, Live Demo button
- Hover overlay on image shows icon buttons for quick access
- "No Live Demo" disabled state shown when liveUrl is `#`
- Subtitle copy updated (no more "Zenith Studio" references)

### 4. Work Experience
- Updated to **Python Django Intern @ Euphoria Genx (Jun–Oct 2023)**
- Full description matching resume
- Stale cache-busting for old "Virallens" entry

### 5. Resume Download → View in Browser
- Button changed from "Download Resume" → **"View Resume"**
- URL changed to Google Drive **preview** link (`/preview`) so PDF opens in browser
- Google Drive's own toolbar provides the download button in top-right
- Auto-resets stale localStorage with old `uc?export=download` or `/view?usp=sharing` URLs

### 6. Social Flip Button
- Component created at `src/components/SocialFlipButton.tsx`
- Letters spell "EMLG" (Email, LinkedIn, GitHub, Contact) — flips to icons on hover
- Tooltip on hover per icon
- Animated border shimmer effect
- Placed in Footer above the contact row
- Rohon's actual links: `rohonkumardutta@gmail.com`, LinkedIn, GitHub
- **Known issue:** TypeScript `key` prop error was fixed by adding `key?: React.Key` to interface

### 7. Footer Updates
- Old "syed-moinuddin106" LinkedIn/GitHub links replaced with Rohon's links
- Copyright updated to "COPYRIGHT 2026 ROHON KUMAR DUTTA"
- Credit line changed to "BUILT WITH REACT & VITE"
- `[ADMIN GATEWAY]` button now navigates to `/admin` page instead of opening overlay

### 8. Input Validation & Sanitization (`src/lib/validate.ts`)
- New file created — single source of truth for all validation
- `validateShortText` — 120 char limit
- `validateLongText` — 600 char limit
- `validateUrl` — **blocks `javascript:`, `vbscript:`, `data:` URIs** (XSS prevention)
- `validateEmail` — stricter RFC-5321 pattern
- `validateImageFile` — JPEG/PNG/WebP/GIF only, 2MB max
- `validatePdfFile` — PDF only, 5MB max
- `safeJsonParse` — all `JSON.parse` calls now crash-safe with typed fallback
- Applied to: AdminPanel all 4 form handlers, BookCall form, storage.ts all loaders

### 9. Storage Hardening (`src/lib/storage.ts`)
- All `JSON.parse` replaced with `safeJsonParse`
- URL fields sanitized via `safeUrl()` guard on every load (blocks `javascript:` hrefs)
- Activity log details truncated to 200 chars
- Stale data cache-busting for: skills, work, resume

### 10. Source Map Protection (`vite.config.ts`)
- `build: { sourcemap: false }` added — production builds don't ship readable source maps

### 11. TOTP / 2FA Admin Login
- New file: `src/lib/totp.ts`
- Uses `otpauth` library (RFC 6238 — same standard as Google Authenticator)
- Secret loaded from `VITE_TOTP_SECRET` env variable
- QR code generated via `qrcode` library for first-time setup
- `±30s` clock skew tolerance
- **First-time setup:** QR code shown on first login after password step
- After scanning, `admin_totp_setup` flag stored in localStorage — QR never shown again
- `vite-env.d.ts` created for TypeScript env type support

### 12. Brute-force Lockout (AdminPanel)
- Max **5 failed attempts** (password OR OTP)
- **15-minute lockout** stored in localStorage (`admin_lockout_until`)
- Live countdown timer shown during lockout
- Attempts counter auto-clears on successful login

### 13. Admin Panel Auth Flow (3 Steps)
- Step 1: Password input
- Step 2: 6-digit TOTP code (numeric keyboard on mobile, `autoComplete="one-time-code"`)
- Step 3: Dashboard
- Back button on OTP step
- Shared lockout between both steps
- Panel state resets when navigating away

---

## PARTIALLY DONE / STOPPED MID-WAY 🔶

### Admin Panel — Separate Page (60% done)
**What was done:**
- `src/pages/AdminPage.tsx` created
- `App.tsx` updated with hash-based routing (`#/admin`)
- Ctrl+Shift+A shortcut now navigates to `/admin` instead of opening overlay
- Footer "Admin Gateway" button navigates to `/admin`
- `isPage` prop added to `AdminPanel` component interface

**What stopped / what's left:**
- `AdminPanel.tsx` outer wrapper updated to support both page and modal mode
- **Color fixes were started but interrupted mid-way** — the replacement of hardcoded `bg-[#1e1e24]`, `bg-[#16161c]`, `text-[#F4EEE8]`, `text-[#A3A3AA]` with CSS variables (`var(--text-primary)`, `var(--card-bg)`) was partially applied
- The **sidebar** nav button colors were updated to use CSS vars ✅
- The **main content area** form inputs, cards, labels, text — still have hardcoded dark hex colors ❌
- The admin panel **may render with broken colors in light theme** because the hardcoded dark colors ignore CSS variable overrides

### Admin Panel — Scrollable QR Screen (50% done)
**What was done:**
- OTP step container changed from `flex items-center justify-center` to `overflow-y-auto` with inner `min-h-full flex items-center justify-center`
- This allows the QR card to scroll when viewport is short

**What stopped / what's left:**
- The modal wrapper still has `max-h-[90vh]` — needs to ensure the auth steps don't get clipped
- Not visually verified/tested since work was interrupted

---

## WHAT'S LEFT TO COMPLETE ❌

### Priority 1 — Finish Admin Panel Color Fix
Replace all remaining hardcoded dark colors inside the dashboard content area:
- Metric stat cards: `bg-[#1e1e24]/40` → `style={{ background: "var(--card-bg-2)" }}`
- Form inputs: `bg-[#16161c]` → `style={{ background: "var(--card-bg)" }}`
- Section headers: `text-[#F4EEE8]` → `style={{ color: "var(--text-primary)" }}`
- Muted text: `text-[#A3A3AA]` → `style={{ color: "var(--text-muted)" }}`
- Card wrappers: `bg-[#1e1e24]/20` → CSS var equivalents
- Log list rows: hardcoded colors → CSS vars
- Affected tabs: Analytics, Projects, Skills, Work & Resume, Avatar & Songs

### Priority 2 — Verify Admin Page Layout
- Test that the full-page admin route (`#/admin`) renders correctly
- Verify sidebar + content area fills full viewport height
- Verify scrolling works on both auth steps and dashboard content
- Verify QR code is visible and scannable without clipping

### Priority 3 — SocialFlipButton Letters
- Currently the 4 letters are "E", "M", "L", "G" (arbitrary)
- Should spell something meaningful like "CNTCT" or use initials
- Minor cosmetic issue

### Priority 4 — BookCall Section Copy
- Still references "Zenith Studio" and "gifting 4 months of post-launch support"
- Needs updating to Rohon's actual contact/booking purpose

### Priority 5 — AdminPanel Header Title
- Still says "Rohon's Admin Panel" in the panel but the panel header was partially updated
- Verify it shows correctly after the color fix pass

---

## FILES MODIFIED (Full List)

| File | Changes |
|---|---|
| `src/data.ts` | Skills, projects replaced with Rohon's real data |
| `src/lib/storage.ts` | safeJsonParse, URL sanitization, cache-busting |
| `src/lib/validate.ts` | **NEW** — full validation module |
| `src/lib/totp.ts` | **NEW** — TOTP/2FA engine |
| `src/lib/utils.ts` | **NEW** — `cn()` utility |
| `src/vite-env.d.ts` | **NEW** — Vite env type declarations |
| `src/components/AdminPanel.tsx` | 2FA flow, lockout, isPage prop, partial color fix |
| `src/components/About.tsx` | Bio text updated, unused Calendar import removed |
| `src/components/Hero.tsx` | Location, bio, expertise updated |
| `src/components/Footer.tsx` | Links, copyright, social component added |
| `src/components/Projects.tsx` | Full rewrite — labeled buttons, hover overlay |
| `src/components/BookCall.tsx` | Validation applied to form inputs |
| `src/components/SocialFlipButton.tsx` | **NEW** — flip animation social links |
| `src/pages/AdminPage.tsx` | **NEW** — full-page admin route wrapper |
| `src/App.tsx` | Hash-based routing for admin page |
| `vite.config.ts` | `sourcemap: false` added |
| `.env.example` | `VITE_TOTP_SECRET` documented |
| `package.json` | `react-icons`, `otpauth`, `qrcode` added |

---

## SETUP REQUIRED (One-time)

To activate TOTP 2FA:
1. Generate a Base32 secret at https://it-tools.tech/otp-generator
2. Add to `.env`: `VITE_TOTP_SECRET=YOUR_SECRET_HERE`
3. Open Admin Panel → enter password → scan QR code with Google Authenticator or Authy
4. Enter the 6-digit code to complete setup

Admin panel access: **Ctrl+Shift+A** or Footer "[ADMIN GATEWAY]" button → navigates to `/#/admin`
