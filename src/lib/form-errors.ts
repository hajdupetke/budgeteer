import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export const applyFieldErrors = <T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string[]> | undefined,
  allowedFields: readonly Path<T>[]
) => {
  for (const field of allowedFields) {
    const message = fieldErrors?.[field]?.[0];
    if (message) setError(field, { type: 'server', message });
  }
};
