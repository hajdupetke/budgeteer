import TransactionForm from './TransactionForm';
import { X } from 'lucide-react';
import { TransactionCategory, Transaction } from '@prisma/client';
import { TransactionWithCategory } from '@/types/transaction';

const EditTransaction = ({
  transaction,
  categories,
  setOpen,
}: {
  transaction: TransactionWithCategory;
  categories: TransactionCategory[];
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <div
      className="bg-gray-200/30 w-screen h-screen absolute backdrop-blur-xs top-0 left-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if ((e.target as Element).id == 'overlay') {
          setOpen(false);
        }
      }}
      id="overlay"
    >
      <div
        className="w-3/4 md:w-1/2 lg:w-1/3 bg-white p-4 relative rounded-xl drop-shadow-xl"
        id="popup-window"
      >
        <h3 className="text-2xl font-bold">Edit transaction</h3>
        <X
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => setOpen(false)}
        />

        <TransactionForm
          onSuccess={() => {
            setOpen(false);
          }}
          categories={categories}
          transaction={{ ...transaction, amount: String(transaction.amount) }}
        />
      </div>
    </div>
  );
};

export default EditTransaction;
