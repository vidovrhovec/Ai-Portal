import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

/**
 * NextAuth.js Configuration Export
 *
 * This file exports the NextAuth handlers, auth function, and signIn/signOut utilities
 * configured with our custom authConfig.
 *
 * Exports:
 * - handlers: API route handlers for NextAuth
 * - auth: Server-side authentication function
 * - signIn: Client-side sign-in function
 * - signOut: Client-side sign-out function
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);