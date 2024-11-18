'use client';

import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import CategoryForm from './CategoryForm';
import { X } from 'lucide-react';

const NewCategory = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className={`${buttonVariants({
          variant: 'default',
          size: 'xl',
        })} !bg-accent !rounded-3xl !hover:bg-[#7c00bf]`}
      >
        Add new category
      </button>
      {open && (
        <div
          className="bg-[rgba(0,0,0,0.3)] w-screen h-screen absolute top-0 left-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if ((e.target as Element).id == 'overlay') {
              setOpen(false);
            }
          }}
          id="overlay"
        >
          <div className="w-1/3 bg-white p-4 relative" id="popup-window">
            <h3 className="text-2xl font-medium">Create new category</h3>
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
