import { useState } from 'react';
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
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete budget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this budget?
        </p>
        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        <div className="flex gap-1 mt-4 justify-end">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                const res = await deleteBudget(budget.id);
                if (res.success) {
                  setOpen(false);
                  toast.success('Budget successfully deleted!');
                } else toast.error(res.message);
              } catch {
                toast.error('Could not delete this record. Try again.');
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBudget;
