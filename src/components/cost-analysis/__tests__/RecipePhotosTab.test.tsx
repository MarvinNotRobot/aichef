import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipePhotosTab } from '../RecipePhotosTab';
import { PhotoService } from '../../../lib/recipe/photo.service';
import type { RecipePhoto } from '../../../types';

// Mock dependencies
vi.mock('../../../lib/recipe/photo.service');
vi.mock('../../../lib/logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock window.confirm
const originalConfirm = window.confirm;

describe('RecipePhotosTab', () => {
  const mockRecipeId = 'recipe-123';
  const mockRecipeName = 'Pasta Carbonara';
  
  const mockPhotos: RecipePhoto[] = [
    {
      id: 'photo-1',
      recipe_id: mockRecipeId,
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
      recipe_id: mockRecipeId,
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
    onPhotoUploaded: vi.fn(),
    onPhotoDeleted: vi.fn(),
    onPrimaryPhotoChanged: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('renders photos correctly', () => {
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
      />
    );
    
    // PhotoGallery should be rendered with the photos
    expect(screen.getByTestId('selected-photo')).toBeInTheDocument();
    
    // Upload controls should not be visible in non-editable mode
    expect(screen.queryByTestId('photo-upload-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('generate-ai-photo-button')).not.toBeInTheDocument();
  });

  it('renders upload controls in editable mode', () => {
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        editable={true}
      />
    );
    
    // Upload controls should be visible
    expect(screen.getByTestId('photo-upload-input')).toBeInTheDocument();
    expect(screen.getByTestId('generate-ai-photo-button')).toBeInTheDocument();
  });

  it('handles file upload correctly', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadedPhoto = { ...mockPhotos[0], id: 'new-photo-id' };
    
    (PhotoService.uploadPhoto as any).mockResolvedValue(mockUploadedPhoto);
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        onPhotoUploaded={mockHandlers.onPhotoUploaded}
        editable={true}
      />
    );
    
    // Simulate file upload
    const input = screen.getByTestId('photo-upload-input');
    Object.defineProperty(input, 'files', {
      value: [mockFile]
    });
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(PhotoService.uploadPhoto).toHaveBeenCalledWith(mockFile, mockRecipeId, false);
      expect(mockHandlers.onPhotoUploaded).toHaveBeenCalledWith(mockUploadedPhoto);
    });
  });

  it('handles AI photo generation correctly', async () => {
    const mockGeneratedPhoto = { ...mockPhotos[1], id: 'new-ai-photo-id' };
    
    (PhotoService.generateAIPhoto as any).mockResolvedValue(mockGeneratedPhoto);
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        onPhotoUploaded={mockHandlers.onPhotoUploaded}
        editable={true}
      />
    );
    
    // Click the generate AI photo button
    fireEvent.click(screen.getByTestId('generate-ai-photo-button'));
    
    await waitFor(() => {
      expect(PhotoService.generateAIPhoto).toHaveBeenCalledWith(mockRecipeName, mockRecipeId);
      expect(mockHandlers.onPhotoUploaded).toHaveBeenCalledWith(mockGeneratedPhoto);
    });
  });

  it('handles photo deletion correctly', async () => {
    (PhotoService.deletePhoto as any).mockResolvedValue(undefined);
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        onPhotoDeleted={mockHandlers.onPhotoDeleted}
        editable={true}
      />
    );
    
    // Click the second thumbnail to select it
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-photo-button'));
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(PhotoService.deletePhoto).toHaveBeenCalledWith(mockPhotos[1].id);
      expect(mockHandlers.onPhotoDeleted).toHaveBeenCalledWith(mockPhotos[1].id);
    });
  });

  it('handles setting primary photo correctly', async () => {
    (PhotoService.setPrimaryPhoto as any).mockResolvedValue(undefined);
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        onPrimaryPhotoChanged={mockHandlers.onPrimaryPhotoChanged}
        editable={true}
      />
    );
    
    // Click the second thumbnail to select it
    fireEvent.click(screen.getByTestId(`photo-thumbnail-${mockPhotos[1].id}`));
    
    // Click the set as primary button
    fireEvent.click(screen.getByTestId('set-primary-button'));
    
    await waitFor(() => {
      expect(PhotoService.setPrimaryPhoto).toHaveBeenCalledWith(mockPhotos[1].id, mockRecipeId);
      expect(mockHandlers.onPrimaryPhotoChanged).toHaveBeenCalledWith(mockPhotos[1].id);
    });
  });

  it('shows error message when upload fails', async () => {
    (PhotoService.uploadPhoto as any).mockRejectedValue(new Error('Upload failed'));
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={mockPhotos}
        isLoading={false}
        editable={true}
      />
    );
    
    // Simulate file upload
    const input = screen.getByTestId('photo-upload-input');
    Object.defineProperty(input, 'files', {
      value: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })]
    });
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('makes the first uploaded photo primary', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadedPhoto = { ...mockPhotos[0], id: 'new-photo-id' };
    
    (PhotoService.uploadPhoto as any).mockResolvedValue(mockUploadedPhoto);
    
    render(
      <RecipePhotosTab
        recipeId={mockRecipeId}
        recipeName={mockRecipeName}
        photos={[]} // Empty photos array
        isLoading={false}
        onPhotoUploaded={mockHandlers.onPhotoUploaded}
        editable={true}
      />
    );
    
    // Simulate file upload
    const input = screen.getByTestId('photo-upload-input');
    Object.defineProperty(input, 'files', {
      value: [mockFile]
    });
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(PhotoService.uploadPhoto).toHaveBeenCalledWith(mockFile, mockRecipeId, true);
    });
  });
});