import React from 'react';
import { Bar, Cell, LabelList } from 'recharts';
import { BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface BarChartData {
  name: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  className?: string;
  showValues?: boolean;
  showAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  height = 300,
  className = '',
  showValues = true,
  showAxis = true,
  showGrid = true,
  showTooltip = true,
  valueFormatter = (value) => value.toFixed(2)
}: BarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded border border-gray-200">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {valueFormatter(data.value)}
          </p>
        </div>
      );
    }
    return null;
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
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {showAxis && (
            <>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
              />
            </>
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Bar
            dataKey="value"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
              />
            ))}
            {showValues && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={valueFormatter}
                style={{ fontSize: '12px' }}
              />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}