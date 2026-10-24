import EditCategoryForm from './EditCategoryForm';
import type { CategoryOption } from '@/types/category';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EditCategory = ({
  category,
  open,
  setOpen,
}: {
  category: CategoryOption;
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
