export interface AuthUser {
  email: string;
  password?: string;
  deskName: string;
  location: string;
  role: string;
}

export const AUTH_USERS: AuthUser[] = [
  // 1. Central Coordination Desk (Existing)
  {
    email: (process.env.AUTH_EMAIL || 'vision2050@sdmimd.ac.in').toLowerCase().trim(),
    password: process.env.AUTH_PASSWORD || 'VisionPass1234',
    deskName: 'Central Coordination Desk',
    location: 'Central Office',
    role: 'Central Coordinator',
  },
  // 2. Main Gate - Desk 1
  {
    email: 'gate1@sdmimd.ac.in',
    password: process.env.AUTH_PASSWORD_GATE1 || 'Gate1Pass1234',
    deskName: 'Main Gate - Desk 1',
    location: 'Main Gate',
    role: 'Registration Desk 1 (Gate)',
  },
  // 3. Main Gate - Desk 2
  {
    email: 'gate2@sdmimd.ac.in',
    password: process.env.AUTH_PASSWORD_GATE2 || 'Gate2Pass1234',
    deskName: 'Main Gate - Desk 2',
    location: 'Main Gate',
    role: 'Registration Desk 2 (Gate)',
  },
  // 4. Auditorium - Desk 1
  {
    email: 'auditorium1@sdmimd.ac.in',
    password: process.env.AUTH_PASSWORD_AUDIT1 || 'Audit1Pass1234',
    deskName: 'Auditorium - Desk 1',
    location: 'Auditorium',
    role: 'Registration Desk 1 (Auditorium)',
  },
  // 5. Auditorium - Desk 2
  {
    email: 'auditorium2@sdmimd.ac.in',
    password: process.env.AUTH_PASSWORD_AUDIT2 || 'Audit2Pass1234',
    deskName: 'Auditorium - Desk 2',
    location: 'Auditorium',
    role: 'Registration Desk 2 (Auditorium)',
  },
  // 6. Auditorium - Desk 3
  {
    email: 'auditorium3@sdmimd.ac.in',
    password: process.env.AUTH_PASSWORD_AUDIT3 || 'Audit3Pass1234',
    deskName: 'Auditorium - Desk 3',
    location: 'Auditorium',
    role: 'Registration Desk 3 (Auditorium)',
  },
];

export const AUTH_CONFIG = {
  email: (process.env.AUTH_EMAIL || 'vision2050@sdmimd.ac.in').toLowerCase().trim(),
  password: process.env.AUTH_PASSWORD || 'VisionPass1234',
  cookieName: 'auth_session',
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  secret: process.env.AUTH_SECRET || 'vision-mysuru-2050-auth-secret-key-sdmimd',
};

/**
 * Finds an authorized user by email (case-insensitive).
 */
export function findUserByEmail(email: string): AuthUser | undefined {
  if (!email) return undefined;
  const cleanEmail = email.toLowerCase().trim();
  return AUTH_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
}

/**
 * Validates the email and password against the authorized desk accounts.
 * Returns the matching AuthUser (without password) if valid, otherwise null.
 */
export function validateCredentials(email: string, pass: string): AuthUser | null {
  if (!email || !pass) return null;
  const cleanEmail = email.toLowerCase().trim();
  const user = AUTH_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user && user.password === pass) {
    const { password, ...safeUser } = user;
    return safeUser as AuthUser;
  }
  return null;
}

/**
 * Creates a signed token string for session storage with user & desk metadata.
 */
export function createSessionToken(userOrEmail: AuthUser | string): string {
  const email = typeof userOrEmail === 'string' ? userOrEmail.toLowerCase().trim() : userOrEmail.email.toLowerCase().trim();
  const matchedUser = findUserByEmail(email);

  const payload = {
    email,
    deskName: matchedUser?.deskName || (typeof userOrEmail !== 'string' ? userOrEmail.deskName : 'Registration Desk'),
    location: matchedUser?.location || (typeof userOrEmail !== 'string' ? userOrEmail.location : 'Campus'),
    role: matchedUser?.role || (typeof userOrEmail !== 'string' ? userOrEmail.role : 'Desk Staff'),
    exp: Date.now() + AUTH_CONFIG.sessionMaxAge * 1000,
  };

  const jsonStr = JSON.stringify(payload);
  const base64 = typeof Buffer !== 'undefined'
    ? Buffer.from(jsonStr).toString('base64')
    : btoa(jsonStr);

  return `${base64}.vm2050_sdm_token`;
}

/**
 * Extracts and verifies the user from a session token, returning null if invalid or expired.
 */
export function getSessionUser(token: string | undefined | null): AuthUser | null {
  if (!token || !token.endsWith('.vm2050_sdm_token')) return null;

  try {
    const base64 = token.replace('.vm2050_sdm_token', '');
    const jsonStr = typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : atob(base64);

    const payload = JSON.parse(jsonStr);
    if (!payload.email || !payload.exp) return null;

    // Check expiration
    if (Date.now() > payload.exp) return null;

    // Match with authorized accounts
    const user = findUserByEmail(payload.email);
    if (!user) return null;

    return {
      email: user.email,
      deskName: user.deskName,
      location: user.location,
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Verifies a session token string against authorized accounts.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  return getSessionUser(token) !== null;
}
