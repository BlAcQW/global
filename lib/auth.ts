/**
 * Simple shared-password admin gate. Not a user-account system — one password
 * (from ADMIN_PASSWORD) protects /admin. The cookie stores the secret and is
 * httpOnly, so it can't be forged client-side without knowing the password.
 */
export const COOKIE_NAME = "globe_admin";

/** The shared admin password. Dev fallback is "admin" — override in .env.local. */
export function getAdminSecret(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

/** True when the presented cookie value matches the configured secret. */
export function isAuthed(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  return cookieValue === getAdminSecret();
}
