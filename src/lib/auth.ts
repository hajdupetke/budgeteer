import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import github from 'next-auth/providers/github';
import google from 'next-auth/providers/google';
import { create } from 'domain';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('user signed in!');

      // check if user has settings entry, if not create it
      if (
        (await db.settings.findFirst({ where: { userId: user.id } })) == null
      ) {
        await db.settings.create({
          data: { user: { connect: { id: user.id } } },
        });
      }

      return true;
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
  providers: [github, google],
});
