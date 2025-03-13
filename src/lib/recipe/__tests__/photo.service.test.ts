import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhotoService } from '../photo.service';
import { StorageService } from '../../storage/storage.service';
import { supabase } from '../../supabase/client';
import type { RecipePhoto } from '../../../types';

// Mock dependencies
vi.mock('../../storage/storage.service');
vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn()
    })
  }
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock FormData
global.FormData = class {
  private data: Map<string, any> = new Map();
  append(key: string, value: any) {
    this.data.set(key, value);
  }
  get(key: string) {
    return this.data.get(key);
  }
};

// Mock logger
vi.mock('../../logger', () => ({
  appLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('PhotoService', () => {
  const mockUser = { id: 'user-123' };
  const mockRecipeId = 'recipe-123';
  const mockPhotoId = 'photo-123';
  const mockSession = {
    access_token: 'test-token',
    user: mockUser
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadResponse = {
        path: 'photos/test.jpg',
        url: 'https://example.com/photos/test.jpg',
        size: mockFile.size,
        type: mockFile.type,
        duration: 100
      };

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse)
      });

      // Mock database insert
      const mockPhotoRecord = {
        id: 'photo-1',
        recipe_id: mockRecipeId,
        file_name: 'test.jpg',
        storage_path: mockUploadResponse.path,
        is_primary: false,
        is_ai_generated: false,
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      (supabase.from().insert().select().single as any).mockResolvedValueOnce({
        data: mockPhotoRecord,
        error: null
      });

      const result = await PhotoService.uploadPhoto(mockFile, mockRecipeId);

      // Verify fetch call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/upload-photo'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockSession.access_token}`
          },
          body: expect.any(FormData)
        })
      );

      // Verify database insert
      expect(supabase.from).toHaveBeenCalledWith('recipe_photos');
      expect(supabase.from().insert).toHaveBeenCalledWith([
        expect.objectContaining({
          recipe_id: mockRecipeId,
          file_name: 'test.jpg',
          storage_path: mockUploadResponse.path,
          is_primary: false,
          is_ai_generated: false,
          created_by: mockUser.id
        })
      ]);

      // Verify result
      expect(result).toEqual({
        ...mockPhotoRecord,
        url: mockUploadResponse.url
      });
    });

    it('should handle upload failure', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      });

      await expect(PhotoService.uploadPhoto(mockFile, mockRecipeId))
        .rejects.toThrow('Upload failed');

      expect(supabase.from().insert).not.toHaveBeenCalled();
    });

    it('should handle missing auth session', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (supabase.auth.getSession as any).mockResolvedValueOnce({
        data: { session: null },
        error: null
      });

      await expect(PhotoService.uploadPhoto(mockFile, mockRecipeId))
        .rejects.toThrow('No active session');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(supabase.from().insert).not.toHaveBeenCalled();
    });

    it('should set primary photo when specified', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUploadResponse = {
        path: 'photos/test.jpg',
        url: 'https://example.com/photos/test.jpg',
        size: mockFile.size,
        type: mockFile.type,
        duration: 100
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUploadResponse)
      });

      // Mock clear primary photo
      (supabase.from().update().eq as any).mockResolvedValueOnce({
        error: null
      });

      // Mock insert new photo
      const mockPhotoRecord = {
        id: 'photo-1',
        recipe_id: mockRecipeId,
        file_name: 'test.jpg',
        storage_path: mockUploadResponse.path,
        is_primary: true,
        is_ai_generated: false,
        created_by: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      (supabase.from().insert().select().single as any).mockResolvedValueOnce({
        data: mockPhotoRecord,
        error: null
      });

      const result = await PhotoService.uploadPhoto(mockFile, mockRecipeId, true);

      // Verify primary photo was cleared
      expect(supabase.from().update).toHaveBeenCalledWith({ is_primary: false });
      
      // Verify new photo was set as primary
      expect(supabase.from().insert).toHaveBeenCalledWith([
        expect.objectContaining({
          is_primary: true
        })
      ]);

      expect(result.is_primary).toBe(true);
    });
  });

  describe('getPhotosByRecipeId', () => {
    it('should fetch and return photos with URLs', async () => {
      const mockPhotos = [
        {
          id: 'photo-1',
          recipe_id: mockRecipeId,
          file_name: 'photo1.jpg',
          storage_path: 'path/to/photo1.jpg',
          is_primary: true,
          is_ai_generated: false,
          created_by: mockUser.id,
          created_at: '2025-03-01T00:00:00Z',
          updated_at: '2025-03-01T00:00:00Z'
        },
        {
          id: 'photo-2',
          recipe_id: mockRecipeId,
          file_name: 'photo2.jpg',
          storage_path: 'path/to/photo2.jpg',
          is_primary: false,
          is_ai_generated: true,
          created_by: mockUser.id,
          created_at: '2025-03-01T00:00:00Z',
          updated_at: '2025-03-01T00:00:00Z'
        }
      ];

      // Mock Supabase query response
      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: mockPhotos,
        error: null
      });

      // Mock StorageService URL generation
      (StorageService.getPhotoUrl as any).mockImplementation(
        (path) => `https://example.com/${path}`
      );

      const result = await PhotoService.getPhotosByRecipeId(mockRecipeId);

      // Verify Supabase query
      expect(supabase.from).toHaveBeenCalledWith('recipe_photos');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().eq).toHaveBeenCalledWith('recipe_id', mockRecipeId);
      expect(supabase.from().select().eq().order).toHaveBeenCalledWith('is_primary', { ascending: false });
      expect(supabase.from().select().eq().order().order).toHaveBeenCalledWith('created_at', { ascending: false });

      // Verify StorageService usage
      expect(StorageService.getPhotoUrl).toHaveBeenCalledTimes(2);
      mockPhotos.forEach(photo => {
        expect(StorageService.getPhotoUrl).toHaveBeenCalledWith(photo.storage_path);
      });

      // Verify result structure
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockPhotos[0],
        url: `https://example.com/${mockPhotos[0].storage_path}`
      });
      expect(result[1]).toEqual({
        ...mockPhotos[1],
        url: `https://example.com/${mockPhotos[1].storage_path}`
      });
    });

    it('should handle empty result', async () => {
      // Mock empty response
      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: [],
        error: null
      });

      const result = await PhotoService.getPhotosByRecipeId(mockRecipeId);

      expect(result).toEqual([]);
      expect(StorageService.getPhotoUrl).not.toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      // Mock database error
      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      await expect(PhotoService.getPhotosByRecipeId(mockRecipeId))
        .rejects.toThrow('Database error');
    });

    it('should handle invalid recipe ID', async () => {
      await expect(PhotoService.getPhotosByRecipeId('')).rejects.toThrow();
      expect(supabase.from().select().eq).toHaveBeenCalledWith('recipe_id', '');
    });

    it('should maintain correct order of photos', async () => {
      const mockPhotos = [
        {
          id: 'photo-1',
          recipe_id: mockRecipeId,
          file_name: 'primary.jpg',
          storage_path: 'path/to/primary.jpg',
          is_primary: true,
          is_ai_generated: false,
          created_at: '2025-03-01T00:00:00Z'
        },
        {
          id: 'photo-2',
          recipe_id: mockRecipeId,
          file_name: 'newer.jpg',
          storage_path: 'path/to/newer.jpg',
          is_primary: false,
          is_ai_generated: false,
          created_at: '2025-03-02T00:00:00Z'
        },
        {
          id: 'photo-3',
          recipe_id: mockRecipeId,
          file_name: 'older.jpg',
          storage_path: 'path/to/older.jpg',
          is_primary: false,
          is_ai_generated: false,
          created_at: '2025-03-01T00:00:00Z'
        }
      ];

      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: mockPhotos,
        error: null
      });

      (StorageService.getPhotoUrl as any).mockImplementation(
        (path) => `https://example.com/${path}`
      );

      const result = await PhotoService.getPhotosByRecipeId(mockRecipeId);

      // Primary photo should be first
      expect(result[0].is_primary).toBe(true);
      expect(result[0].id).toBe('photo-1');

      // Non-primary photos should be ordered by creation date
      expect(result[1].id).toBe('photo-2'); // newer
      expect(result[2].id).toBe('photo-3'); // older
    });
  });

  describe('getRecipePhotos', () => {
    it('should fetch and return photos with URLs', async () => {
      const mockPhotos = [
        {
          id: 'photo-1',
          recipe_id: mockRecipeId,
          file_name: 'photo1.jpg',
          storage_path: 'path/to/photo1.jpg',
          is_primary: true,
          is_ai_generated: false,
          created_by: mockUser.id,
          created_at: '2025-03-01T00:00:00Z',
          updated_at: '2025-03-01T00:00:00Z'
        }
      ];

      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: mockPhotos,
        error: null
      });

      (StorageService.getPhotoUrl as any).mockImplementation(
        (path) => `https://example.com/${path}`
      );

      const result = await PhotoService.getRecipePhotos(mockRecipeId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockPhotos[0],
        url: `https://example.com/${mockPhotos[0].storage_path}`
      });
    });

    it('should handle database error', async () => {
      (supabase.from().select().eq().order().order() as any).mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      await expect(PhotoService.getRecipePhotos(mockRecipeId))
        .rejects.toThrow('Database error');
    });
  });
});