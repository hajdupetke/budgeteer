import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import github from 'next-auth/providers/github';
import google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import authConfig from './auth.config';
import { DEMO_USER_ID, isDemoUser } from './demo';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async signIn({ user, account }) {
      return account?.provider === 'demo' || !isDemoUser(user.id);
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [github, google, Credentials({
    id: 'demo',
    name: 'Demo preview',
    credentials: {},
    async authorize() {
      if (process.env.DEMO_ENABLED !== 'true') return null;
      const user = await db.user.findUnique({ where: { id: DEMO_USER_ID } });
      return user ? { id: user.id, name: user.name, email: user.email, image: null } : null;
    },
  })],
});
