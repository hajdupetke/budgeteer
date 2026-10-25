'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

export default function AnimatedSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-card px-5 lg:hidden">
        <Link href="/dashboard" aria-label="Budgeteer home">
          <Image src="/static/images/logo.png" alt="Budgeteer" width={126} height={33} priority />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
          <SheetContent side="left" className="flex w-[280px] max-w-[85vw] flex-col overflow-y-auto" onClick={(event) => {
            if ((event.target as HTMLElement).closest('a, button[type="submit"]')) setOpen(false);
          }}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Navigate your Budgeteer workspace.</SheetDescription>
            {children}
          </SheetContent>
        </Sheet>
      </header>
      <aside aria-label="Main navigation" className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r bg-card px-5 py-8 lg:flex">
        {children}
      </aside>
    </>
  );
}
