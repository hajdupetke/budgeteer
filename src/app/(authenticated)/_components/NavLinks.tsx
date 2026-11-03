'use client';

import Link from 'next/link';
import { logOut } from '@/lib/actions';
import { LayoutDashboard, ArrowLeftRight, ChartNoAxesCombined, LogOut, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const links = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Reports', href: '/reports', icon: ChartNoAxesCombined },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Workspace" className="flex flex-col gap-1.5">
        {links.map(({ name, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-ring',
              active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <Icon className="size-[18px]" aria-hidden="true" />{name}
          </Link>;
        })}
      </nav>
      <form action={logOut} className="mt-auto pt-6">
        <Button type="submit" variant="ghost" className="w-full justify-start"><LogOut data-icon="inline-start" />Sign out</Button>
      </form>
    </>
  );
}
