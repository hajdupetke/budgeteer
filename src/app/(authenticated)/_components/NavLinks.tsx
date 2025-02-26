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
import { cn } from '@/lib/utils';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Reports', href: '/reports', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: SlidersHorizontal },
];

const NavLinks = () => {
  const pathname = '/' + usePathname().split('/')[1];

  return (
    <div className="flex flex-col gap-6">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <div className="group" key={link.name}>
            <Link
              href={link.href}
              className={cn(
                'flex gap-4 items-center w-full px-2 font-bold border-l-2 border-transparent group-hover:text-primary-600 transition-colors',
                {
                  'text-primary-600 border-primary-600!':
                    pathname === link.href,
                }
              )}
            >
              <Icon
                width={30}
                height={30}
                className={cn(
                  'stroke-gray-500 group-hover:stroke-primary-600',
                  { 'stroke-primary-600!': pathname === link.href }
                )}
              />{' '}
              {link.name}
            </Link>
          </div>
        );
      })}
      <form action={logOut}>
        <button
          type="submit"
          className="flex gap-4 items-center px-2 w-full font-bold group"
        >
          <LogOut
            width={30}
            height={30}
            className="stroke-gray-500 group-hover:stroke-primary-600 border-l-2 border-transparent"
          />{' '}
          <span className="group-hover:text-primary-600 transition-colors ">
            Sign out
          </span>
        </button>
      </form>
    </div>
  );
};

export default NavLinks;
