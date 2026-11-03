import { type ReactNode } from 'react';

export function PageHeading({ title, description, children }: { title: string; description: ReactNode; children?: ReactNode }) {
  return <header className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0"><h1 className="page-title">{title}</h1><div className="page-description mt-2">{description}</div></div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </header>;
}
