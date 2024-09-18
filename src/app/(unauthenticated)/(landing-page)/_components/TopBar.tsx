import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

const TopBar = () => {
  return (
    <div className="w-full justify-center items-center flex gap-4 py-4">
      <Image
        src={'/static/images/logo.png'}
        width={176}
        height={45}
        alt="logo"
        draggable="false"
      />
      <div className="md:absolute flex gap-2 right-4">
        <Link
          className={
            buttonVariants({ variant: 'default' }) + ' !rounded-full border'
          }
          href={'/sign-in'}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
