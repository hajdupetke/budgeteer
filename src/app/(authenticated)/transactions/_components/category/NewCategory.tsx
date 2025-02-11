'use client';

import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import CategoryForm from './CategoryForm';
import { X, Plus } from 'lucide-react';

const NewCategory = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className={`${buttonVariants({
          variant: 'default',
          size: 'xl',
        })} !bg-primary-600 !w-10 !h-10 !mr-4 !p-0 !rounded-3xl hover:!bg-primary-800`}
      >
        <Plus />
      </button>
      {open && (
        <div
          className="bg-gray-200/30 backdrop-blur-xs w-screen h-screen absolute top-0 left-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if ((e.target as Element).id == 'overlay') {
              setOpen(false);
            }
          }}
          id="overlay"
        >
          <div className="w-3/4 md:w-1/2 lg:w-1/3 bg-white p-4 relative rounded-xl drop-shadow-xl" id="popup-window">
            <h3 className="text-2xl font-bold">Create new category</h3>
            <X
              className="absolute right-4 top-4 cursor-pointer"
              onClick={() => setOpen(false)}
            />

            <CategoryForm
              onSuccess={() => {
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCategory;
