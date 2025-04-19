import EditCategoryForm from './EditCategoryForm';
import { X } from 'lucide-react';
import { TransactionCategory } from '@prisma/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EditCategory = ({
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
        <DialogTitle className="text-2xl font-bold">Edit category</DialogTitle>
        <EditCategoryForm
          category={category}
          onSuccess={() => {
            setOpen(false);
            toast.success('Category successfully edited!');
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCategory;
