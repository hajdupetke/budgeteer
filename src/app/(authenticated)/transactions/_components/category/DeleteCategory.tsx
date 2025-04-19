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
          This action cannot be undone, all transactions with this category,
          will now have no category.
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
            onClick={async () => {
              const res = await deleteTransactionCategory(category.id);
              if (res.success) {
                setOpen(false);
                toast.success('Category succesfully deleted!');
              }
            }}
            className="bg-warning-600! font-bold hover:bg-warning-800! cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategory;
