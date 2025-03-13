import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CostProfitIndicatorProps } from './types';

export const CostProfitIndicatorBar: React.FC<CostProfitIndicatorProps> = React.memo(({
  data,
  className = '',
  showValues = true,
  height = 32
}) => {
  const {
    costPercentage,
    costWidth,
    profitWidth,
    formattedPrice,
    formattedProfit,
    tooltipContent
  } = useMemo(() => {
    const { totalCost, price } = data;
    
    // Calculate cost percentage
    const costPercentage = ((totalCost / price) * 100) || 0;
    
    // Calculate profit percentage as remaining percentage
    const profitPercentage = Math.max(0, 100 - costPercentage);
    
    // Calculate widths based on percentages
    const costWidth = `${Math.min(100, Math.max(0, costPercentage))}%`;
    const profitWidth = `${Math.min(100, Math.max(0, profitPercentage))}%`;
    
    // Format display values
    const formattedPrice = formatCurrency(price);
    const formattedProfit = `${profitPercentage.toFixed(1)}%`;

    // Format tooltip content
    const tooltipContent = `Gross Profit: ${profitPercentage.toFixed(1)}%, Total Cost: ${formatCurrency(totalCost)}`;

    return {
      costPercentage,
      costWidth,
      profitWidth,
      formattedPrice,
      formattedProfit,
      tooltipContent
    };
  }, [data]);

  return (
    <div 
      className={`w-full overflow-hidden rounded ${className}`}
      style={{ height: `${height}px` }}
      data-testid="cost-profit-indicator"
    >
      <div className="flex h-full relative">
        {/* Price Display (Centered) */}
        {showValues && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="text-white font-bold text-lg px-3 py-1 bg-gray-800/50 rounded backdrop-blur-sm">
              {formattedPrice}
            </span>
          </div>
        )}

        {/* Profit Section (Gold) */}
        <div 
          className="bg-gradient-to-r from-amber-500 to-amber-600 flex-shrink-0 flex items-center relative group"
          style={{ 
            width: profitWidth,
            position: 'relative'
          }}
          data-testid="profit-section"
        >
          {/* Profit Watermark */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="text-amber-300/30 text-xl font-bold">
              P
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            {tooltipContent}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
          </div>

          {showValues && (
            <div className="pl-4 z-10">
              <span className="text-white font-medium text-sm">
                {formattedProfit}
              </span>
            </div>
          )}
        </div>

        {/* Cost Section (Modern Red) */}
        <div 
          className="bg-gradient-to-r from-rose-700 to-red-800 flex-shrink-0 flex items-center justify-center"
          style={{ 
            width: costWidth,
            position: 'relative'
          }}
          data-testid="cost-section"
        >
          {/* Cost Watermark */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="text-rose-500/30 text-xl font-bold">
              C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CostProfitIndicatorBar.displayName = 'CostProfitIndicatorBar';

/**
 * Formats a number as currency
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};