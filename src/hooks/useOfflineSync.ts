import { useState, useEffect, useCallback } from 'react';

// Type for Tauri invoke function
type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

// Helper function to get Tauri invoke
const getTauriInvoke = async (): Promise<TauriInvoke | null> => {
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke as TauriInvoke;
    } catch {
      return null;
    }
  }
  return null;
};

export interface SyncItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  version: number;
  user_id: string;
}

export interface SyncStatus {
  is_online: boolean;
  last_sync: string | null;
  pending_operations: number;
  conflicts: string[];
  sync_progress: number;
}

export interface ConflictResolution {
  item_id: string;
  strategy: 'client_wins' | 'server_wins' | 'manual_merge' | 'last_write_wins';
  resolved_data?: Record<string, unknown>;
}

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    is_online: true,
    last_sync: null,
    pending_operations: 0,
    conflicts: [],
    sync_progress: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        const status = await invoke('get_sync_status') as SyncStatus;
        setSyncStatus(status);
      } else {
        // HTTP fallback - sync status not available in web mode
        setSyncStatus(prev => ({ ...prev, is_online: navigator.onLine }));
      }
    } catch (err) {
      setError(err as string);
    }
  }, []);

  // Queue a sync operation
  const queueOperation = useCallback(async (
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    data: Record<string, unknown>,
    userId: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      const itemId = await invoke('queue_sync_operation', {
        operation,
        entityType,
        entityId,
        data,
        userId,
      }) as string;
      await fetchSyncStatus(); // Refresh status
      return itemId;
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Get pending operations
  const getPendingOperations = useCallback(async (): Promise<SyncItem[]> => {
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      return await invoke('get_pending_operations') as SyncItem[];
    } catch (err) {
      setError(err as string);
      throw err;
    }
  }, []);

  // Mark operation as synced
  const markOperationSynced = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      await invoke('mark_operation_synced', { itemId });
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Detect conflicts
  const detectConflicts = useCallback(async (serverItems: SyncItem[]): Promise<string[]> => {
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      return await invoke('detect_conflicts', { serverItems }) as string[];
    } catch (err) {
      setError(err as string);
      throw err;
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (resolution: ConflictResolution) => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      await invoke('resolve_conflict', {
        itemId: resolution.item_id,
        strategy: resolution.strategy,
        resolvedData: resolution.resolved_data,
      });
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Set online status
  const setOnlineStatus = useCallback(async (isOnline: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('set_online_status', { isOnline });
      }
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      await invoke('trigger_sync');
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Get conflicts
  const getConflicts = useCallback(async (): Promise<SyncItem[]> => {
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      return await invoke('get_conflicts') as SyncItem[];
    } catch (err) {
      setError(err as string);
      throw err;
    }
  }, []);

  // Retry failed operations
  const retryFailedOperations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      await invoke('retry_failed_operations');
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Clear old operations
  const clearOldOperations = useCallback(async (days: number): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      const removedCount = await invoke('clear_old_operations', { days }) as number;
      await fetchSyncStatus();
      return removedCount;
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Export sync data
  const exportSyncData = useCallback(async (): Promise<Record<string, unknown>> => {
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      return await invoke('export_sync_data') as Record<string, unknown>;
    } catch (err) {
      setError(err as string);
      throw err;
    }
  }, []);

  // Import sync data
  const importSyncData = useCallback(async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const invoke = await getTauriInvoke();
      if (!invoke) {
        throw new Error('Sync operations only available in desktop app');
      }
      await invoke('import_sync_data', { data });
      await fetchSyncStatus();
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSyncStatus]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status fetch
    fetchSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, fetchSyncStatus]);

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncStatus.is_online && syncStatus.pending_operations > 0) {
        triggerSync().catch(console.error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [syncStatus.is_online, syncStatus.pending_operations, triggerSync]);

  return {
    syncStatus,
    isLoading,
    error,
    queueOperation,
    getPendingOperations,
    markOperationSynced,
    detectConflicts,
    resolveConflict,
    setOnlineStatus,
    triggerSync,
    getConflicts,
    retryFailedOperations,
    clearOldOperations,
    exportSyncData,
    importSyncData,
    refreshStatus: fetchSyncStatus,
  };
};