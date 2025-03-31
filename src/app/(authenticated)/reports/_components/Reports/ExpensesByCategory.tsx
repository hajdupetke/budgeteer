'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ReportTransactions } from '@/types/transaction';
import { CategoryChartData } from '@/types/reports';

const data = [
  { category: 'Food', sum: -123.24 },
  { category: 'Traveling', sum: -2.38 },
];

export function ExpensesByCategory({
  transactions,
  startDate,
  endDate,
  chartData,
}: {
  transactions: ReportTransactions[];
  startDate: string;
  endDate: string;
  chartData: CategoryChartData[];
}) {
  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.category.toLowerCase().replace(/\s+/g, '_')] = {
      label: item.category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by category</CardTitle>
        <CardDescription>
          {startDate} - {endDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={data} dataKey="sum" nameKey="category" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
