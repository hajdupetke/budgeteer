'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { formatMoney } from '@/lib/finance';

const chartConfig = {
  totalIncome: { label: 'Income', color: 'var(--positive)' },
  totalExpense: { label: 'Expenses', color: 'var(--primary)' },
};
const axisMoney = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 });
const periodLabel = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function IncomeExpenseChart({ chartData }: { chartData: { period: string | undefined; totalIncome: number | undefined; totalExpense: number | undefined }[] }) {
  return <Card>
    <CardHeader><CardTitle>Income & expenses</CardTitle><CardDescription>Weekly totals · EUR</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-5">
      {chartData.length === 0 ? <Empty className="min-h-[240px]"><EmptyHeader><EmptyTitle>No activity in this period</EmptyTitle><EmptyDescription>Your income and expenses will appear here after you add a transaction.</EmptyDescription></EmptyHeader></Empty> : <>
        <div className="flex gap-5 text-xs text-muted-foreground" aria-label="Chart legend">
          <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-positive" />Income</span>
          <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-primary" />Expenses</span>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={periodLabel} tickLine={false} axisLine={false} minTickGap={20} tickMargin={10} />
            <YAxis tickFormatter={(value) => axisMoney.format(value)} tickLine={false} axisLine={false} width={55} tickMargin={8} />
            <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent labelFormatter={(label) => `Week of ${periodLabel(String(label))}`} formatter={(value, name) => <div className="flex w-full justify-between gap-6"><span>{name === 'totalIncome' ? 'Income' : 'Expenses'}</span><strong className="money">{formatMoney(String(value))}</strong></div>} />} />
            <Bar isAnimationActive={false} dataKey="totalIncome" fill="var(--color-totalIncome)" radius={[3, 3, 0, 0]} maxBarSize={32} />
            <Bar isAnimationActive={false} dataKey="totalExpense" fill="var(--color-totalExpense)" radius={[3, 3, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ChartContainer>
      </>}
    </CardContent>
  </Card>;
}
