'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        <Button><Plus data-icon="inline-start" />Add transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle >
          Add a transaction
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
