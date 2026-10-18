/**
 * Edge-compatible NextAuth configuration.
 * This file MUST NOT import Mongoose, MongoDB, or any Node.js-only native modules
 * so that it can run safely in Vercel Edge Middleware.
 */
export const authConfig = {
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
  secret: process.env.AUTH_SECRET,
};
