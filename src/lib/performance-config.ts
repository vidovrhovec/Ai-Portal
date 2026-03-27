/**
 * Frontend Performance Configuration
 */

export const PERFORMANCE_CONFIG = {
  // Lazy Loading Thresholds (in milliseconds)
  lazy: {
    // Components larger than this will be lazy-loaded
    componentSizeThreshold: 5000, // 5KB
    // Delay before showing loading state
    loadingDelay: 200,
  },

  // Virtual Scrolling
  virtual: {
    // Number of items to render outside viewport
    overscan: 5,
    // Estimated item heights for common components
    itemHeights: {
      flashcard: 200,
      message: 80,
      course: 120,
      material: 100,
    },
    // Minimum number of items to enable virtualization
    minItemsForVirtualization: 20,
  },

  // Image Optimization
  images: {
    // Default quality for images (1-100)
    defaultQuality: 85,
    // Enable progressive loading
    progressive: true,
    // Image sizes for responsive images
    sizes: {
      avatar: {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96,
      },
      thumbnail: 300,
      medium: 600,
      large: 1200,
    },
    // Supported image formats
    formats: ['image/webp', 'image/jpeg', 'image/png'],
  },

  // Code Splitting
  codeSplitting: {
    // Enable route-based code splitting
    enabled: true,
    // Split components into separate chunks
    componentSplitting: true,
    // Bundle naming pattern
    namingPattern: '[name]-[hash]',
  },

  // Cache Strategy
  cache: {
    // Service Worker cache duration (in seconds)
    serviceWorkerDuration: 3600, // 1 hour
    // Static assets cache duration
    staticAssetsDuration: 86400, // 24 hours
    // API response cache duration
    apiCacheDuration: 300, // 5 minutes
  },

  // Prefetching Strategy
  prefetch: {
    // Prefetch on hover (milliseconds)
    hoverDelay: 200,
    // Prefetch on viewport intersection
    intersectionMargin: '100px',
    // Prefetch priority routes
    priorityRoutes: ['/dashboard/student', '/dashboard/teacher'],
  },

  // Animation Performance
  animation: {
    // Use CSS transforms instead of position
    useTransform: true,
    // Enable hardware acceleration
    hardwareAcceleration: true,
    // Reduce motion for accessibility
    reducedMotion: false,
    // Animation duration in milliseconds
    duration: 200,
  },
} as const;
