'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BudgetWithCategory } from '@/types/budget';
import DeleteBudget from './DeleteBudget';
import EditBudget from './EditBudget';
import { MultiSelectOption } from '@/components/ui/multiselect';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';

const BudgetList = ({
  budgets,
  categories,
  page,
  budgetCount,
  pageSize,
}: {
  budgets: BudgetWithCategory[];
  categories: MultiSelectOption[];
  page: number;
  budgetCount: number;
  pageSize: number;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<BudgetWithCategory>(budgets[0]);

  if (budgetCount > 0) {
    return (
      <>
        <Card>
          <CardContent>
            <div className="grid grid-cols-4 items-center justify-between py-4">
              <p className="font-semibold text-gray-500 text-center">Name</p>
              <p className="font-semibold text-gray-500 text-center">
                Max amount
              </p>
              <p className="font-semibold text-gray-500 text-center">
                Categories
              </p>
              <p className="basis-2/6 text-center font-semibold text-gray-500">
                Actions
              </p>
            </div>
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="grid grid-cols-4  items-center justify-between py-4 border-t-2 border-gray-100"
              >
                <p className="text-2xl flex items-center justify-center gap-4">
                  <span className="text-lg font-semibold flex items-center gap-2">
                    {budget.name}{' '}
                  </span>
                </p>
                <p className="text-center">{budget.max} EUR</p>
                <p className="text-center">
                  {budget.categories.slice(0, 3).map((category) => (
                    <span key={category.name}>{category.name} </span>
                  ))}
                  {budget.categories.length > 3 && '...'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    className="w-content bg-transparent! shadow-none! text-gray-500 font-bold hover:underline hover:text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSelected(budget);
                      setDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>

                  <Button
                    className="w-content bg-primary-200 text-primary-900 font-bold hover:bg-primary-300 transition-colors rounded-xl"
                    onClick={() => {
                      setSelected(budget);
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <PaginationWithLinks
              page={page}
              totalCount={budgetCount}
              pageSize={pageSize}
              pageSearchParam="page"
            />
          </CardFooter>
        </Card>
        <DeleteBudget
          open={deleteOpen}
          setOpen={setDeleteOpen}
          budget={selected}
        />
        <EditBudget
          open={editOpen}
          setOpen={setEditOpen}
          budget={selected}
          categories={categories}
        />
      </>
    );
  } else {
    return (
      <Card>
        <CardContent>You haven't created any budgets yet!</CardContent>
      </Card>
    );
  }
};

export default BudgetList;
