# Rohon Kumar Dutta — Portfolio 2.0

A modern, feature-rich portfolio website built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Includes a secure admin panel with TOTP authentication, real-time content editing, smooth animations, and comprehensive security features.

## 🚀 Features

### Portfolio Showcase

- **Hero Section** — Eye-catching introduction with dynamic animations
- **About Section** — Professional bio with smooth transitions
- **Skills Section** — Organized categorization of technical skills
- **Projects Section** — Showcase of featured projects with live demo and GitHub links
- **Work Experience** — Detailed internship and work history
- **Testimonials Section** — Social proof and client feedback
- **Music Section** — Creative multimedia content integration
- **Social Flip Button** — Animated social links (Email, LinkedIn, GitHub)
- **Resume Viewer** — View resume directly in browser via Google Drive preview

### Admin Panel

- **TOTP/OTP Authentication** — Two-factor authentication with QR code setup
- **Content Management** — Edit all portfolio sections in real-time
- **Meeting Bookings** — View, Accept, and Decline strategy call requests directly
- **Activity Logging** — Track all administrative changes in the cloud
- **Dark-themed UI** — Professional admin interface with smooth animations

### Backend & Database (New!)

- **Express & Node.js** — Secure API for handling emails, bookings, and database operations
- **Supabase Integration** — Persistent cloud storage for projects, skills, bookings, and activity logs
- **Automated Email Notifications** — NodeMailer integration sends custom HTML emails on booking request, acceptance, and cancellation
- **Smart Scheduling** — Booking conflict checker automatically disables time slots that are already accepted
- **Optimized Performance** — High-density mouse animations migrated to HTML5 Canvas to prevent UI lag

### Security

- **Input Validation & Sanitization** — All user inputs validated and sanitized
- **XSS Prevention** — Blocks dangerous JavaScript, VBScript, and data URIs
- **Source Map Protection** — No source maps in production builds
- **Password Masking** — Secure password input fields
- **OTP-based Access** — TOTP (RFC 6238) standard for authentication

### Technical Excellence

- **Modern Stack** — React 19, TypeScript, Vite for fast development and builds
- **Responsive Design** — Tailwind CSS with mobile-first approach
- **Smooth Animations** — Motion library for fluid, professional animations
- **Type-Safe** — Full TypeScript coverage for reliability
- **PWA Ready** — Optimized for all devices and browsers

## 📋 Tech Stack

| Category               | Technology                              |
| ---------------------- | --------------------------------------- |
| **Frontend Framework** | React 19.0.1                            |
| **Backend Framework**  | Node.js & Express.js                    |
| **Database**           | Supabase (PostgreSQL)                   |
| **Email Service**      | NodeMailer (Gmail SMTP)                 |
| **Language**           | TypeScript 5.8                          |
| **Build Tool**         | Vite 6.2.3                              |
| **Styling**            | Tailwind CSS 4.1.14                     |
| **Animations**         | Motion 12.23.24, HTML5 Canvas           |
| **Icons**              | React Icons 5.7.0, Lucide React 0.546.0 |
| **Authentication**     | OTPAuth 9.5.1 (TOTP/RFC 6238)           |

## 🛠️ Prerequisites

- **Node.js** 16+ (download from [nodejs.org](https://nodejs.org))
- **npm** 8+ (comes with Node.js)
- **Git** (for cloning the repository)

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

Create a `.env` file in the root directory:

```env
# VITE_APP_URL: The URL where the portfolio is hosted
VITE_APP_URL="http://localhost:3000"

# TOTP Secret for Admin Authentication (base32 encoded)
VITE_TOTP_SECRET="your_base32_encoded_secret_here"

# Email Configuration (Nodemailer)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-google-app-password"

# Supabase Database
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

### 4. Run Locally

You will need two terminal windows to run both the frontend and the backend.

**Terminal 1: Start the Backend**
```bash
cd backend
npm install
npm start
```
The API will start at `http://localhost:3001`

**Terminal 2: Start the Frontend**
```bash
npm run dev
```
The website will start at `http://localhost:3000`

## 🏗️ Project Structure

```
portfolio-2.0/
├── src/
│   ├── components/           # React components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Hero.tsx         # Hero section
│   │   ├── About.tsx        # About section
│   │   ├── Skills.tsx       # Skills showcase
│   │   ├── Projects.tsx     # Projects gallery
│   │   ├── Testimonials.tsx # Client testimonials
│   │   ├── MusicSection.tsx # Music/media section
│   │   ├── BookCall.tsx     # Contact/booking section
│   │   ├── AdminPanel.tsx   # Admin control panel
│   │   ├── SocialFlipButton.tsx  # Animated social links
│   │   └── Footer.tsx       # Footer with links
│   ├── pages/
│   │   └── AdminPage.tsx    # Full-screen admin page
│   ├── lib/
│   │   ├── storage.ts       # localStorage management
│   │   ├── totp.ts          # TOTP authentication
│   │   ├── validate.ts      # Input validation & sanitization
│   │   └── utils.ts         # Utility functions
│   ├── assets/              # Images and media
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── types.ts             # TypeScript interfaces
│   └── data.ts              # Portfolio data
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔐 Admin Panel & Authentication

### Accessing the Admin Panel

**Keyboard Shortcut:** Press `Ctrl + Shift + A` anywhere on the portfolio

Or navigate to: `http://localhost:3000/#/admin`

### First-Time Setup (TOTP Authentication)

1. Open the Admin Panel
2. Enter your admin password
3. Scan the displayed QR code with Google Authenticator, Authy, or Microsoft Authenticator
4. Enter the 6-digit code from your authenticator
5. You're now authenticated and can edit portfolio content

### Brute-Force Protection

- Account locks after 5 failed login attempts
- 15-minute lockout period
- Failed attempts are logged in the activity log

### Activity Log

All administrative actions are logged with:

- Action type (login, content update, deletion, etc.)
- Timestamp
- Details (limited to 200 characters for privacy)
- Status (success/failure)

## 📝 Content Management

### Editable Sections

The Admin Panel allows you to edit:

| Section             | Editable Fields                        |
| ------------------- | -------------------------------------- |
| **Hero**            | Bio text                               |
| **About**           | Bio paragraphs                         |
| **Skills**          | Skill categories and items             |
| **Projects**        | Project details, images, links         |
| **Testimonials**    | Client testimonials and ratings        |
| **Work Experience** | Job title, company, dates, description |
| **Resume**          | Google Drive preview link              |

### Input Validation

All inputs are validated for:

- **Length limits** — Short text: 120 chars, Long text: 600 chars
- **URL validation** — Must be valid HTTP/HTTPS URLs
- **Email validation** — RFC-5321 compliant format
- **File uploads** — Images (JPEG/PNG/WebP/GIF) up to 2MB, PDFs up to 5MB
- **XSS Prevention** — Dangerous URIs (`javascript:`, `vbscript:`, `data:`) blocked

## 🚀 Building for Production

### Create an Optimized Build

```bash
npm run build
```

This generates a `dist/` folder with:

- Minified JavaScript and CSS
- Optimized images
- No source maps (security feature)
- Ready for deployment

### Preview Production Build Locally

```bash
npm run preview
```

### Deployment

The `dist/` folder is deployment-ready for:

- **Vercel** — Zero-config deployment
- **Netlify** — Drag-and-drop or git integration
- **GitHub Pages** — Static hosting
- **Any static host** — Nginx, Apache, S3, etc.

## 🔒 Security Features

### Input Sanitization

- All user inputs validated before storage
- Dangerous characters and URIs blocked
- SQL injection patterns prevented

### XSS Protection

- Blocks `javascript:` URIs
- Blocks `vbscript:` URIs
- Blocks `data:` URIs
- Safe HTML rendering

### Source Map Protection

- Source maps excluded from production builds
- Original code cannot be easily reverse-engineered

### TOTP Authentication

- Industry-standard RFC 6238 implementation
- Time-synchronized tokens (30-second windows)
- Works offline with authenticator apps
- No network calls required for verification

### Brute-Force Defense

- Failed login throttling
- 15-minute lockout after 5 attempts
- Comprehensive activity logging

### Secure Storage

- All data stored in browser localStorage
- Safe JSON parsing with fallback handling
- Automatic stale data cleanup

## 🎨 Customization

### Updating Portfolio Data

Edit `src/data.ts` to update:

- Personal information
- Project details
- Skills and expertise
- Work experience
- Testimonials

Or use the Admin Panel for real-time updates without code changes.

### Styling

Modify `tailwind.config.js` to customize:

- Color scheme
- Typography
- Spacing
- Breakpoints

CSS variables are also available in `src/index.css` for easy theme adjustments.

### Adding New Sections

1. Create a new component in `src/components/`
2. Import it in `src/App.tsx`
3. Add it to the portfolio layout
4. Update `src/data.ts` if needed for content

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Port Already in Use

```bash
npm run dev -- --port 3001
```

### Dependencies Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
npm run lint  # Check TypeScript errors
npm run build -- --debug  # Debug build
```

### TOTP Not Working

- Ensure your device time is synchronized
- Regenerate the secret and rescan the QR code
- Check that your authenticator app is not in airplane mode

## 📚 Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Create production build
npm run preview  # Preview production build locally
npm run lint     # Check TypeScript for errors
npm run clean    # Remove build artifacts
```

## 🤝 Contributing

To customize or extend this portfolio:

1. Create a new branch for features
2. Make your changes
3. Test thoroughly locally
4. Build and preview before deployment

## 📄 License

This project is part of a personal portfolio. Feel free to use as a template for your own portfolio.

## 📧 Support

For issues or questions, refer to the [PROJECT_STATUS.md](PROJECT_STATUS.md) file for detailed feature status and implementation notes.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
