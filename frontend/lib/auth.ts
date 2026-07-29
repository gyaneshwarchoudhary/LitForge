// Shared auth constants — used by middleware, login, signup
export const TOKEN_COOKIE = "litforge_token";

/** Delete the auth cookie and redirect to the home page. */
export function signOut() {
  // Remove the cookie by setting its expiry to the past
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  window.location.href = "/";
}

/**
 * Decode a JWT payload without verifying the signature (client-side only).
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true if the JWT token is missing OR its `exp` claim is in the past.
 * Use this on the client to proactively redirect before an API call fails.
 */
export function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp as number | undefined;
  if (exp === undefined) return false; // No expiry claim → treat as valid
  return Date.now() / 1000 >= exp;
}
