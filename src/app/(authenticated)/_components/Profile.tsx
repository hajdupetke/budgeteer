import { auth } from '@/lib/auth';
import Image from 'next/image';
import { CircleUserRound } from 'lucide-react';

export default async function Profile() {
  const session = await auth();
  return (
    <div className="flex min-w-0 items-center gap-3 border-t pt-5">
      {session?.user?.image ? <Image src={session.user.image} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full" />
        : <CircleUserRound className="size-9 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold" title={session?.user?.name ?? undefined}>{session?.user?.name ?? 'Your account'}</p>
        <p className="text-xs text-muted-foreground">Personal workspace</p>
      </div>
    </div>
  );
}
