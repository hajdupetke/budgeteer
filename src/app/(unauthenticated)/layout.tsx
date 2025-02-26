import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Budgeteer',
  description:
    'Take control of your finances with Budgeteer, the all-in-one personal finance tracker. Manage your budget, track expenses, and be mindfull of your finances. Start for free today!',
};

export default async function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await auth();
  // if (session?.user) redirect('/dashboard');

  return (
    <html lang="en" className={inter.className}>
      <body className="relative">{children}</body>
    </html>
  );
}
