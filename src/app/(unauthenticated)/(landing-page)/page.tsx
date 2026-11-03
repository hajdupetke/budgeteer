import Link from 'next/link';
import { ArrowRight, ChartNoAxesCombined, ListFilter, Wallet } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DemoSignIn from '../sign-in/components/DemoSignIn';
import TopBar from './_components/TopBar';
import Footer from './_components/Footer';

const features = [
  { icon: ListFilter, title: 'Keep transactions organized', description: 'Record income and expenses, choose categories, and see the details in one place.' },
  { icon: Wallet, title: 'See how budgets are doing', description: 'Set monthly limits and see what you have spent, what remains, and where you went over.' },
  { icon: ChartNoAxesCombined, title: 'Understand your spending', description: 'Explore income, expenses, and category trends across the dates you choose.' },
];

function DashboardPreview() {
  const budgets = [
    { name: 'Home', amount: '€1,550 / €1,700', width: '91%' },
    { name: 'Food and coffee', amount: '€705 / €600', width: '100%' },
    { name: 'Getting around', amount: '€89 / €150', width: '59%' },
  ];

  return (
    <figure className="min-w-0" aria-label="Budgeteer dashboard preview with fictional monthly totals and budgets">
      <div aria-hidden="true" className="overflow-hidden rounded-xl border bg-card shadow-[0_22px_60px_-36px_rgba(29,36,51,0.35)]">
        <div className="flex items-center justify-between border-b px-5 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Budgeteer</span>
          <span>Overview · This month</span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-baseline justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-foreground">Overview</p>
              <p className="text-xs text-muted-foreground">Calendar month · EUR</p>
            </div>
            <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">Fictional data</span>
          </div>
          <div className="grid grid-cols-3 divide-x rounded-xl border">
            <div className="min-w-0 p-3 sm:p-4"><p className="text-[11px] text-muted-foreground sm:text-xs">Income</p><p className="mt-2 truncate text-sm font-bold tabular-nums sm:text-xl">€4,200</p></div>
            <div className="min-w-0 p-3 sm:p-4"><p className="text-[11px] text-muted-foreground sm:text-xs">Expenses</p><p className="mt-2 truncate text-sm font-bold tabular-nums sm:text-xl">€2,440</p></div>
            <div className="min-w-0 p-3 sm:p-4"><p className="text-[11px] text-muted-foreground sm:text-xs">Net balance</p><p className="mt-2 truncate text-sm font-bold tabular-nums text-primary sm:text-xl">€1,760</p></div>
          </div>
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-2"><p className="text-sm font-bold">Your monthly budgets</p><span className="text-xs text-muted-foreground">Spent / limit</span></div>
            <div className="flex flex-col gap-4">
              {budgets.map((budget) => (
                <div key={budget.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-semibold">{budget.name}</span><span className="tabular-nums text-muted-foreground">{budget.amount}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', budget.name === 'Food and coffee' ? 'bg-destructive' : 'bg-primary')} style={{ width: budget.width }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">A preview of the dashboard using fictional data</figcaption>
    </figure>
  );
}

export default function Home() {
  const demoEnabled = process.env.DEMO_ENABLED === 'true';

  return (
    <>
      <TopBar />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <section className="grid items-center gap-12 pt-12 pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-20">
          <div className="flex flex-col items-start">
            <h1 className="max-w-xl text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">Know where your money goes.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Track EUR income and expenses, set monthly budgets, and understand your spending with clear reports.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {demoEnabled ? <DemoSignIn variant="default" /> : <Link href="/sign-in" className={buttonVariants({ size: 'lg' })}>Sign in to Budgeteer</Link>}
              <Link href="https://github.com/hajdupetke/budgeteer" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'lg' })}>View source code <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
            </div>
            {demoEnabled && <p className="mt-3 text-sm text-muted-foreground">Explore fictional data without creating an account. The demo is read-only.</p>}
          </div>
          <DashboardPreview />
        </section>

        <section aria-labelledby="features-title" className="border-t pt-14 sm:pt-16">
          <div className="max-w-2xl">
            <h2 id="features-title" className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">A clearer view of your finances</h2>
            <p className="mt-3 text-muted-foreground">The essentials for tracking day-to-day spending and staying aware of your monthly limits.</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 flex flex-col items-start gap-5 rounded-xl bg-accent p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div><h2 className="text-xl font-bold text-foreground">See Budgeteer for yourself</h2><p className="mt-2 text-sm text-muted-foreground">Browse the dashboard, transactions, budgets, and reports.</p></div>
          {demoEnabled ? <DemoSignIn variant="default" /> : <Link href="/sign-in" className={buttonVariants({ size: 'lg' })}>Sign in</Link>}
        </section>
      </main>
      <Footer />
    </>
  );
}
