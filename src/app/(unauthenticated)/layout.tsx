import type { Metadata } from 'next';
import '@/app/globals.css';
import { Nunito_Sans } from 'next/font/google';

const nunitoSans = Nunito_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Budgeteer',
  description: 'Track EUR transactions, set monthly budgets, and understand your spending with clear reports in Budgeteer.',
};

export default async function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.className}>
      <body className="budgeteer-app min-h-dvh">{children}</body>
    </html>
  );
}
