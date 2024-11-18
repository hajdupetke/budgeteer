import { X } from 'lucide-react';
import { TransactionCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { deleteTransactionCategory } from '@/lib/actions';

const DeleteCategory = ({
  category,
  setOpen,
}: {
  category: TransactionCategory;
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <div
      className="bg-[rgba(0,0,0,0.3)] w-screen h-screen absolute top-0 left-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if ((e.target as Element).id == 'overlay') {
          setOpen(false);
        }
      }}
      id="overlay"
    >
      <div
        className="w-1/3 bg-white p-4 relative border border-red-500"
        id="popup-window"
      >
        <h3 className="text-2xl font-medium">Delete category</h3>
        <X
          className="absolute right-4 top-4 cursor-pointer"
          onClick={() => setOpen(false)}
        />

        <p className="my-4">Are you sure you want to delete this category?</p>
        <p>
          This action cannot be undone, all transactions with this category,
          will now have no category.
        </p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const res = await deleteTransactionCategory(category.id);
              if (res.success) setOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategory;
