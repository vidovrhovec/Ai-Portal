import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * NextAuth Configuration
 *
 * This file configures NextAuth.js for authentication using credentials provider.
 * It handles user authentication against the Prisma database with bcrypt password hashing.
 *
 * Key Features:
 * - Credentials-based authentication (email/password)
 * - Prisma database integration
 * - bcrypt password hashing verification
 * - JWT and session management
 * - Role-based user management (TEACHER/STUDENT)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development',
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * Authorize function for credentials authentication
       *
       * @param credentials - User credentials (email, password)
       * @returns User object if authentication successful, null otherwise
       *
       * Process:
       * 1. Validate credentials exist
       * 2. Find user by email in database
       * 3. Verify password using bcrypt.compare()
       * 4. Return user object with id, email, name, role
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            console.log('User not found or no password for:', credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('User authenticated successfully:', user.email, 'role:', user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Error in authorize function:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    /**
     * JWT Callback
     *
     * Adds user role to the JWT token when user signs in
     *
     * @param params - Token and user objects
     * @returns Modified token with role
     */
    async jwt({ token, user }) {
      console.log('JWT callback:', { token: !!token, user: !!user });
      if (user) {
        token.role = user.role;
        console.log('Setting token role:', user.role);
      }
      return token;
    },
    /**
     * Session Callback
     *
     * Adds user role to the session object for client-side access
     *
     * @param params - Session and token objects
     * @returns Modified session with user role
     */
    async session({ session, token }) {
      console.log('Session callback:', { session: !!session, token: !!token });
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        console.log('Setting session user:', { id: token.sub, role: token.role });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};