import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChart } from '../BarChart';
import type { BarChartData } from '../BarChart';

describe('BarChart', () => {
  const mockData: BarChartData[] = [
    { name: 'Food Cost', value: 10, color: '#DC2626' },
    { name: 'Material Cost', value: 5, color: '#2563EB' },
    { name: 'Overhead Cost', value: 3, color: '#D946EF' }
  ];

  it('renders with default props', () => {
    render(<BarChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows no data message when data is empty', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<BarChart data={mockData} height={400} />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveStyle({ height: '400px' });
  });

  it('applies custom className', () => {
    render(<BarChart data={mockData} className="custom-class" />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('uses custom value formatter', () => {
    const formatter = (value: number) => `$${value.toFixed(2)}`;
    render(<BarChart data={mockData} valueFormatter={formatter} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});