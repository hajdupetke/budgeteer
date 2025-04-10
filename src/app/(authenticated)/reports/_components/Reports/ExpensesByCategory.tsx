'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ReportTransactions } from '@/types/transaction';
import { CategoryChartData } from '@/types/reports';

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
  let chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.category.toLowerCase().replace(/\s+/g, '_')] = {
      label: item.category,
    };
    return acc;
  }, {} as Record<string, { label: string }>);

  chartConfig = {
    category: {
      label: 'lajos',
    },
    ...chartConfig,
  };

  console.log(chartData);

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
            <Pie data={chartData} dataKey="sum" nameKey="category" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
