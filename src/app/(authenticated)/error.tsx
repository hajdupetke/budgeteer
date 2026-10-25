'use client';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <Alert variant="destructive"><AlertTitle>We couldn’t load this page</AlertTitle><AlertDescription className="flex flex-col items-start gap-4"><p>Check your connection and try again. Your saved transactions and budgets are unchanged.</p><Button variant="outline" onClick={reset}>Try again</Button></AlertDescription></Alert>;
}
