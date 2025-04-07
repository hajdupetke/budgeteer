'use client';

import { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '@/lib/actions';
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
import { TransactionCategory } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime/datetime-picker';

type TransactionFormData = z.infer<typeof TransactionSchema>;

export default function TransactionForm({
  transaction,
  onSuccess,
  categories,
}: {
  transaction?: TransactionFormData;
  onSuccess?: () => void;
  categories: TransactionCategory[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    transaction?.timestamp ?? undefined
  );
  const isEditing = !!transaction;

  // Make form using useForm hook
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      id: transaction?.id || 0,
      name: transaction?.name || '',
      amount: transaction?.amount || 0,
      categoryId: transaction?.categoryId || 0,
      timestamp: transaction?.timestamp || new Date(),
      type: transaction?.type || 'INCOME',
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset(transaction);
    }
  }, [transaction, form]);

  // Call server action when submitting form
  const onFormSubmit = async (values: TransactionFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('amount', values.amount.toString());
      formData.append('categoryId', values.categoryId.toString());
      formData.append('transactionType', values.type);
      if (values.timestamp)
        formData.append('timestamp', new Date(values.timestamp).toString());
      console.log(formData);
      const res =
        isEditing && transaction.id
          ? await updateTransaction(formData, transaction.id)
          : await createTransaction(formData);
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
                <Input
                  placeholder="100 EUR"
                  className="placeholder:text-slate-400 bg-white h-12 text-sm"
                  type="number"
                  step={0.01}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
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
          {isSubmitting
            ? 'Saving...'
            : (isEditing ? 'Edit' : 'Create') + ' Transaction'}
        </Button>
      </form>
    </Form>
  );
}
