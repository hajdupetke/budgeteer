import { buttonVariants } from '@/components/ui/button';

const TransactionList = () => {
  return (
    <div className="h-full w-full rounded-xl p-4 bg-secondary shadow-around">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-3xl">Transactions</h2>
        <a
          href={'/categories/new'}
          className={`${buttonVariants({
            variant: 'default',
            size: 'xl',
          })} !bg-accent !rounded-3xl !hover:bg-[#7c00bf]`}
        >
          Add new transaction
        </a>
      </div>
    </div>
  );
};

export default TransactionList;
