import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function TopBar() {
  return (
    <header className="border-b bg-card">
      <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Budgeteer home" className="shrink-0 rounded-sm"><Image src="/static/images/logo.png" width={144} height={37} alt="Budgeteer" priority /></Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="https://github.com/hajdupetke/budgeteer" target="_blank" rel="noopener noreferrer" className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline">GitHub</Link>
          <Link href="/sign-in" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Sign in</Link>
        </div>
      </nav>
    </header>
  );
}
