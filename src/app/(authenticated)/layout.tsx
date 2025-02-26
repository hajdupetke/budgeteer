import '@/styles/globals.css';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
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
  // const session = await auth();
  // if (!session?.user) {
  //   redirect('/');
  // }

  return (
    <html lang="en" className={`text-gray-800 ${nunitoSans.className}`}>
      <body className="flex items-center h-screen w-screen overflow-hidden bg-white">
        <AnimatedSidebar>
          <SidebarNav />
        </AnimatedSidebar>
        <div className="w-full h-full p-4">{children}</div>
      </body>
    </html>
  );
}
