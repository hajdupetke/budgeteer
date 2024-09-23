import { auth } from '@/lib/auth';
import Image from 'next/image';
import { CircleUserIcon } from 'lucide-react';

const Profile = async () => {
  const session = await auth();

  return (
    <div className="flex items-center justify-evenly my-8">
      {session?.user?.image ? (
        <img
          src={session?.user?.image as string}
          alt={`${session?.user?.name}'s avatar`}
          className="h-8 w-8 rounded-full border"
        />
      ) : (
        <CircleUserIcon stroke="#65009c" />
      )}
      <span className="font-bold">{session?.user?.name}</span>
    </div>
  );
};

export default Profile;
