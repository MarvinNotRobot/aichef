import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CostSummary } from '../../types';

interface CostDistributionChartProps {
  costSummary: CostSummary;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function CostDistributionChart({ costSummary }: CostDistributionChartProps) {
  const chartData = useMemo(() => {
    const data: ChartData[] = [
      {
        name: 'Food Cost',
        value: costSummary.foodCost,
        color: '#DC2626' // red-600
      },
      {
        name: 'Material Cost',
        value: costSummary.materialCost,
        color: '#2563EB' // blue-600
      },
      {
        name: 'Overhead Cost',
        value: costSummary.overheadCost,
        color: '#D946EF' // fuchsia-500
      },
      {
        name: 'Gross Profit',
        value: costSummary.grossProfit,
        color: '#059669' // emerald-600
      }
    ];

    // Filter out zero values
    return data.filter(item => item.value > 0);
  }, [costSummary]);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    ) : null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toFixed(2)} ({((data.value / totalValue) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No cost data available</p>
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}