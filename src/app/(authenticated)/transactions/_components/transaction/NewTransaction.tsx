'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionCategory } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateTransactionForm from './CreateTransactionForm';
import { toast } from 'sonner';

const NewTransaction = ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className={`${buttonVariants({
            variant: 'default',
            size: 'xl',
          })} !bg-primary-600 !w-10 !h-10 !mr-0 !p-0 !rounded-3xl hover:!bg-primary-800`}
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold">
          Create new transaction
        </DialogTitle>
        <CreateTransactionForm
          categories={categories}
          onSuccess={() => {
            setOpen(false);
            toast.success('Transaction successfully created!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewTransaction;
