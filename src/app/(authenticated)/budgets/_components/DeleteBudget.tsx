import { Button } from '@/components/ui/button';
import { deleteBudget } from '@/lib/actions';
import { BudgetWithCategory } from '@/types/budget';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DeleteBudget = ({
  budget,
  open,
  setOpen,
}: {
  budget: BudgetWithCategory;
  open: boolean;
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete budget</DialogTitle>
        </DialogHeader>
        <p className="text-red-800">
          Are you sure you want to delete this budget?
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
              const res = await deleteBudget(budget.id);
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
};

export default DeleteBudget;
