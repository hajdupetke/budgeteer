'use client';

import { TransactionWithCategory } from '@/types/transaction';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import EditTransaction from './EditTransaction';
import { TransactionCategory } from '@prisma/client';
import DeleteTransaction from './DeleteTransaction';

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
      <div className="w-full p-4 bg-gray-50 shadow-gray-300 drop-shadow-md rounded-xl my-5">
        <div className="grid grid-cols-4 items-center justify-between py-4 border-b-2 border-gray-100">
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
            className={clsx(
              'grid grid-cols-4  items-center justify-between py-4 gap-2 border-t-2 border-gray-100',
              { 'border-t-0!': index === 0 }
            )}
          >
            <p className="text-2xl flex items-center gap-4">
              {transaction.category.icon}{' '}
              <span className="text-lg font-semibold">{transaction.name}</span>
            </p>
            <p className="text-center">{transaction.amount}</p>
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
            <div className="flex items-center justify-center">
              <Button
                className="w-full bg-transparent! shadow-none! text-gray-500 font-bold hover:underline hover:text-gray-900"
                onClick={() => {
                  setSelected(transaction);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </Button>

              <Button
                className="w-full bg-primary-200 text-primary-900 font-bold hover:bg-primary-300 transition-colors rounded-xl"
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
      </div>
      {editOpen && (
        <EditTransaction
          transaction={selected}
          setOpen={(bool) => setEditOpen(bool)}
          categories={categories}
        />
      )}
      {deleteOpen && (
        <DeleteTransaction
          transaction={selected}
          setOpen={(bool) => setDeleteOpen(bool)}
        />
      )}
    </>
  );
};

export default TransactionList;
