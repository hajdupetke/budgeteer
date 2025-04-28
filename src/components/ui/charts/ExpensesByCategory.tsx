'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CategoryChartData } from '@/types/reports';

export function ExpensesByCategory({
  chartData,
}: {
  chartData: CategoryChartData[];
}) {
  let chartConfig = chartData.reduce((acc, item) => {
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

  return (
    <Card className="flex flex-col size-full py-4">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by category</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[275px]"
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
