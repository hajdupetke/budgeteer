import { X } from 'lucide-react';
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
                toast.success('Budget succesfully deleted!');
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
        className="w-3/4 md:w-1/2 lg:w-1/3 p-4 border-2 border-warning-800 bg-warning-50 relative rounded-xl drop-shadow-xl"
        id="popup-window"
      >
        <h3 className="text-2xl font-semibold text-red-900">
          Delete transaction
        </h3>
        <X
          className="absolute right-4 top-4 cursor-pointer transition-colors stroke-red-900 hover:stroke-red-500"
          onClick={() => setOpen(false)}
        />

        <p className="my-4 text-red-800">
          Are you sure you want to delete this transaction?
        </p>
        <p className="text-red-800">This action cannot be undone.</p>
        <div className="flex gap-1 mt-4 justify-end">
          <Button
            onClick={() => setOpen(false)}
            className="bg-transparent! shadow-none! text-gray-600 font-bold hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const res = await deleteTransaction(transaction.id);
              if (res.success) setOpen(false);
            }}
            className="bg-warning-600! font-bold hover:bg-warning-800!"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTransaction;
