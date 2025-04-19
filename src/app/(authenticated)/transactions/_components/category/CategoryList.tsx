'use client';

import { TransactionCategory } from '@prisma/client';
import { useState } from 'react';
import EditCategory from './EditCategory';
import DeleteCategory from './DeleteCategory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const CategoryList = ({
  categories,
}: {
  categories: TransactionCategory[];
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionCategory>(categories[0]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="mt-4">
        <CardContent>
          <div className="flex items-center justify-between py-4 border-b-2 border-gray-100">
            <p className="font-semibold text-gray-500">Category name</p>
            <p className="basis-2/6 text-center font-semibold text-gray-500">
              Actions
            </p>
          </div>
          {categories
            .filter((elem) => elem.userId != null)
            .map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  'flex items-center justify-between py-4 gap-2 border-t-2 border-gray-100',
                  { 'border-t-0!': index === 0 }
                )}
              >
                <p className="text-2xl flex items-center gap-4 basis-4/6">
                  {category.icon}{' '}
                  <span className="text-lg font-semibold">{category.name}</span>
                </p>
                <Button
                  className="basis-1/6 bg-transparent! shadow-none! text-gray-500 font-bold hover:underline hover:text-gray-900"
                  onClick={() => {
                    setSelected(category);
                    setDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>

                <Button
                  className="basis-1/6 bg-primary-200 text-primary-900 font-bold hover:bg-primary-300 transition-colors rounded-xl"
                  onClick={() => {
                    setSelected(category);
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>
      {editOpen && (
        <EditCategory
          category={selected}
          setOpen={(bool) => setEditOpen(bool)}
        />
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
