import authConfig from '@/lib/auth.config';
import NextAuth from 'next-auth';

export default NextAuth(authConfig).auth;

export const config = {
  matcher:
    '/((?!api|_next/static|static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
};
