import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeHeader } from '../RecipeHeader';

describe('RecipeHeader', () => {
  it('renders with correct category', () => {
    render(<RecipeHeader category="Lunch" />);
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Recipe Cost Analysis')).toBeInTheDocument();
  });

  it('uses correct image for Breakfast category', () => {
    render(<RecipeHeader category="Breakfast" />);
    const img = screen.getByAltText('Breakfast Recipe') as HTMLImageElement;
    expect(img.src).toContain('photo-1533089860892');
  });

  it('uses correct image for Lunch category', () => {
    render(<RecipeHeader category="Lunch" />);
    const img = screen.getByAltText('Lunch Recipe') as HTMLImageElement;
    expect(img.src).toContain('photo-1546069901');
  });

  it('uses correct image for Dinner category', () => {
    render(<RecipeHeader category="Dinner" />);
    const img = screen.getByAltText('Dinner Recipe') as HTMLImageElement;
    expect(img.src).toContain('photo-1559847844');
  });

  it('uses correct image for Dessert category', () => {
    render(<RecipeHeader category="Dessert" />);
    const img = screen.getByAltText('Dessert Recipe') as HTMLImageElement;
    expect(img.src).toContain('photo-1488477181946');
  });

  it('uses default image for unknown category', () => {
    render(<RecipeHeader category="Unknown" />);
    const img = screen.getByAltText('Unknown Recipe') as HTMLImageElement;
    expect(img.src).toContain('photo-1495195134817');
  });

  it('uses custom image when provided', () => {
    const customImageUrl = 'https://example.com/custom-image.jpg';
    render(<RecipeHeader category="Lunch" customImageUrl={customImageUrl} />);
    const img = screen.getByAltText('Lunch Recipe') as HTMLImageElement;
    expect(img.src).toBe(customImageUrl);
  });

  it('applies correct styling classes', () => {
    render(<RecipeHeader category="Lunch" />);
    expect(screen.getByRole('img')).toHaveClass('w-full', 'h-full', 'object-cover');
    expect(screen.getByText('Recipe Cost Analysis')).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl', 'font-bold');
  });
});