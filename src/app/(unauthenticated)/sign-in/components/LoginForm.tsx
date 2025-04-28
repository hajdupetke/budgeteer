import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import Image from 'next/image';

const LoginForm = () => {
  const providerMap = [
    { id: 'github', name: 'GitHub' },
    { id: 'google', name: 'Google' },
  ];

  return (
    <>
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
          <button
            type="submit"
            className="border w-full px-24 py-2 hover:bg-zinc-50 rounded my-1"
          >
            <span className="flex justify-center gap-2">
              <Image
                src={`/static/images/sign-in-page/${provider.id}-logo.svg`}
                width={24}
                height={24}
                alt={`${provider.name} logo`}
              />
              Sign in with {provider.name}
            </span>
          </button>
        </form>
      ))}
    </>
  );
};

export default LoginForm;
