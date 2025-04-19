'use client';

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
  chartData: { period: string; totalIncome: number; totalExpense: number }[];
}) {
  console.log(chartData);
  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle>Income vs. Expenses period</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
