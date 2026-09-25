/**
 * TOTP (Time-based One-Time Password) — RFC 6238
 *
 * HOW IT WORKS:
 * - A secret key is embedded at build time via VITE_TOTP_SECRET env variable.
 * - The same secret is used by any authenticator app (Google Authenticator,
 *   Authy, etc.) after scanning the QR code shown during first-time setup.
 * - Every 30 seconds both the app and the authenticator independently derive
 *   the same 6-digit code from the shared secret + current time.
 * - No network call is needed — verification is purely local math.
 *
 * SETUP (one-time):
 * 1. Generate a random base32 secret (use: https://it-tools.tech/otp-generator)
 * 2. Add it to your .env:  VITE_TOTP_SECRET=YOUR_BASE32_SECRET
 * 3. Open the Admin Panel → first login with password → scan the QR code
 *    shown with Google Authenticator or Authy.
 * 4. From then on, enter the 6-digit code from your authenticator after
 *    the password step.
 *
 * SECURITY NOTE:
 * The secret is embedded in the JS bundle (visible to anyone who reads the
 * source). This is acceptable for a single-owner personal portfolio because:
 * - The secret alone does not grant access — you still need the password first.
 * - An attacker with the secret still needs a device synced to correct time.
 * - The admin panel only modifies your own localStorage — nothing server-side.
 * For a multi-user app with real data, move this entirely to a backend.
 */

import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

// ---------------------------------------------------------------------------
// Secret — loaded from env at build time.
// Falls back to a built-in default so the app works out of the box during dev.
// In production, always set VITE_TOTP_SECRET in your deployment env.
// ---------------------------------------------------------------------------
const RAW_SECRET =
  import.meta.env.VITE_TOTP_SECRET ||
  "JBSWY3DPEHPK3PXP"; // default dev-only secret — change in production

const totp = new OTPAuth.TOTP({
  issuer: "Rohon Portfolio",
  label: "Admin",
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: OTPAuth.Secret.fromBase32(RAW_SECRET),
});

/**
 * Verify a 6-digit OTP token.
 * window: 1 means we accept 1 period before/after current (±30s clock skew).
 */
export function verifyTOTP(token: string): boolean {
  const result = totp.validate({ token: token.replace(/\s/g, ""), window: 1 });
  return result !== null;
}

/**
 * Generate a QR code data-URL for scanning with an authenticator app.
 * Returns a base64 PNG string.
 */
export async function generateQRCodeDataURL(): Promise<string> {
  const uri = totp.toString(); // otpauth:// URI
  return QRCode.toDataURL(uri, {
    width: 200,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Returns true if TOTP has been set up (i.e. user has scanned the QR code).
 * We store a flag in localStorage after first successful OTP verification.
 */
export function isTOTPSetup(): boolean {
  return localStorage.getItem("admin_totp_setup") === "true";
}

export function markTOTPSetupComplete(): void {
  localStorage.setItem("admin_totp_setup", "true");
}

export function is2FAEnabled(): boolean {
  const val = localStorage.getItem("admin_totp_enabled");
  return val === null ? true : val === "true"; // default true
}

export function set2FAEnabled(enabled: boolean): void {
  localStorage.setItem("admin_totp_enabled", enabled ? "true" : "false");
}
