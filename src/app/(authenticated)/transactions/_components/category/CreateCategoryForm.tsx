'use client';

import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { PreviewConfig } from 'emoji-picker-react/dist/config/config';
import { createTransactionCategory } from '@/lib/actions';
import { TransactionCategorySchema } from '@/lib/validation';
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

type CategoryFormData = z.infer<typeof TransactionCategorySchema>;

export default function CreateCategoryForm({
  onSuccess,
}: {
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
      id: 0,
      icon: '',
      name: '',
    },
  });

  // Call server action when submitting form
  const onFormSubmit = async (values: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('icon', values.icon);
      formData.append('name', values.name);
      const res = await createTransactionCategory(formData);

      // if response is good run onSuccess function
      if (res.success && onSuccess) onSuccess();
    } catch (err) {
      console.log(err);
    }
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold">
                Category Icon
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-slate-400 h-12 text-sm"
                    onClick={() => setShowPicker(!showPicker)}
                  >
                    {field.value ? (
                      <span className="mr-2 text-xl">{field.value}</span>
                    ) : (
                      'Select an emoji'
                    )}
                  </Button>
                  {
                    /* Show EmojiPicker when button is pressed */
                    showPicker && (
                      <div className="absolute z-10 mt-1">
                        <EmojiPicker
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel className="text-md text-gray-800 font-semibold">
                Category Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  className="placeholder:text-slate-400 bg-white h-12 text-sm"
                  {...field}
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
          {isSubmitting ? 'Saving...' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
}
