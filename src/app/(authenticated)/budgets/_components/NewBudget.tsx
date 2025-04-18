'use client';

import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateBudgetForm from './CreateBudgetForm';
import { toast } from 'sonner';
import { MultiSelectOption } from '@/components/ui/multiselect';

const NewBudget = ({ categories }: { categories: MultiSelectOption[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={() => setOpen(true)}
          className={`${buttonVariants({
            variant: 'default',
            size: 'xl',
          })} !bg-primary-600 !mr-4 !rounded-3xl hover:!bg-primary-800 !font-bold text-lg uppercase cursor-pointer`}
        >
          Create new budget
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold">
          Create a new budget
        </DialogTitle>
        <CreateBudgetForm
          categories={categories}
          onSuccess={() => {
            setOpen(false);
            toast.success('Budget successfully created!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewBudget;
