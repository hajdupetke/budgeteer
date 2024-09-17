'use client';

import Link from 'next/link';
import { logOut } from '@/lib/actions';
import {
  LayoutDashboard,
  History,
  Calendar,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Reports', href: '/reports', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: SlidersHorizontal },
];

const NavLinks = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-6">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            href={link.href}
            key={link.name}
            className={clsx(
              'flex gap-4 items-center py-2 w-full rounded-full px-4',
              {
                'bg-[#d9d8e6]': pathname === link.href,
              }
            )}
          >
            <Icon
              width={30}
              height={30}
              stroke="#65009c"
              className={clsx({ 'opacity-60': pathname !== link.href })}
            />{' '}
            {link.name}
          </Link>
        );
      })}
      <form action={logOut}>
        <button
          type="submit"
          className="flex gap-4 items-center py-2 px-4 w-full"
        >
          <LogOut
            width={30}
            height={30}
            stroke="#65009c"
            className="opacity-60"
          />{' '}
          Sign out
        </button>
      </form>
    </div>
  );
};

export default NavLinks;
