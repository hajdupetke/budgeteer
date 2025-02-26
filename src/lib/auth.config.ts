import type { NextAuthConfig } from 'next-auth';

export default {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPages = ['/', '/sign-in'];
      console.log(nextUrl.pathname);

      if (publicPages.includes(nextUrl.pathname)) {
        // Redirect logged in users from landing page
        if (nextUrl.pathname === '/' && isLoggedIn)
          return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      // Redirect unauthenticated users to sign-in page
      if (!isLoggedIn) return Response.redirect(new URL('/sign-in', nextUrl));

      // Allow access for logged in users
      return true;
    },
  },
} satisfies NextAuthConfig;
