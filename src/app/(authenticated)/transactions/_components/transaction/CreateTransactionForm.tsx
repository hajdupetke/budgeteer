'use client';

import { useState } from 'react';
import { createTransaction } from '@/lib/actions';
import { TransactionSchema } from '@/lib/validation';
import { z } from 'zod';
import { FieldGroup } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  SelectGroup,
  SelectTrigger,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime/datetime-picker';
import { CurrencyInput } from '@/components/ui/currency-input';

type TransactionFormData = z.infer<typeof TransactionSchema>;

export default function CreateTransactionForm({
  onSuccess,
  categories,
}: {
  onSuccess?: () => void;
  categories: TransactionCategory[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Make form using useForm hook
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      id: 0,
      name: '',
      amount: '',
      categoryId: null,
      timestamp: date,
      type: 'INCOME',
    },
  });

  // Call server action when submitting form
  const onFormSubmit = async (values: TransactionFormData) => {
    setIsSubmitting(true);
    form.clearErrors();
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('amount', values.amount.toString());
      formData.append('categoryId', values.categoryId?.toString() ?? '');
      formData.append('transactionType', values.type);
      if (values.timestamp)
        formData.append('timestamp', values.timestamp.toISOString());
      const res = await createTransaction(formData);
      // if response is good run onSuccess function
      if (res.success) onSuccess?.();
      else form.setError('root', { message: res.message });
    } catch {
      form.setError('root', { message: 'Could not save your changes. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}><FieldGroup>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Weekly groceries"
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
            <FormItem>
              <FormLabel>
                Type
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectGroup>
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
            <FormItem>
              <FormLabel>
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
            <FormItem>
              <FormLabel>
                Category
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'uncategorized' ? null : Number(value))}
                value={field.value?.toString() ?? 'uncategorized'}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
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
                  </SelectGroup>
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
            <FormItem>
              <FormLabel>
                Date and time
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

        {form.formState.errors.root && <Alert variant="destructive"><AlertDescription>{form.formState.errors.root.message}</AlertDescription></Alert>}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Add transaction'}
        </Button>
      </FieldGroup></form>
    </Form>
  );
}
