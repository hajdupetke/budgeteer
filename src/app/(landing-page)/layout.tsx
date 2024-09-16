import type { Metadata } from 'next';
import '@/styles/globals.css';
import Image from 'next/image';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Budgeteer',
  description:
    'Take control of your finances with Budgeteer, the all-in-one personal finance tracker. Manage your budget, track expenses, and be mindfull of your finances. Start for free today!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="w-screen relative">
        <TopBar />
        <div className="w-full">{children}</div>
        <Footer />
        <Image
          src={'/static/images/landing-page/background-desktop.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="-z-10 object-cover hidden lg:block"
        />
        <Image
          src={'/static/images/landing-page/background-tablet.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="-z-10 object-cover hidden md:block lg:hidden"
        />
        <Image
          src={'/static/images/landing-page/background-tablet.svg'}
          alt="background image"
          fill
          quality={100}
          priority
          draggable="false"
          className="-z-10 object-cover block md:hidden"
        />
      </body>
    </html>
  );
}
