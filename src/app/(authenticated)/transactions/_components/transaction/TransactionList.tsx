'use client';

import { useState } from 'react';
import { type TransactionCategory } from '@prisma/client';
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/finance';
import { shortDate } from '@/lib/report-presentation';
import { type TransactionWithCategory } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from '@/components/ui/table';
import EditTransaction from './EditTransaction';
import DeleteTransaction from './DeleteTransaction';

export default function TransactionList({ transactions, categories }: { transactions: TransactionWithCategory[]; categories: TransactionCategory[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionWithCategory | null>(null);
  function actions(transaction: TransactionWithCategory) {
    return <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label={`Edit ${transaction.name}`} onClick={() => { setSelected(transaction); setEditOpen(true); }}><Pencil /></Button>
      <Button variant="ghost" size="icon" aria-label={`Delete ${transaction.name}`} onClick={() => { setSelected(transaction); setDeleteOpen(true); }}><Trash2 /></Button>
    </div>;
  }
  function name(transaction: TransactionWithCategory) {
    const income = transaction.type === 'INCOME';
    const Icon = income ? ArrowDownLeft : ArrowUpRight;
    return <div className="flex min-w-0 items-center gap-3">
      <span className={income ? 'text-positive' : 'text-muted-foreground'}><Icon className="size-[18px]" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="truncate font-semibold" title={transaction.name}>{transaction.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{income ? 'Income' : 'Expense'}</p></div>
    </div>;
  }
  return <>
    <div className="hidden overflow-hidden rounded-xl border bg-card xl:block">
      <Table>
        <TableCaption className="sr-only">Transactions with amounts in EUR and dates in UTC</TableCaption>
        <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Category</TableHead><TableHead>Date (UTC)</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{transactions.map((transaction) => <TableRow key={transaction.id}>
          <TableCell className="max-w-[260px]">{name(transaction)}</TableCell>
          <TableCell className="max-w-[180px]"><p className="truncate text-muted-foreground" title={transaction.category?.name ?? 'Uncategorized'}>{transaction.category?.icon && <span aria-hidden="true">{transaction.category.icon} </span>}{transaction.category?.name ?? 'Uncategorized'}</p></TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground"><time dateTime={transaction.timestamp.toISOString()}>{shortDate(transaction.timestamp)}</time></TableCell>
          <TableCell className="money whitespace-nowrap text-right font-bold">{transaction.type === 'INCOME' ? '+' : '−'}{formatMoney(transaction.amount)}</TableCell>
          <TableCell>{actions(transaction)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </div>
    <ul className="flex min-w-0 flex-col divide-y rounded-xl border bg-card px-4 xl:hidden">
      {transactions.map((transaction) => <li key={transaction.id} className="flex min-w-0 flex-col gap-3 py-4">
        <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0">{name(transaction)}</div><p className="money shrink-0 text-sm font-bold">{transaction.type === 'INCOME' ? '+' : '−'}{formatMoney(transaction.amount)}</p></div>
        <div className="flex min-w-0 items-center justify-between gap-2"><div className="min-w-0 text-xs text-muted-foreground"><p className="truncate" title={transaction.category?.name ?? 'Uncategorized'}>{transaction.category?.name ?? 'Uncategorized'}</p><time dateTime={transaction.timestamp.toISOString()}>{shortDate(transaction.timestamp)} · UTC</time></div>{actions(transaction)}</div>
      </li>)}
    </ul>
    {selected && editOpen && <EditTransaction transaction={selected} open={editOpen} setOpen={setEditOpen} categories={categories} />}
    {selected && deleteOpen && <DeleteTransaction transaction={selected} open={deleteOpen} setOpen={setDeleteOpen} />}
  </>;
}
