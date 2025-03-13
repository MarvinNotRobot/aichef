import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PieChart } from '../PieChart';
import type { PieChartData } from '../PieChart';

describe('PieChart', () => {
  const mockData: PieChartData[] = [
    { name: 'Food Cost', value: 10, color: '#DC2626' },
    { name: 'Material Cost', value: 5, color: '#2563EB' },
    { name: 'Overhead Cost', value: 3, color: '#D946EF' }
  ];

  it('renders with default props', () => {
    render(<PieChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows no data message when data is empty', () => {
    render(<PieChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<PieChart data={mockData} height={400} />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveStyle({ height: '400px' });
  });

  it('applies custom className', () => {
    render(<PieChart data={mockData} className="custom-class" />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('uses custom value formatter', () => {
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    render(<PieChart data={mockData} valueFormatter={formatter} />);
    // Check for legend items
    mockData.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });
});