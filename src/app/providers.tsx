'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';

// Import desktop layout directly
import { DesktopLayout } from '../components/desktop-layout';

// Tauri window interface
interface TauriWindow {
  __TAURI__?: unknown;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Check if we're running in Tauri (client-side only)
  // The injected script should set window.__TAURI__ before React loads
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  // Debug logging
  useEffect(() => {
    console.log('🚀 Providers component mounted');
    console.log('🖥️ isTauri:', isTauri);
    console.log('🌐 window.__TAURI__:', typeof window !== 'undefined' ? (window as TauriWindow).__TAURI__ : 'window not defined');
    console.log('📱 User Agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'no window');

    if (isTauri) {
      console.log('✅ Desktop mode detected - DesktopLayout should be active');
    } else {
      console.log('🌍 Web mode - standard layout');
    }
  }, [isTauri]);

  const content = (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );

  // Show desktop layout only when running in Tauri
  if (isTauri) {
    return (
      <DesktopLayout>
        {content}
      </DesktopLayout>
    );
  }

  return content;
}
