'use client';

import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { formatMoney } from '@/lib/finance';
import { type CategoryChartData } from '@/types/reports';

export function ExpensesByCategory({ chartData }: { chartData: CategoryChartData[] }) {
  return <Card>
    <CardHeader><CardTitle>Where your money goes</CardTitle><CardDescription>Expenses by category · EUR</CardDescription></CardHeader>
    <CardContent>
      {chartData.length === 0 ? <Empty className="min-h-[240px]"><EmptyHeader><EmptyTitle>No expenses yet</EmptyTitle><EmptyDescription>Once you record an expense, see which categories account for your spending.</EmptyDescription></EmptyHeader></Empty> : <>
        <ChartContainer config={{ sum: { label: 'Spent' } }} className="mx-auto h-[200px] w-full max-w-[280px] aspect-auto">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => <div className="flex w-full justify-between gap-6"><span>{name}</span><strong className="money">{formatMoney(String(value))}</strong></div>} />} />
            <Pie isAnimationActive={false} data={chartData} dataKey="sum" nameKey="category" innerRadius={58} outerRadius={85} paddingAngle={2} strokeWidth={0} />
          </PieChart>
        </ChartContainer>
        <ul aria-label="Category spending" className="flex max-h-64 flex-col gap-3 overflow-y-auto pt-2">
          {chartData.map((item) => <li key={item.categoryId ?? 'uncategorized'} className="flex min-w-0 items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2.5"><span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} /><span className="truncate" title={item.category}>{item.category}</span></span>
            <span className="money shrink-0 font-semibold">{formatMoney(item.sum)}</span>
          </li>)}
        </ul>
      </>}
    </CardContent>
  </Card>;
}
