'use client';
import { formatMoney } from '@/lib/finance';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  totalIncome: {
    label: 'Income',
  },
  totalExpense: {
    label: 'Expense',
  },
} satisfies ChartConfig;

export function IncomeExpenseChart({
  chartData,
}: {
  chartData: {
    period: string | undefined;
    totalIncome: number | undefined;
    totalExpense: number | undefined;
  }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Income vs. Expenses period</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? <p>No data for this period.</p> : <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { timeZone: 'UTC' })} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(label) => new Date(String(label)).toLocaleDateString('en-GB', { timeZone: 'UTC' })} formatter={(value, name) => <><span>{name === 'totalIncome' ? 'Income' : 'Expenses'}</span><span>{formatMoney(String(value))}</span></>} />} />
            <Line
              dataKey="totalIncome"
              type="monotone"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="totalExpense"
              type="monotone"
              stroke="var(--color-primary-300)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>}
      </CardContent>
    </Card>
  );
}
