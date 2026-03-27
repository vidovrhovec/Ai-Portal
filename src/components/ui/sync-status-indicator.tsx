import React from 'react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface SyncStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  className = '',
  showDetails = false,
}) => {
  const { syncStatus, isLoading, error, triggerSync } = useOfflineSync();

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (!syncStatus.is_online) return 'text-yellow-500';
    if (syncStatus.pending_operations > 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (error) return <AlertTriangle className="w-4 h-4" />;
    if (!syncStatus.is_online) return <WifiOff className="w-4 h-4" />;
    if (isLoading || syncStatus.sync_progress > 0) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (error) return 'Sync Error';
    if (!syncStatus.is_online) return 'Offline';
    if (syncStatus.pending_operations > 0) return `Syncing (${syncStatus.pending_operations})`;
    if (syncStatus.conflicts.length > 0) return `Conflicts (${syncStatus.conflicts.length})`;
    return 'Synced';
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {syncStatus.pending_operations > 0 && (
        <button
          onClick={triggerSync}
          disabled={isLoading}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
        >
          Sync Now
        </button>
      )}

      {showDetails && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Last sync: {formatLastSync(syncStatus.last_sync)}</div>
          {syncStatus.pending_operations > 0 && (
            <div>Pending: {syncStatus.pending_operations} operations</div>
          )}
          {syncStatus.conflicts.length > 0 && (
            <div className="text-yellow-600">
              Conflicts: {syncStatus.conflicts.length} items
            </div>
          )}
          {syncStatus.sync_progress > 0 && syncStatus.sync_progress < 1 && (
            <div>
              Progress: {Math.round(syncStatus.sync_progress * 100)}%
            </div>
          )}
          {error && (
            <div className="text-red-600 max-w-xs truncate" title={error}>
              Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;