import Image from 'next/image';
import Link from 'next/link';
import NavLinks from './NavLinks';
import Profile from './Profile';

export default function SidebarNav() {
  return (
    <>
      <Link href="/dashboard" className="mb-10 mt-1 block w-fit" aria-label="Budgeteer home">
        <Image src="/static/images/logo.png" width={150} height={39} alt="Budgeteer" priority draggable={false} />
      </Link>
      <NavLinks />
      <div className="mt-5"><Profile /></div>
      <p className="mt-5 text-xs text-muted-foreground">Amounts in EUR · Dates in UTC</p>
    </>
  );
}
