import { auth } from '@/lib/auth';
import Image from 'next/image';
import { CircleUserIcon } from 'lucide-react';

const Profile = async () => {
  const session = await auth();

  return (
    <div className="flex items-center gap-4 my-8 px-2">
      {session?.user?.image ? (
        <Image
          src={session?.user?.image as string}
          alt={`${session?.user?.name}'s avatar`}
          width={100}
          height={100}
          className="h-10 w-10 rounded-full border"
        />
      ) : (
        <CircleUserIcon stroke="#65009c" />
      )}
      <span className="font-bold">{session?.user?.name}</span>
    </div>
  );
};

export default Profile;
