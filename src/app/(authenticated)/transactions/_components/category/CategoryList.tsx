'use client';

import { TransactionCategory } from '@prisma/client';
import { useState } from 'react';
import EditCategory from './EditCategory';
import DeleteCategory from './DeleteCategory';

const CategoryList = ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionCategory>(categories[0]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      {categories
        .filter((elem) => elem.userId != null)
        .map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between my-4"
          >
            <p className="text-lg basis-4/6">
              {category.icon} {category.name}
            </p>
            <p
              className="basis-1/6"
              onClick={() => {
                setSelected(category);
                setOpen(true);
              }}
            >
              Edit
            </p>
            <p
              className="basis-1/6"
              onClick={() => {
                setSelected(category);
                setDeleteOpen(true);
              }}
            >
              Delete
            </p>
          </div>
        ))}
      {open && (
        <EditCategory category={selected} setOpen={(bool) => setOpen(bool)} />
      )}
      {deleteOpen && (
        <DeleteCategory
          category={selected}
          setOpen={(bool) => setDeleteOpen(bool)}
        />
      )}
    </>
  );
};

export default CategoryList;
