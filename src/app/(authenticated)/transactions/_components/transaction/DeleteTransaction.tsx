import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions';
import { TransactionWithCategory } from '@/types/transaction';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DeleteTransaction = ({
  transaction,
  open,
  setOpen,
}: {
  transaction: TransactionWithCategory;
  open: boolean;
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete transaction</DialogTitle>
        </DialogHeader>
        <p className="text-red-800">
          Are you sure you want to delete this transaction?
        </p>
        <p className="text-red-800">This action cannot be undone.</p>
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
              const res = await deleteTransaction(transaction.id);
              if (res.success) {
                setOpen(false);
                toast.success('Transaction succesfully deleted!');
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

export default DeleteTransaction;
