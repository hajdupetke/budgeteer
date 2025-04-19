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
    'Take control of your finances with Budgeteer, the all-in-one personal finance tracker. Manage your budget, track expenses, and be mindfull of your finances. Start for free today!',
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`text-gray-800 ${nunitoSans.className}`}>
      <body className="flex items-center h-screen w-screen overflow-hidden bg-white">
        <AnimatedSidebar>
          <SidebarNav />
        </AnimatedSidebar>
        <div className="flex h-full w-full gap-2 md:gap-4 flex-wrap overflow-auto p-4 flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
