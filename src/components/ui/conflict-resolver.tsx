import React, { useState, useEffect } from 'react';
import { useOfflineSync, SyncItem, ConflictResolution } from '../../hooks/useOfflineSync';
import { AlertTriangle, CheckCircle, XCircle, Merge, ArrowLeft, ArrowRight } from 'lucide-react';

interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  isOpen,
  onClose,
}) => {
  const { getConflicts, resolveConflict, syncStatus } = useOfflineSync();
  const [conflicts, setConflicts] = useState<SyncItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConflicts();
    }
  }, [isOpen]);

  const loadConflicts = async () => {
    try {
      const conflictItems = await getConflicts();
      setConflicts(conflictItems);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const handleResolve = async (strategy: ConflictResolution['strategy']) => {
    if (conflicts.length === 0) return;

    setIsLoading(true);
    try {
      const currentConflict = conflicts[currentIndex];
      await resolveConflict({
        item_id: currentConflict.id,
        strategy,
      });

      // Move to next conflict or close if done
      if (currentIndex < conflicts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatData = (data: Record<string, unknown>) => {
    return JSON.stringify(data, null, 2);
  };

  if (!isOpen || conflicts.length === 0) {
    return null;
  }

  const currentConflict = conflicts[currentIndex];
  const progress = ((currentIndex + 1) / conflicts.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-red-800">
                Resolve Sync Conflicts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-red-600">
              <span>Conflict {currentIndex + 1} of {conflicts.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2 mt-1">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              {currentConflict.entity_type} - {currentConflict.operation}
            </h3>
            <p className="text-sm text-gray-600">
              Entity ID: {currentConflict.entity_id}
            </p>
            <p className="text-sm text-gray-600">
              Last modified: {new Date(currentConflict.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Conflict Resolution Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Wins */}
              <div className="border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowLeft className="w-4 h-4 text-blue-500" />
                  <h4 className="font-medium text-blue-800">Keep Local Changes</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Use your local version and discard server changes.
                </p>
                <button
                  onClick={() => handleResolve('client_wins')}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Use Local
                </button>
              </div>

              {/* Server Wins */}
              <div className="border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-green-500" />
                  <h4 className="font-medium text-green-800">Use Server Version</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Accept server changes and overwrite local data.
                </p>
                <button
                  onClick={() => handleResolve('server_wins')}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Use Server
                </button>
              </div>
            </div>

            {/* Last Write Wins */}
            <div className="border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <h4 className="font-medium text-purple-800">Last Write Wins</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automatically choose the most recently modified version.
              </p>
              <button
                onClick={() => handleResolve('last_write_wins')}
                disabled={isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Auto Resolve
              </button>
            </div>

            {/* Manual Merge (placeholder for future implementation) */}
            <div className="border border-gray-200 rounded-lg p-4 opacity-50">
              <div className="flex items-center space-x-2 mb-2">
                <Merge className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-800">Manual Merge</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Manually combine changes from both versions.
              </p>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
              >
                Manual Merge
              </button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Data Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-700">
                {formatData(currentConflict.data)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {conflicts.length}
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(conflicts.length - 1, currentIndex + 1))}
              disabled={currentIndex === conflicts.length - 1}
              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolver;