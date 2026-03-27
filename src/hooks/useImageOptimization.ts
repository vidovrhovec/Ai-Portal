import { useState, useCallback } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

interface OptimizedImageResult {
  url: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
}

export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeImage = useCallback(async (
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult | null> => {
    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/images/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize image');
      }

      // Get optimization metadata from headers
      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
      const optimizedSize = parseInt(response.headers.get('X-Optimized-Size') || '0');
      const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio')?.replace('%', '') || '0');
      const originalWidth = parseInt(response.headers.get('X-Original-Width') || '0');
      const originalHeight = parseInt(response.headers.get('X-Original-Height') || '0');
      const optimizedWidth = parseInt(response.headers.get('X-Optimized-Width') || '0');
      const optimizedHeight = parseInt(response.headers.get('X-Optimized-Height') || '0');

      // Convert response to blob URL
      const blob = await response.blob();
      const optimizedUrl = URL.createObjectURL(blob);

      return {
        url: optimizedUrl,
        originalSize,
        optimizedSize,
        compressionRatio,
        originalWidth,
        originalHeight,
        optimizedWidth,
        optimizedHeight,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    optimizeImage,
    isOptimizing,
    error,
    clearError,
  };
}

// Utility function for batch image optimization
export async function optimizeImagesBatch(
  imageUrls: string[],
  options: ImageOptimizationOptions = {}
): Promise<(OptimizedImageResult | null)[]> {
  const promises = imageUrls.map(url => {
    return fetch('/api/images/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        ...options,
      }),
    }).then(async (response) => {
      if (!response.ok) return null;

      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
      const optimizedSize = parseInt(response.headers.get('X-Optimized-Size') || '0');
      const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio')?.replace('%', '') || '0');
      const originalWidth = parseInt(response.headers.get('X-Original-Width') || '0');
      const originalHeight = parseInt(response.headers.get('X-Original-Height') || '0');
      const optimizedWidth = parseInt(response.headers.get('X-Optimized-Width') || '0');
      const optimizedHeight = parseInt(response.headers.get('X-Optimized-Height') || '0');

      const blob = await response.blob();
      const optimizedUrl = URL.createObjectURL(blob);

      return {
        url: optimizedUrl,
        originalSize,
        optimizedSize,
        compressionRatio,
        originalWidth,
        originalHeight,
        optimizedWidth,
        optimizedHeight,
      };
    }).catch(() => null);
  });

  return Promise.all(promises);
}