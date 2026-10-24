'use client';

import type { TransactionWithCategory } from '@/types/transaction';

import { toast } from 'sonner';
import { applyFieldErrors } from '@/lib/form-errors';

import { useState, useEffect } from 'react';
import { updateTransaction } from '@/lib/actions';
import { TransactionSchema } from '@/lib/validation';
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
import type { CategoryOption } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime/datetime-picker';
import { CurrencyInput } from '@/components/ui/currency-input';

type TransactionFormData = z.infer<typeof TransactionSchema>;

export default function EditTransactionForm({
  transaction,
  onSuccess,
  categories,
}: {
  transaction: TransactionWithCategory;
  onSuccess?: () => void;
  categories: CategoryOption[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(transaction?.timestamp);

  // Make form using useForm hook
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      id: transaction?.id,
      name: transaction?.name,
      amount: transaction?.amount.toFixed(2),
      categoryId: transaction?.categoryId ?? undefined,
      timestamp: transaction?.timestamp,
      type: transaction?.type,
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({ ...transaction, amount: transaction.amount.toFixed(2), categoryId: transaction.categoryId ?? undefined });
    }
  }, [transaction, form]);

  // Call server action when submitting form
  const onFormSubmit = async (values: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('amount', values.amount.toString());
      formData.append('categoryId', (values?.categoryId as number).toString());
      formData.append('transactionType', values.type);
      if (values.timestamp)
        formData.append('timestamp', new Date(values.timestamp).toISOString());
      const res = await updateTransaction(formData, transaction.id as number);
      // if response is good run onSuccess function
      if (res.success) {
        onSuccess?.();
      } else {
        applyFieldErrors(form.setError, res.error.fieldErrors, ['name', 'amount', 'categoryId', 'timestamp', 'type']);
        toast.error(res.error.message);
      }
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
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Transaction Name
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
          name="type"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Transaction Type
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full placeholder:text-slate-400 bg-white !h-12 text-sm">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Amount
              </FormLabel>
              <FormControl>
                <CurrencyInput
                  field={field}
                  isInvalid={form.formState.errors[field.name] !== undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Category
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value ? field.value.toString() : undefined}
                value={field.value ? field.value.toString() : undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full placeholder:text-slate-400 bg-white !h-12 text-sm">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => {
                    return (
                      <SelectItem
                        value={category.id.toString()}
                        key={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold my-2">
                Timestamp
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  date={date}
                  setDate={(newDate) => {
                    setDate(newDate);
                    field.onChange(newDate);
                  }}
                  field={field}
                  isInvalid={form.formState.errors[field.name] !== undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded text-lg py-6 bg-primary-600 hover:bg-primary-700 box-shadow-md shadow-gray-600"
        >
          {isSubmitting ? 'Saving...' : 'Edit Transaction'}
        </Button>
      </form>
    </Form>
  );
}
