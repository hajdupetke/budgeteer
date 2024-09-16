import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
  const session = await auth();
  if (!session?.user) {
    redirect('/');
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
