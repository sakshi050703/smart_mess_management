import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getDefaultRoute } from './permissions';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          console.warn(`[auth] User not found with email: ${credentials.email}`);
          return null;
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated. Please contact admin.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          console.warn(`[auth] Invalid password for email: ${credentials.email}`);
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId?.toString() || null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

/**
 * Get the current session on the server.
 * Returns null if not authenticated.
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Require authentication for an API route.
 * Returns the session or throws a 401 Response.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { session };
}

/**
 * Require a specific role for an API route.
 */
export async function requireRole(allowedRoles) {
  const { session, error, status } = await requireAuth();
  if (error) return { error, status };

  if (!allowedRoles.includes(session.user.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { session };
}
