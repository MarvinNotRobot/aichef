import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostProfitIndicatorBar } from '../CostProfitIndicatorBar';
import type { CostProfitData } from '../types';

describe('CostProfitIndicatorBar', () => {
  const mockData: CostProfitData = {
    totalCost: 21.03,
    grossProfitPercentage: 32.5,
    price: 27.50
  };

  it('renders with default props', () => {
    render(<CostProfitIndicatorBar data={mockData} />);
    
    expect(screen.getByTestId('cost-profit-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('cost-section')).toBeInTheDocument();
    expect(screen.getByTestId('profit-section')).toBeInTheDocument();
  });

  it('displays formatted values when showValues is true', () => {
    render(<CostProfitIndicatorBar data={mockData} showValues={true} />);
    
    expect(screen.getByText('$21.03')).toBeInTheDocument();
    expect(screen.getByText('32.5%')).toBeInTheDocument();
  });

  it('hides values when showValues is false', () => {
    render(<CostProfitIndicatorBar data={mockData} showValues={false} />);
    
    expect(screen.queryByText('$21.03')).not.toBeInTheDocument();
    expect(screen.queryByText('32.5%')).not.toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<CostProfitIndicatorBar data={mockData} height={40} />);
    
    const indicator = screen.getByTestId('cost-profit-indicator');
    expect(indicator).toHaveStyle({ height: '40px' });
  });

  it('applies custom className', () => {
    render(<CostProfitIndicatorBar data={mockData} className="custom-class" />);
    
    expect(screen.getByTestId('cost-profit-indicator')).toHaveClass('custom-class');
  });

  it('handles edge cases with zero values', () => {
    const zeroData: CostProfitData = {
      totalCost: 0,
      grossProfitPercentage: 0,
      price: 0
    };

    render(<CostProfitIndicatorBar data={zeroData} />);
    
    const costSection = screen.getByTestId('cost-section');
    const profitSection = screen.getByTestId('profit-section');
    
    expect(costSection).toHaveStyle({ width: '0%' });
    expect(profitSection).toHaveStyle({ width: '0%' });
  });

  it('handles values exceeding 100%', () => {
    const extremeData: CostProfitData = {
      totalCost: 200,
      grossProfitPercentage: 150,
      price: 100
    };

    render(<CostProfitIndicatorBar data={extremeData} />);
    
    const costSection = screen.getByTestId('cost-section');
    const profitSection = screen.getByTestId('profit-section');
    
    expect(costSection).toHaveStyle({ width: '100%' });
    expect(profitSection).toHaveStyle({ width: '100%' });
  });
});