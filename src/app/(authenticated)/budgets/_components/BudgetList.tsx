'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type BudgetWithCategory, type BudgetSpending } from '@/types/budget';
import DeleteBudget from './DeleteBudget';
import EditBudget from './EditBudget';
import { type MultiSelectOption } from '@/components/ui/multiselect';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { BudgetProgress } from '@/components/BudgetProgress';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Pencil, Trash2 } from 'lucide-react';

type BudgetRow = BudgetWithCategory & BudgetSpending;

export default function BudgetList({ budgets, categories, page, budgetCount, pageSize }: {
  budgets: BudgetRow[]; categories: MultiSelectOption[]; page: number; budgetCount: number; pageSize: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<BudgetRow | null>(null);
  if (budgetCount === 0) return <div className="rounded-xl border bg-card"><Empty><EmptyHeader><EmptyTitle>Your first budget starts here</EmptyTitle><EmptyDescription>Choose categories and a monthly limit. We’ll show what you’ve spent and what’s left.</EmptyDescription></EmptyHeader></Empty></div>;
  return <>
    <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {budgets.map((budget) => <article key={budget.id} className="flex min-w-0 flex-col gap-5 rounded-xl border bg-card p-5">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0"><h2 className="truncate text-base font-bold" title={budget.name}>{budget.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground" title={budget.categories.map((category) => category.name).join(', ')}>{budget.categories.map((category) => category.name).join(' · ') || 'No categories selected'}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="ghost" aria-label={`Edit ${budget.name}`} onClick={() => { setSelected(budget); setEditOpen(true); }}><Pencil /></Button>
            <Button size="icon" variant="ghost" aria-label={`Delete ${budget.name}`} onClick={() => { setSelected(budget); setDeleteOpen(true); }}><Trash2 /></Button>
          </div>
        </div>
        <div className="mt-auto"><BudgetProgress budget={budget} /></div>
      </article>)}
    </div>
    <PaginationWithLinks page={page} totalCount={budgetCount} pageSize={pageSize} pageSearchParam="page" />
    {selected && editOpen && <EditBudget budget={selected} open={editOpen} setOpen={setEditOpen} categories={categories} />}
    {selected && deleteOpen && <DeleteBudget budget={selected} open={deleteOpen} setOpen={setDeleteOpen} />}
  </>;
}
