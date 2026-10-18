/**
 * Edge-compatible NextAuth configuration.
 * This file MUST NOT import Mongoose, MongoDB, or any Node.js-only native modules
 * so that it can run safely in Vercel Edge Middleware.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studentId = user.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.studentId = token.studentId;
      }
      return session;
    },
  },
  providers: [],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '9f8c6b2a4e1d3c5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f',
};
