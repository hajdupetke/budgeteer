import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

export const metadata: Metadata = {
  title: 'Budgeteer',
  description:
    'Take control of your finances with Budgeter, the all-in-one personal finance tracker. Manage your budget, track expenses, and be mindfull of your finances. Start for free today!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
