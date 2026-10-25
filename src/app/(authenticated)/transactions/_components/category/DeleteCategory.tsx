import { useState } from 'react';
import { TransactionCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { deleteTransactionCategory } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DeleteCategory = ({
  category,
  open,
  setOpen,
}: {
  category: TransactionCategory;
  open: boolean;
  setOpen: (bool: boolean) => void;
}) => {
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
        </DialogHeader>
        <p className="text-red-800">
          Are you sure you want to delete this category?
        </p>
        <p className="text-red-800">
          {' '}
          This action cannot be undone. Existing transactions will become Uncategorized. The category will also be removed from budgets.
        </p>
        <div className="flex gap-1 mt-4 justify-end">
          <Button
            onClick={() => setOpen(false)}
            className="bg-transparent! shadow-none! text-gray-600 font-bold hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                const res = await deleteTransactionCategory(category.id);
                if (res.success) {
                  setOpen(false);
                  toast.success('Category successfully deleted!');
                } else toast.error(res.message);
              } catch {
                toast.error('Could not delete this record. Try again.');
              } finally {
                setPending(false);
              }
            }}
            className="bg-warning-600! font-bold hover:bg-warning-800! cursor-pointer"
          >
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategory;
