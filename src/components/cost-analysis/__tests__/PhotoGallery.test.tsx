import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGallery } from '../PhotoGallery';
import type { RecipePhoto } from '../../../types';

describe('PhotoGallery', () => {
  const mockPhotos: RecipePhoto[] = [
    {
      id: 'photo-1',
      recipe_id: 'recipe-1',
      file_name: 'pasta.jpg',
      storage_path: 'recipes/recipe-1/pasta.jpg',
      url: 'https://example.com/pasta.jpg',
      is_primary: true,
      is_ai_generated: false,
      created_by: 'user-1',
      created_at: '2025-03-01T00:00:00Z',
      updated_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'photo-2',
      recipe_id: 'recipe-1',
      file_name: 'pasta-side.jpg',
      storage_path: 'recipes/recipe-1/pasta-side.jpg',
      url: 'https://example.com/pasta-side.jpg',
      is_primary: false,
      is_ai_generated: true,
      created_by: 'user-1',
      created_at: '2025-03-01T00:00:00Z',
      updated_at: '2025-03-01T00:00:00Z'
    }
  ];

  const mockHandlers = {
    onDelete: vi.fn(),
    onSetPrimary: vi.fn()
  };

  it('renders loading state correctly', () => {
    render(<PhotoGallery photos={[]} isLoading={true} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders empty state when no photos are available', () => {
    render(<PhotoGallery photos={[]} isLoading={false} />);
    
    expect(screen.getByText('No photos available for this recipe.')).toBeInTheDocument();
  });

  it('renders photos correctly', () => {
    render(<PhotoGallery photos={mockPhotos} isLoading={false} />);
    
    // Check that the first photo is displayed as selected by default
    const selectedPhoto = screen.getByTestId('selected-photo');
    expect(selectedPhoto).toHaveAttribute('src', mockPhotos[0].url);
    
    // Check that both thumbnails are rendered
    expect(screen.getByTestId(`photo-thumbnail-${mockPhotos[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`)).toBeInTheDocument();
    
    // Check that the primary badge is shown
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('changes selected photo when thumbnail is clicked', () => {
    render(<PhotoGallery photos={mockPhotos} isLoading={false} />);
    
    // Initially the first photo should be selected
    expect(screen.getByTestId('selected-photo')).toHaveAttribute('src', mockPhotos[0].url);
    
    // Click the second thumbnail
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Now the second photo should be selected
    expect(screen.getByTestId('selected-photo')).toHaveAttribute('src', mockPhotos[1].url);
    
    // AI Generated badge should be visible
    expect(screen.getByText('AI Generated')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <PhotoGallery 
        photos={mockPhotos} 
        isLoading={false} 
        onDelete={mockHandlers.onDelete}
        onSetPrimary={mockHandlers.onSetPrimary}
      />
    );
    
    // Click the second thumbnail to select it
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-photo-button'));
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockPhotos[1].id);
  });

  it('calls onSetPrimary when set as primary button is clicked', () => {
    render(
      <PhotoGallery 
        photos={mockPhotos} 
        isLoading={false} 
        onDelete={mockHandlers.onDelete}
        onSetPrimary={mockHandlers.onSetPrimary}
      />
    );
    
    // Click the second thumbnail to select it (which is not primary)
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Click the set as primary button
    fireEvent.click(screen.getByTestId('set-primary-button'));
    
    expect(mockHandlers.onSetPrimary).toHaveBeenCalledWith(mockPhotos[1].id);
  });

  it('does not show set as primary button for already primary photo', () => {
    render(
      <PhotoGallery 
        photos={mockPhotos} 
        isLoading={false} 
        onDelete={mockHandlers.onDelete}
        onSetPrimary={mockHandlers.onSetPrimary}
      />
    );
    
    // The first photo is already primary, so the button should not be visible
    expect(screen.queryByTestId('set-primary-button')).not.toBeInTheDocument();
  });

  it('does not show action buttons when handlers are not provided', () => {
    render(<PhotoGallery photos={mockPhotos} isLoading={false} />);
    
    // Click the second thumbnail to select it
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Neither button should be visible
    expect(screen.queryByTestId('delete-photo-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('set-primary-button')).not.toBeInTheDocument();
  });
});