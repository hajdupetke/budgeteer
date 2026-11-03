import Image from 'next/image';
import LoginForm from './components/LoginForm';
import LoginError from './components/LoginError';
import DemoSignIn from './components/DemoSignIn';

export default async function SignInPage(
  props: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div className="min-h-dvh flex justify-center items-center p-5">
        <div className="w-full max-w-sm bg-white p-6 shadow-xl rounded-xl border">
          <Image
            src={'/static/images/logo.png'}
            width={176}
            height={45}
            alt="logo"
            draggable="false"
            className="mb-8"
          />
          <LoginForm />
          {process.env.DEMO_ENABLED === 'true' && <div className="mt-4 border-t pt-4"><DemoSignIn fullWidth /><p className="mt-2 text-center text-xs text-muted-foreground">Explore fictional finances without an account.</p></div>}
          {searchParams?.error && <LoginError errorType={searchParams.error} />}
        </div>
      </div>

      <div className="absolute left-0 top-0 -z-10 w-screen h-screen blur-xl">
        <Image
          src={'/static/images/sign-in-page/sign-in-background.svg'}
          alt="background image"
          fill
          priority
          draggable="false"
          className="object-cover"
        />
      </div>
    </>
  );
}
