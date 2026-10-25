'use client';

import { useState } from 'react';
import { type TransactionCategory } from '@prisma/client';
import { ArrowLeft, Pencil, Plus, Shapes, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { deleteTransactionCategory } from '@/lib/actions';
import CreateCategoryForm from './CreateCategoryForm';
import EditCategoryForm from './EditCategoryForm';

export default function ManageCategories({ categories, page, count, pageSize }: { categories: TransactionCategory[]; page: number; count: number; pageSize: number }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'delete'>('list');
  const [selected, setSelected] = useState<TransactionCategory | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  function back() { setView('list'); setSelected(null); setError(''); }
  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) back(); }}>
    <DialogTrigger asChild><Button variant="outline"><Shapes data-icon="inline-start" />Manage categories</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{view === 'create' ? 'Add category' : view === 'edit' ? 'Edit category' : view === 'delete' ? 'Delete category' : 'Your categories'}</DialogTitle>
        <DialogDescription>{view === 'list' ? 'Organize your transactions. Shared default categories remain available when you add a transaction.' : 'Changes apply to your personal categories.'}</DialogDescription>
      </DialogHeader>
      {view !== 'list' && <Button variant="ghost" size="sm" className="w-fit" disabled={pending} onClick={back}><ArrowLeft data-icon="inline-start" />Back to categories</Button>}
      {view === 'list' && <>
        <Button variant="secondary" className="w-fit" onClick={() => setView('create')}><Plus data-icon="inline-start" />Add category</Button>
        {categories.length === 0 ? <Empty><EmptyHeader><EmptyTitle>Make it your own</EmptyTitle><EmptyDescription>Add a category for the things you spend on. You can also use the shared defaults.</EmptyDescription></EmptyHeader></Empty> : <ul className="flex flex-col divide-y">
          {categories.map((category) => <li key={category.id} className="flex min-w-0 items-center justify-between gap-2 py-3">
            <span className="flex min-w-0 items-center gap-3"><span aria-hidden="true">{category.icon}</span><span className="truncate text-sm font-semibold" title={category.name}>{category.name}</span></span>
            <span className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${category.name}`} onClick={() => { setSelected(category); setView('edit'); }}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${category.name}`} onClick={() => { setSelected(category); setView('delete'); }}><Trash2 /></Button></span>
          </li>)}
        </ul>}
        <PaginationWithLinks page={page} totalCount={count} pageSize={pageSize} pageSearchParam="categoryPage" />
      </>}
      {view === 'create' && <CreateCategoryForm onSuccess={() => { toast.success('Category added.'); back(); }} />}
      {view === 'edit' && selected && <EditCategoryForm category={selected} onSuccess={() => { toast.success('Category updated.'); back(); }} />}
      {view === 'delete' && selected && <>
        <p className="text-sm">Delete <strong className="break-words">{selected.name}</strong>? Its transactions will become Uncategorized and it will be removed from budgets. This cannot be undone.</p>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="flex justify-end gap-2"><Button variant="outline" disabled={pending} onClick={back}>Cancel</Button><Button variant="destructive" disabled={pending} onClick={async () => {
          setPending(true); setError('');
          try { const result = await deleteTransactionCategory(selected.id); if (result.success) { toast.success('Category deleted.'); back(); } else setError(result.message); }
          catch { setError('Could not delete the category. Try again.'); }
          finally { setPending(false); }
        }}>{pending ? 'Deleting…' : 'Delete category'}</Button></div>
      </>}
    </DialogContent>
  </Dialog>;
}
