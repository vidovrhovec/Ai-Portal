'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Monitor,
  Database,
  Zap
} from 'lucide-react';

interface OfflineModeProps {
  className?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface CacheItem {
  url: string;
  size: number;
  type: 'page' | 'asset' | 'data';
  lastAccessed: Date;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  cacheSize: number;
}

export function OfflineMode({ className = '' }: OfflineModeProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
    cacheSize: 0
  });
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  // Simulate cache data
  useEffect(() => {
    const mockCacheItems: CacheItem[] = [
      { url: '/dashboard', size: 245760, type: 'page', lastAccessed: new Date() },
      { url: '/materials', size: 189440, type: 'page', lastAccessed: new Date(Date.now() - 3600000) },
      { url: '/quizzes', size: 156780, type: 'page', lastAccessed: new Date(Date.now() - 7200000) },
      { url: '/api/courses', size: 51200, type: 'data', lastAccessed: new Date() },
      { url: '/api/materials', size: 76800, type: 'data', lastAccessed: new Date(Date.now() - 1800000) },
      { url: '/_next/static/css/app.css', size: 45632, type: 'asset', lastAccessed: new Date() },
      { url: '/_next/static/js/app.js', size: 234567, type: 'asset', lastAccessed: new Date() },
    ];

    setCacheItems(mockCacheItems);
    setSyncStatus(prev => ({
      ...prev,
      cacheSize: mockCacheItems.reduce((total, item) => total + item.size, 0)
    }));
  }, []);

  // Install PWA
  const installPWA = async () => {
    if (!installPrompt) return;

    setIsInstalling(true);
    try {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      setInstallPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Sync data
  const syncData = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges: 0
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    setCacheItems([]);
    setSyncStatus(prev => ({ ...prev, cacheSize: 0 }));
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get cache type color
  const getCacheTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'asset': return 'bg-green-100 text-green-800';
      case 'data': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCacheSize = cacheItems.reduce((total, item) => total + item.size, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-6 w-6 text-green-600" />
          ) : (
            <WifiOff className="h-6 w-6 text-red-600" />
          )}
          <h2 className="text-2xl font-bold">Offline Mode</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {syncStatus.lastSync && (
            <span className="text-sm text-gray-500">
              Last sync: {syncStatus.lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <div className="font-medium">
                  {isOnline ? 'Connected' : 'Offline'}
                </div>
                <div className="text-sm text-gray-600">
                  {isOnline ? 'All features available' : 'Limited functionality'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium">Cache Size</div>
                <div className="text-sm text-gray-600">
                  {formatFileSize(totalCacheSize)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshCw className={`h-8 w-8 ${isSyncing ? 'text-blue-600 animate-spin' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Sync Status</div>
                <div className="text-sm text-gray-600">
                  {syncStatus.pendingChanges > 0
                    ? `${syncStatus.pendingChanges} changes pending`
                    : 'All synced'
                  }
                </div>
              </div>
            </div>
          </div>

          {!isOnline && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">You&apos;re offline</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You can continue using cached content and data. Changes will sync when you&apos;re back online.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Installation */}
      {showInstallPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Install AI Learning Portal</p>
                <p className="text-sm text-gray-600">
                  Get the full offline experience with app installation
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  Later
                </Button>
                <Button
                  onClick={installPWA}
                  disabled={isInstalling}
                  className="gap-2"
                >
                  {isInstalling ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Install
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Management
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Cache
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total cached: {formatFileSize(totalCacheSize)}
              </span>
              <span className="text-sm text-gray-600">
                {cacheItems.length} items
              </span>
            </div>

            <div className="space-y-2">
              {cacheItems.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.url}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getCacheTypeColor(item.type)}`}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(item.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.lastAccessed.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>

            {cacheItems.length > 5 && (
              <div className="text-center">
                <Button variant="ghost" size="sm">
                  View all {cacheItems.length} items
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={syncData}
              disabled={!isOnline || isSyncing}
              className="gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>

            <Button
              variant="outline"
              disabled={!isOnline}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Sync to Desktop
            </Button>
          </div>

          {syncStatus.pendingChanges > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {syncStatus.pendingChanges} changes waiting to sync
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Available Offline</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  View cached materials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Take saved quizzes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Access study planner
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  View progress reports
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Requires Connection</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-600" />
                  Submit quiz answers
                </li>
                <li className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-600" />
                  Download new materials
                </li>
                <li className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-600" />
                  Real-time chat
                </li>
                <li className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-red-600" />
                  Sync progress
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}