export type BudgetWithCategory = {
  id: number;
  name: string;
  max: number;
  categories: { id: number; name: string }[];
  categoryIds: number[];
};
