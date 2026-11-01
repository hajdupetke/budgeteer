'use client';

import { useFormStatus } from 'react-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoSignInButton({ fullWidth, variant }: { fullWidth: boolean; variant: 'default' | 'outline' }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} size={variant === 'default' ? 'lg' : 'default'} disabled={pending} className={fullWidth ? 'w-full' : undefined}>
    <Eye data-icon="inline-start" aria-hidden="true" />
    {pending ? 'Opening preview…' : 'Try read-only demo'}
  </Button>;
}
