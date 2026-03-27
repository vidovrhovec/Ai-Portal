'use client';

import React, { useEffect, useState } from 'react';

// Tauri window interface
interface TauriWindow {
  __TAURI__?: {
    invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
}

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const [tauriStatus, setTauriStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Test Tauri integration
    const checkTauriStatus = async () => {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        try {
          // Try to call a simple Tauri command to test IPC
          const tauriWindow = (window as TauriWindow);
          if (tauriWindow.__TAURI__) {
            const result = await tauriWindow.__TAURI__.invoke('check_ai_availability');
            console.log('✅ Tauri IPC working:', result);
            setTauriStatus('Tauri Connected ✅');
          } else {
            setTauriStatus('Tauri Not Available ❌');
          }
        } catch (error) {
          console.log('❌ Tauri IPC error:', error);
          setTauriStatus('Tauri Error ❌');
        }
      } else {
        setTauriStatus('Web Mode 🌐');
      }
    };

    checkTauriStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Title Bar */}
      <div className="bg-primary text-primary-foreground border-b border-border px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">
            🖥️ AI Learning Portal - Desktop Mode
          </h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2 text-sm">
          <span className={`px-2 py-1 rounded text-xs ${
            tauriStatus.includes('✅') ? 'bg-green-500 text-white' :
            tauriStatus.includes('❌') ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {tauriStatus}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DesktopLayout;