import Image from 'next/image';
import LoginForm from './components/LoginForm';
import LoginError from './components/LoginError';

export default async function SignInPage(
  props: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center">
        <div className="bg-white px-8 py-8 shadow-2xl rounded-xl border">
          <Image
            src={'/static/images/logo.png'}
            width={176}
            height={45}
            alt="logo"
            draggable="false"
            className="my-8 "
          />
          <LoginForm />
          {searchParams?.error && <LoginError errorType={searchParams.error} />}
        </div>
      </div>

      <div className="absolute left-0 top-0 -z-10 w-screen h-screen blur-xl">
        <Image
          src={'/static/images/sign-in-page/sign-in-background.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="object-cover"
        />
      </div>
    </>
  );
}
