import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return <div role="status" aria-label="Loading your finances" className="flex flex-col gap-8">
    <div className="flex flex-col gap-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 max-w-full" /></div>
    <Skeleton className="h-40 w-full rounded-xl" />
    <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-72 w-full rounded-xl" /><Skeleton className="h-72 w-full rounded-xl" /></div>
  </div>;
}
