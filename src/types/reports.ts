export type CategoryChartConfig = {
  category: {
    label: string;
  };
} & {
  [key: string]: {
    label?: string;
    color?: string;
  };
};

export type CategoryChartData = {
  category: string;
  sum: number;
  //fill: string;
};
