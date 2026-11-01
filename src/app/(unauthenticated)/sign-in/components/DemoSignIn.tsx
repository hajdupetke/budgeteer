import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import DemoSignInButton from './DemoSignInButton';

export default function DemoSignIn({ fullWidth = false }: { fullWidth?: boolean }) {
  return <form action={async () => {
    'use server';
    try {
      await signIn('demo', { redirectTo: '/dashboard' });
    } catch (error) {
      if (error instanceof AuthError) redirect('/sign-in?error=DemoUnavailable');
      throw error;
    }
  }}>
    <DemoSignInButton fullWidth={fullWidth} />
  </form>;
}
