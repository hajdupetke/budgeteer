'use client';

import { useState, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { PreviewConfig } from 'emoji-picker-react/dist/config/config';
import { updateTransactionCategory } from '@/lib/actions';
import { TransactionCategorySchema } from '@/lib/validation';
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

type CategoryFormData = z.infer<typeof TransactionCategorySchema>;

export default function EditCategoryForm({
  category,
  onSuccess,
}: {
  category: CategoryFormData;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Configuraton object for the preview of the EmojiPicker
  const previewConfig: PreviewConfig = {
    defaultEmoji: '1f60a',
    defaultCaption: "What's your mood?",
    showPreview: false,
  };

  // Make form using useForm hook
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(TransactionCategorySchema),
    defaultValues: {
      id: category?.id,
      icon: category?.icon,
      name: category?.name,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset(category);
    }
  }, [category, form]);

  // Call server action when submitting form
  const onFormSubmit = async (values: CategoryFormData) => {
    setIsSubmitting(true);
    form.clearErrors();
    try {
      const formData = new FormData();
      formData.append('icon', values.icon);
      formData.append('name', values.name);
      const res = await updateTransactionCategory(
        formData,
        category.id as number
      );

      // if response is good run onSuccess function
      if (res.success) onSuccess?.();
      else form.setError('root', { message: res.message });
    } catch {
      form.setError('root', { message: 'Could not save your changes. Try again.' });
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}><FieldGroup>
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category icon
              </FormLabel>
              <div>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowPicker(!showPicker)}
                  >
                    {field.value ? (
                      <span className="mr-2 text-xl">{field.value}</span>
                    ) : (
                      'Select an emoji'
                    )}
                  </Button>
                </FormControl>
                  {
                    /* Show EmojiPicker when button is pressed */
                    showPicker && (
                      <div className="mt-2">
                        <EmojiPicker
                          width="100%"
                          height={320}
                          onEmojiClick={(emojiObj: EmojiClickData) => {
                            field.onChange(emojiObj.emoji);
                            setShowPicker(false);
                          }}
                          previewConfig={previewConfig}
                        />
                      </div>
                    )
                  }
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  {...field}
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
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </FieldGroup></form>
    </Form>
  );
}
