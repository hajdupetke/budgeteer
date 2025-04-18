'use client';

import { useState, useEffect } from 'react';
import { createBudget } from '@/lib/actions';
import { BudgetSchema } from '@/lib/validation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/multiselect';
import { CurrencyInput } from '@/components/ui/currency-input';

type BudgetFormData = z.infer<typeof BudgetSchema>;

export default function CreateBudgetForm({
  onSuccess,
  categories,
}: {
  onSuccess?: () => void;
  categories: { label: string; value: string }[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Make form using useForm hook
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(BudgetSchema),
    defaultValues: {
      id: 0,
      name: '',
      maxAmount: 0,
      categoryIds: [],
    },
  });

  // Call server action when submitting form
  const onFormSubmit = async (values: BudgetFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('maxAmount', values.maxAmount.toString());
      formData.append('categoryIds', JSON.stringify(values.categoryIds));
      const res = await createBudget(formData);
      // if response is good run onSuccess function
      if (res.success && onSuccess) onSuccess();
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Budget Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the name of the transaction"
                  className="placeholder:text-slate-400 bg-white h-12 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Categories
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={categories}
                  selected={selected}
                  onChange={(selected) => {
                    setSelected(selected);
                    field.onChange(selected);
                  }}
                  isInvalid={form.formState.errors[field.name] !== undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxAmount"
          render={({ field }) => {
            const isInvalid = form.formState.errors[field.name] !== undefined;
            return (
              <FormItem className="my-4">
                <FormLabel className="text-md text-gray-800 font-semibold my-2">
                  Amount
                </FormLabel>
                <FormControl>
                  <CurrencyInput field={field} isInvalid={isInvalid} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded text-lg py-6 bg-primary-600 hover:bg-primary-700 box-shadow-md shadow-gray-600"
        >
          {isSubmitting ? 'Saving...' : 'Create Budget'}
        </Button>
      </form>
    </Form>
  );
}
