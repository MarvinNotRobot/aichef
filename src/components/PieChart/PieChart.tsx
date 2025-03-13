import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  className?: string;
  showValues?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
  customDefs?: React.ReactNode;
}

export function PieChart({
  data,
  height = 300,
  className = '',
  showValues = true,
  showLegend = true,
  showTooltip = true,
  valueFormatter = (value) => value.toFixed(2),
  customDefs
}: PieChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {valueFormatter(data.value)} ({(data.percent * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

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

  if (data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          {customDefs}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showValues ? renderCustomizedLabel : undefined}
            outerRadius={height * 0.4}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}