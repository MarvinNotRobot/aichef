import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeHeader } from '../RecipeHeader';

describe('RecipeHeader', () => {
  it('renders with title', () => {
    render(<RecipeHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with subtitle when provided', () => {
    render(<RecipeHeader title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<RecipeHeader title="Test Title" />);
    const subtitleElements = screen.queryAllByText(/subtitle/i);
    expect(subtitleElements).toHaveLength(0);
  });

  it('applies correct styling classes', () => {
    render(<RecipeHeader title="Test Title" />);
    expect(screen.getByRole('img')).toHaveClass('w-full', 'h-full', 'object-cover');
    expect(screen.getByText('Test Title')).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl', 'font-bold');
  });
});