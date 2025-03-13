import React, { useState, useRef } from 'react';
import { appLogger } from '../../lib/logger';

interface PhotoUploaderProps {
  onFileSelected: (file: File) => Promise<void>;
  disabled?: boolean;
  label?: string;
  accept?: string;
  className?: string;
}

export function PhotoUploader({
  onFileSelected,
  disabled = false,
  label = 'Upload Photo',
  accept = 'image/*',
  className = ''
}: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onFileSelected(file);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      setError(message);
      appLogger.error('File upload failed', { error: err });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}
      
      <label
        htmlFor="photo-upload"
        className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isUploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        ) : (
          <>{label}</>
        )}
      </label>
      <input
        id="photo-upload"
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        data-testid="file-input"
      />
    </div>
  );
}