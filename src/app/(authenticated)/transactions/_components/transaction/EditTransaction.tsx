import EditTransactionForm from './EditTransactionForm';
import { TransactionCategory } from '@prisma/client';
import { TransactionWithCategory } from '@/types/transaction';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EditTransaction = ({
  transaction,
  categories,
  open,
  setOpen,
}: {
  transaction: TransactionWithCategory;
  categories: TransactionCategory[];
  open: boolean;
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold">
          Create a new budget
        </DialogTitle>
        <EditTransactionForm
          categories={categories}
          transaction={transaction}
          onSuccess={() => {
            setOpen(false);
            toast.success('Budget successfully edited!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTransaction;
