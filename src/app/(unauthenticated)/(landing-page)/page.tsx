import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import TopBar from './_components/TopBar';
import Footer from './_components/Footer';

export default function Home() {
  return (
    <>
      <TopBar />
      <div className="flex flex-col items-center pt-8 sm:pt-16 lg:pt-24">
        <h1 className="text-3xl md:text-5xl font-bold text-center w-full md:w-3/4 lg:w-1/2">
          Take Control of Your Finances - Effortlessly!
        </h1>
        <p className="text-xl text-center my-4 w-10/12 md:w-3/4 lg:w-1/2 text-stone-800">
          Track, budget, and grow your wealth with ease. Plan for the future and
          achieve your financial goals with our all-in-one finance tracker.
        </p>

        <Link
          href={'/sign-in'}
          className={
            buttonVariants({ variant: 'default', size: 'xl' }) +
            ' !rounded-full'
          }
        >
          Sign up for free
        </Link>
      </div>
      <div className="w-full my-8 sm:my-16 flex justify-center">
        <Image
          src={'/static/images/device-screens.png'}
          height={650}
          width={890}
          alt="Screenshots of the app on devices"
          className="w-10/12 lg:w-8/12"
        />
      </div>
      <div className="flex flex-col items-center gap-2 mx-auto w-3/4">
        <h2 className="text-xl md:text-3xl font-bold text-center w-full">
          How It Works
        </h2>
        <p className="text-md text-stone-800">It's only 3 steps!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center gap-2">
            <Image
              src={'/static/images/landing-page/list-item-1.png'}
              height={75}
              width={75}
              alt="Step 1"
            />
            <p className="text-xl font-bold">Sign Up for Free</p>
            <p className="text-center w-3/4 text-stone-800">
              Create your account in seconds using your Google or Github
              account.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Image
              src={'/static/images/landing-page/list-item-2.png'}
              height={75}
              width={75}
              alt="Step 2"
            />
            <p className="text-xl font-bold">Track and Budget</p>
            <p className="text-center w-3/4 text-stone-800">
              Categorize transactions and set budgets that work for you. Stay
              updated with real-time insights into your finances.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Image
              src={'/static/images/landing-page/list-item-3.png'}
              height={75}
              width={75}
              alt="Step 3"
            />
            <p className="text-xl font-bold">Achieve Your Goals</p>
            <p className="text-center w-3/4 text-stone-800">
              Set financial goals, manage your spending, and be more mindful of
              your finances. Start today!
            </p>
          </div>
        </div>
        <Link
          href={'/sign-in'}
          className={
            buttonVariants({ variant: 'default', size: 'xl' }) +
            ' !rounded-full'
          }
        >
          Get started today!
        </Link>
      </div>
      <Footer />
      <div className="absolute left-0 top-0 -z-10 w-full h-full blur-xl">
        <Image
          src={'/static/images/landing-page/background-desktop.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="object-cover hidden lg:block"
        />
        <Image
          src={'/static/images/landing-page/background-tablet.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="object-cover hidden md:block lg:hidden"
        />
        <Image
          src={'/static/images/landing-page/background-tablet.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="object-cover block md:hidden"
        />
      </div>
    </>
  );
}
