'use client';

import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import EditBudgetForm from './EditBudgetForm';
import { toast } from 'sonner';
import { MultiSelectOption } from '@/components/ui/multiselect';
import { BudgetWithCategory } from '@/types/budget';

const EditBudget = ({
  budget,
  open,
  setOpen,
  categories,
}: {
  budget: BudgetWithCategory;
  open: boolean;
  setOpen: (bool: boolean) => void;
  categories: MultiSelectOption[];
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold">
          Create a new budget
        </DialogTitle>
        <EditBudgetForm
          categories={categories}
          budget={budget}
          onSuccess={() => {
            setOpen(false);
            toast.success('Budget successfully edited!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBudget;
