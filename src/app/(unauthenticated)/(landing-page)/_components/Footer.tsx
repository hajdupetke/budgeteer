import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} Budgeteer · Built by Hajdu Péter</p>
        <Link href="https://github.com/hajdupetke/budgeteer" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline-offset-4 hover:underline">Source code on GitHub</Link>
      </div>
    </footer>
  );
}
