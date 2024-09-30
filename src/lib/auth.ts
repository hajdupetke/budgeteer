import NextAuth from 'next-auth';
import google from 'next-auth/providers/google';
import github from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import type { Provider } from 'next-auth/providers';
import { create } from 'domain';

const providers: Provider[] = [google, github];

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
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
  },
});
