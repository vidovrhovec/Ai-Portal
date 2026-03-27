'use client';

import { useEffect, useState } from 'react';

export function SenseiAvatar() {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsThinking(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-8"
      role="img"
      aria-label="AI Learning Sensei avatar - animated AI mentor"
    >
      {/* Floating animation container */}
      <div className="absolute inset-0 animate-bounce" style={{ animationDuration: '3s' }}>
        {/* Main avatar circle */}
        <div className="relative w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-2xl border-4 border-white/20">
          {/* AI brain pattern overlay */}
          <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full">
            {/* Neural network pattern */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <pattern id="neural" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)" />
                  <line x1="10" y1="10" x2="20" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                  <line x1="10" y1="10" x2="0" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#neural)" />
            </svg>
          </div>

          {/* Eyes */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-4">
              <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${isThinking ? 'animate-pulse' : ''}`} />
              <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${isThinking ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          {/* Thinking particles */}
          {isThinking && (
            <div className="absolute -top-2 -right-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
          )}
        </div>
      </div>

      {/* Floating particles around avatar */}
      <div className="absolute -top-4 -left-4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute -bottom-4 -right-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 -right-6 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}