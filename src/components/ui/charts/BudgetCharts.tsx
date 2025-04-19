'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  max: {
    label: 'Max',
  },
  amount: {
    label: 'Current',
  },
} satisfies ChartConfig;

export function BudgetCharts({
  chartData,
}: {
  chartData: { name: string; max: number; amount: number }[];
}) {
  return (
    <Card className="size-full py-4">
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            barCategoryGap={8}
            data={chartData}
            layout="vertical"
            stackOffset="none"
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid horizontal strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={90} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />

            <Bar
              dataKey="amount"
              stackId="a"
              fill="var(--color-primary-700)"
              radius={0}
            />
            <Bar
              dataKey="max"
              stackId="a"
              fill="var(--color-primary-200)"
              radius={0}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
