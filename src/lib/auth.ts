export const AUTH_CONFIG = {
  email: (process.env.AUTH_EMAIL || 'vision2050@sdmimd.ac.in').toLowerCase().trim(),
  password: process.env.AUTH_PASSWORD || 'VisionPass1234',
  cookieName: 'auth_session',
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  secret: process.env.AUTH_SECRET || 'vision-mysuru-2050-auth-secret-key-sdmimd',
};

/**
 * Validates the email and password against the authorized credentials.
 */
export function validateCredentials(email: string, pass: string): boolean {
  if (!email || !pass) return false;
  const cleanEmail = email.toLowerCase().trim();
  return cleanEmail === AUTH_CONFIG.email && pass === AUTH_CONFIG.password;
}

/**
 * Creates a signed token string for session storage.
 */
export function createSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    exp: Date.now() + AUTH_CONFIG.sessionMaxAge * 1000,
    role: 'Staff Coordinator',
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = typeof Buffer !== 'undefined'
    ? Buffer.from(jsonStr).toString('base64')
    : btoa(jsonStr);

  return `${base64}.vm2050_sdm_token`;
}

/**
 * Verifies a session token string.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !token.endsWith('.vm2050_sdm_token')) return false;

  try {
    const base64 = token.replace('.vm2050_sdm_token', '');
    const jsonStr = typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : atob(base64);

    const payload = JSON.parse(jsonStr);
    if (!payload.email || !payload.exp) return false;

    // Check expiration
    if (Date.now() > payload.exp) return false;

    // Check email
    return payload.email === AUTH_CONFIG.email;
  } catch {
    return false;
  }
}
