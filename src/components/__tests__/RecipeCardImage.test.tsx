import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RecipeCardImage } from '../RecipeCardImage';
import { PhotoService } from '../../lib/recipe/photo.service';

// Mock PhotoService
vi.mock('../../lib/recipe/photo.service');

// Mock logger
vi.mock('../../lib/logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('RecipeCardImage', () => {
  const mockRecipeId = 'recipe-123';
  const mockAlt = 'Test Recipe';
  
  const mockPhotos = [
    {
      id: 'photo-1',
      recipe_id: mockRecipeId,
      file_name: 'primary.jpg',
      storage_path: 'path/to/primary.jpg',
      url: 'https://example.com/primary.jpg',
      is_primary: true,
      is_ai_generated: false,
      created_by: 'user-1',
      created_at: '2025-03-01T00:00:00Z',
      updated_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'photo-2',
      recipe_id: mockRecipeId,
      file_name: 'secondary.jpg',
      storage_path: 'path/to/secondary.jpg',
      url: 'https://example.com/secondary.jpg',
      is_primary: false,
      is_ai_generated: true,
      created_by: 'user-1',
      created_at: '2025-03-01T00:00:00Z',
      updated_at: '2025-03-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (PhotoService.getPhotosByRecipeId as any).mockImplementation(() => new Promise(() => {}));
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    expect(screen.getByTestId('recipe-image-loading')).toBeInTheDocument();
  });

  it('displays primary photo when available', async () => {
    (PhotoService.getPhotosByRecipeId as any).mockResolvedValue(mockPhotos);
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    await waitFor(() => {
      const img = screen.getByTestId('recipe-image');
      expect(img).toHaveAttribute('src', mockPhotos[0].url);
      expect(img).toHaveAttribute('alt', mockAlt);
    });
  });

  it('shows AI generated badge when applicable', async () => {
    // Use non-primary AI generated photo
    (PhotoService.getPhotosByRecipeId as any).mockResolvedValue([mockPhotos[1]]);
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('ai-generated-badge')).toBeInTheDocument();
    });
  });

  it('shows placeholder when no photos are available', async () => {
    (PhotoService.getPhotosByRecipeId as any).mockResolvedValue([]);
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-image-placeholder')).toBeInTheDocument();
    });
  });

  it('shows error state when photo loading fails', async () => {
    (PhotoService.getPhotosByRecipeId as any).mockRejectedValue(new Error('Failed to load'));
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('recipe-image-error')).toBeInTheDocument();
    });
  });

  it('applies custom className', async () => {
    (PhotoService.getPhotosByRecipeId as any).mockResolvedValue(mockPhotos);
    
    render(
      <RecipeCardImage 
        recipeId={mockRecipeId} 
        alt={mockAlt} 
        className="custom-class" 
      />
    );
    
    await waitFor(() => {
      const container = screen.getByTestId('recipe-image').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  it('uses lazy loading for images', async () => {
    (PhotoService.getPhotosByRecipeId as any).mockResolvedValue(mockPhotos);
    
    render(<RecipeCardImage recipeId={mockRecipeId} alt={mockAlt} />);
    
    await waitFor(() => {
      const img = screen.getByTestId('recipe-image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});