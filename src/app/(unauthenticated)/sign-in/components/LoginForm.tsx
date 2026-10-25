import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import SignInButton from './SignInButton';

const LoginForm = () => {
  const providerMap = [
    { id: 'github', name: 'GitHub' },
    { id: 'google', name: 'Google' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {Object.values(providerMap).map((provider) => (
        <form
          action={async () => {
            'use server';
            try {
              await signIn(provider.id, {
                redirectTo: '/dashboard',
              });
            } catch (error) {
              if (error instanceof AuthError) {
                return redirect(`/sign-in?error=${error.type}`);
              }
              throw error;
            }
          }}
          key={provider.id}
        >
          <SignInButton id={provider.id} name={provider.name} />
        </form>
      ))}
    </div>
  );
};

export default LoginForm;
