import { Progress } from '@/components/ui/progress';
import { formatMoney } from '@/lib/finance';
import { type BudgetSpending } from '@/types/budget';
import { CircleAlert, Check } from 'lucide-react';

export function BudgetProgress({ budget }: { budget: BudgetSpending }) {
  const over = Number(budget.overBudget) > 0;
  return <div className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <p className="money min-w-0 break-all font-bold">{formatMoney(budget.spent)} <span className="font-normal text-muted-foreground">spent</span></p>
      <p className="money min-w-0 break-all text-right text-muted-foreground">of {formatMoney(budget.limit)}</p>
    </div>
    <Progress value={budget.percent} aria-label={`Budget used: ${Math.round(budget.percent)}%`} data-over={over} />
    <p className={over ? 'flex items-center gap-1.5 text-sm text-destructive' : 'flex items-center gap-1.5 text-sm text-muted-foreground'}>
      {over ? <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" /> : <Check className="size-3.5 shrink-0" aria-hidden="true" />}
      <span className="money">{formatMoney(over ? budget.overBudget : budget.remaining)} {over ? 'over budget' : 'remaining'}</span>
    </p>
  </div>;
}
