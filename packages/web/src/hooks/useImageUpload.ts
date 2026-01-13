import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface UseImageUploadResult {
  uploadImage: (file: File) => Promise<string>;
  isUploading: boolean;
  error: string | null;
  uploadedUrl: string | null;
}

export function useImageUpload(): UseImageUploadResult {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      const url = data.data.url;
      setUploadedUrl(url);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, error, uploadedUrl };
}
