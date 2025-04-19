'use client';

import { TransactionWithCategory } from '@/types/transaction';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditTransaction from './EditTransaction';
import { TransactionCategory, TransactionType } from '@prisma/client';
import DeleteTransaction from './DeleteTransaction';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TransactionList = ({
  transactions,
  categories,
}: {
  transactions: TransactionWithCategory[];
  categories: TransactionCategory[];
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionWithCategory>(
    transactions[0]
  );

  return (
    <>
      <div className="grid grid-cols-4 items-center justify-between py-4">
        <p className="font-semibold text-gray-500 text-center">Name</p>
        <p className="font-semibold text-gray-500 text-center">Amount</p>
        <p className="font-semibold text-gray-500 text-center">Timestamp</p>
        <p className="basis-2/6 text-center font-semibold text-gray-500">
          Actions
        </p>
      </div>
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="grid grid-cols-4  items-center justify-between py-4 border-t-2 border-gray-100"
        >
          <p className="text-2xl flex items-center justify-center gap-4">
            {transaction.type === TransactionType.INCOME ? (
              <TrendingUp className="text-success-600" />
            ) : (
              <TrendingDown className="text-warning-600" />
            )}
            {transaction.category.icon}
            <span className="text-lg font-semibold flex items-center gap-2">
              {transaction.name}{' '}
            </span>
          </p>
          <p className="text-center">{transaction.amount} EUR</p>
          <p className="text-center">
            {transaction.timestamp.toLocaleString('en-us', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              className="w-content bg-transparent! shadow-none! text-gray-500 font-bold hover:underline hover:text-gray-900 !p-0"
              onClick={() => {
                setSelected(transaction);
                setDeleteOpen(true);
              }}
            >
              Delete
            </Button>

            <Button
              className="bg-primary-200 text-primary-900 font-bold hover:bg-primary-300 transition-colors rounded-xl"
              onClick={() => {
                setSelected(transaction);
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      ))}

      <EditTransaction
        transaction={selected}
        open={editOpen}
        setOpen={(bool) => setEditOpen(bool)}
        categories={categories}
      />
      <DeleteTransaction
        transaction={selected}
        open={deleteOpen}
        setOpen={(bool) => setDeleteOpen(bool)}
      />
    </>
  );
};

export default TransactionList;
