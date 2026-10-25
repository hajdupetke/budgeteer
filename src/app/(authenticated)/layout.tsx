import '@/app/globals.css';
import React from 'react';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { Nunito_Sans } from 'next/font/google';
import SidebarNav from './_components/SidebarNav';
import AnimatedSidebar from './_components/AnimatedSidebar';

const nunitoSans = Nunito_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { template: '%s - Budgeteer', default: 'Budgeteer' },
  description:
    'Take control of your finances with Budgeteer, the all-in-one personal finance tracker. Manage your budget, track expenses, and be mindful of your finances. Start for free today!',
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunitoSans.className}>
      <body className="budgeteer-app min-h-dvh lg:flex">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">Skip to content</a>
        <AnimatedSidebar>
          <SidebarNav />
        </AnimatedSidebar>
        <main id="main-content" className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
