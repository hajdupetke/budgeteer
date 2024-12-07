import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const TransactionList = () => {
  return (
    <div className="w-full rounded-xl md:py-2">
      <div className="flex items-center gap-2 md:justify-between">
        <h2 className="font-bold text-3xl">Transactions</h2>
        <a
          href={'/transactions'}
          className={`${buttonVariants({
            variant: 'default',
            size: 'xl',
          })}}  !bg-primary-600 !w-10 !h-10 !p-0 !mr-4 !rounded-3xl hover:!bg-primary-800`}
        >
          <Plus />
        </a>
      </div>
      <div className='w-full p-4 bg-gray-50 shadow-gray-300 drop-shadow-md rounded-xl my-5'>
      </div>
    </div>
  );
};

export default TransactionList;
