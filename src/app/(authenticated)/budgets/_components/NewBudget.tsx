'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        <Button>Add budget</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle >
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
