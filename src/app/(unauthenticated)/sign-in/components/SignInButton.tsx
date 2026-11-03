'use client';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

export default function SignInButton({ id, name }: { id: string; name: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="outline" disabled={pending} className="w-full">
    <Image src={`/static/images/sign-in-page/${id}-logo.svg`} width={20} height={20} alt="" />
    {pending ? 'Connecting…' : `Sign in with ${name}`}
  </Button>;
}
