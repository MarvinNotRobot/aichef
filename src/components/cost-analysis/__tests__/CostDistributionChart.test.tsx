import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostDistributionChart } from '../CostDistributionChart';
import type { CostSummary } from '../../../types';

describe('CostDistributionChart', () => {
  const mockCostSummary: CostSummary = {
    foodCost: 10,
    materialCost: 5,
    materialCostPercentage: 10,
    overheadCost: 3,
    overheadCostPercentage: 6,
    totalCost: 18,
    grossProfit: 12,
    grossProfitPercentage: 40
  };

  it('renders with cost data', () => {
    render(<CostDistributionChart costSummary={mockCostSummary} />);
    expect(screen.getByText('Food Cost')).toBeInTheDocument();
    expect(screen.getByText('Material Cost')).toBeInTheDocument();
    expect(screen.getByText('Overhead Cost')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
  });

  it('shows no data message when all costs are zero', () => {
    const emptyCostSummary: CostSummary = {
      foodCost: 0,
      materialCost: 0,
      materialCostPercentage: 0,
      overheadCost: 0,
      overheadCostPercentage: 0,
      totalCost: 0,
      grossProfit: 0,
      grossProfitPercentage: 0
    };

    render(<CostDistributionChart costSummary={emptyCostSummary} />);
    expect(screen.getByText('No cost data available')).toBeInTheDocument();
  });
});