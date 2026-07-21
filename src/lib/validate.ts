/**
 * Input validation and sanitization utilities.
 * All validation is client-side — this protects localStorage integrity
 * and prevents javascript: URL injection, oversized payloads, and
 * malformed data from corrupting the portfolio state.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SHORT_TEXT = 120;   // titles, names, roles, companies
const MAX_LONG_TEXT  = 600;   // descriptions, notes
const MAX_URL_LENGTH = 512;
const MAX_FILE_SIZE  = 2 * 1024 * 1024; // 2 MB

// Allowed URL schemes — explicitly blocks javascript:, data:, vbscript:
const SAFE_URL_SCHEMES = /^https?:\/\//i;
const SAFE_MAILTO      = /^mailto:/i;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Strip leading/trailing whitespace and collapse internal runs to one space. */
export function sanitizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

/** Enforce max length after sanitising. Returns empty string if too long. */
export function validateShortText(value: unknown): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (!s) return { ok: false, value: "", error: "This field is required." };
  if (s.length > MAX_SHORT_TEXT) {
    return { ok: false, value: s, error: `Must be ${MAX_SHORT_TEXT} characters or fewer.` };
  }
  return { ok: true, value: s, error: "" };
}

/** Same as above but allows empty (optional fields). */
export function validateOptionalShortText(value: unknown): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (s.length > MAX_SHORT_TEXT) {
    return { ok: false, value: s, error: `Must be ${MAX_SHORT_TEXT} characters or fewer.` };
  }
  return { ok: true, value: s, error: "" };
}

export function validateLongText(value: unknown, required = false): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (required && !s) return { ok: false, value: "", error: "This field is required." };
  if (s.length > MAX_LONG_TEXT) {
    return { ok: false, value: s, error: `Must be ${MAX_LONG_TEXT} characters or fewer.` };
  }
  return { ok: true, value: s, error: "" };
}

// ---------------------------------------------------------------------------
// URL validation — the most important check (blocks javascript: injection)
// ---------------------------------------------------------------------------

export function validateUrl(value: unknown, required = false): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (!s) {
    if (required) return { ok: false, value: "", error: "A valid URL is required." };
    return { ok: true, value: "", error: "" };
  }
  if (s.length > MAX_URL_LENGTH) {
    return { ok: false, value: "", error: "URL is too long." };
  }
  if (!SAFE_URL_SCHEMES.test(s)) {
    return { ok: false, value: "", error: "URL must start with https:// or http://" };
  }
  try {
    new URL(s); // structural validity check
  } catch {
    return { ok: false, value: "", error: "Invalid URL format." };
  }
  return { ok: true, value: s, error: "" };
}

export function validateMailtoOrUrl(value: unknown, required = false): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (!s) {
    if (required) return { ok: false, value: "", error: "Required." };
    return { ok: true, value: "", error: "" };
  }
  if (SAFE_MAILTO.test(s)) return { ok: true, value: s, error: "" };
  return validateUrl(s, required);
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

export function validateEmail(value: unknown): { ok: boolean; value: string; error: string } {
  const s = sanitizeText(value);
  if (!s) return { ok: false, value: "", error: "Email is required." };
  // RFC-5321 simplified pattern — rejects most malformed addresses
  const pattern = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
  if (!pattern.test(s)) {
    return { ok: false, value: s, error: "Please enter a valid email address." };
  }
  return { ok: true, value: s, error: "" };
}

// ---------------------------------------------------------------------------
// File upload
// ---------------------------------------------------------------------------

export function validateImageFile(file: File): { ok: boolean; error: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Image must be smaller than 2 MB." };
  }
  return { ok: true, error: "" };
}

export function validatePdfFile(file: File): { ok: boolean; error: string } {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  const MAX_PDF = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_PDF) {
    return { ok: false, error: "PDF must be smaller than 5 MB." };
  }
  return { ok: true, error: "" };
}

// ---------------------------------------------------------------------------
// localStorage integrity — safe JSON.parse wrapper
// ---------------------------------------------------------------------------

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== typeof fallback) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}
