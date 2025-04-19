'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import CreateCategoryForm from './CreateCategoryForm';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const NewCategory = () => {
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
          Create new category
        </DialogTitle>
        <CreateCategoryForm
          onSuccess={() => {
            setOpen(false);
            toast.success('Category succesfully created!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewCategory;
