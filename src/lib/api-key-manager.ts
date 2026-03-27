import { kv } from '@vercel/kv';
import logger from './logger';
import { securityConfig } from './security-config';

// API key storage keys
const PRIMARY_KEY_KEY = 'openai:primary_key';
const BACKUP_KEY_KEY = 'openai:backup_key';
const CURRENT_KEY_KEY = 'openai:current_key';
const LAST_ROTATION_KEY = 'openai:last_rotation';

// Rotation interval (24 hours)
const ROTATION_INTERVAL = securityConfig.apiKeyRotation.interval;

/**
 * API Key Manager for OpenAI key rotation
 */
export class APIKeyManager {
  private primaryKey: string;
  private backupKey?: string | null;

  constructor(primaryKey: string, backupKey?: string | null) {
    this.primaryKey = primaryKey;
    this.backupKey = backupKey || null;
  }

  /**
   * Get the current active API key
   */
  async getCurrentKey(): Promise<string> {
    try {
      // Skip KV operations if not configured (development environment)
      const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

      if (kvConfigured) {
        // Try to read keys from KV if available (admin UI may have stored them)
        try {
          const storedPrimary = (await kv.get(PRIMARY_KEY_KEY)) as string | null;
          const storedBackup = (await kv.get(BACKUP_KEY_KEY)) as string | null;
          const storedCurrent = (await kv.get(CURRENT_KEY_KEY)) as string | null;

          if (storedPrimary) {
            this.primaryKey = storedPrimary;
          }
          if (storedBackup) {
            this.backupKey = storedBackup;
          }
          if (storedCurrent) {
            return storedCurrent;
          }
        } catch (_kvErr) {
          // KV might not be configured in some environments; ignore KV errors and continue
        }

        // Check if we need to rotate keys
        await this.checkAndRotateKeys();

        // Get current key from storage (after potential rotation)
        try {
          const currentKey = (await kv.get(CURRENT_KEY_KEY)) as string | null;
          if (currentKey) {
            return currentKey;
          }
        } catch (_kvErr) {
          // ignore
        }

        // If no current key in KV, but we have a primary key in memory/env, use it
        if (this.primaryKey && this.primaryKey.length > 0) {
          // Ensure KV is initialized if possible
          try {
            await this.initializeKeys();
          } catch (_e) {
            // ignore
          }
          return this.primaryKey;
        }
      } else {
        // KV not configured, use environment variables directly
        if (this.primaryKey && this.primaryKey.length > 0) {
          return this.primaryKey;
        }
      }

      // No key available
      throw new Error('No API key configured');
    } catch (error) {
      logger.error('Failed to get current API key', { error });
      // Bubble error to caller to decide fallback behavior
      throw error;
    }
  }

  /**
   * Initialize API keys in storage
   */
  private async initializeKeys(): Promise<void> {
    const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
    if (!kvConfigured) return;

    await kv.set(PRIMARY_KEY_KEY, this.primaryKey);
    if (this.backupKey) await kv.set(BACKUP_KEY_KEY, this.backupKey);
    await kv.set(CURRENT_KEY_KEY, this.primaryKey);
    await kv.set(LAST_ROTATION_KEY, Date.now().toString());

    logger.info('API keys initialized');
  }

  /**
   * Check if keys need rotation and perform rotation if necessary
   */
  private async checkAndRotateKeys(): Promise<void> {
    try {
      // Skip if KV not configured or no backup key is provided
      const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
      if (!kvConfigured || !this.backupKey) return;

      const lastRotation = await kv.get(LAST_ROTATION_KEY) as string;
      const lastRotationTime = lastRotation ? parseInt(lastRotation) : 0;
      const now = Date.now();

      if (now - lastRotationTime > ROTATION_INTERVAL) {
        await this.rotateKeys();
      }
    } catch (error) {
      logger.error('Failed to check key rotation', { error });
    }
  }

  /**
   * Rotate between primary and backup keys
   */
  private async rotateKeys(): Promise<void> {
    try {
      // Skip if KV not configured or rotation is disabled (no backup key)
      const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
      if (!kvConfigured || !this.backupKey) return;

      const currentKey = await kv.get(CURRENT_KEY_KEY) as string;
      const primaryKey = await kv.get(PRIMARY_KEY_KEY) as string;
      const backupKey = await kv.get(BACKUP_KEY_KEY) as string;

      // Determine next key
      const nextKey = currentKey === primaryKey ? backupKey : primaryKey;

      // Update current key
      await kv.set(CURRENT_KEY_KEY, nextKey);
      await kv.set(LAST_ROTATION_KEY, Date.now().toString());

      logger.info('API key rotated successfully', {
        fromKey: currentKey === primaryKey ? 'primary' : 'backup',
        toKey: nextKey === primaryKey ? 'primary' : 'backup'
      });
    } catch (error) {
      logger.error('Failed to rotate API keys', { error });
      throw error;
    }
  }

  /**
   * Force immediate key rotation (for manual rotation or emergency)
   */
  async forceRotate(): Promise<void> {
    await this.rotateKeys();
  }

  /**
   * Get key health status
   */
  async getKeyStatus(): Promise<{
    current: 'primary' | 'backup';
    lastRotation: number;
    nextRotation: number;
  }> {
    const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

    if (kvConfigured) {
      const currentKey = await kv.get(CURRENT_KEY_KEY) as string;
      const primaryKey = await kv.get(PRIMARY_KEY_KEY) as string;
      const lastRotation = await kv.get(LAST_ROTATION_KEY) as string;

      const lastRotationTime = lastRotation ? parseInt(lastRotation) : Date.now();
      const nextRotationTime = lastRotationTime + ROTATION_INTERVAL;

      return {
        current: currentKey === primaryKey ? 'primary' : 'backup',
        lastRotation: lastRotationTime,
        nextRotation: nextRotationTime,
      };
    } else {
      // KV not configured, return default status
      return {
        current: 'primary',
        lastRotation: Date.now(),
        nextRotation: Date.now() + ROTATION_INTERVAL,
      };
    }
  }

  /**
   * Update API keys (for key refresh)
   */
  async updateKeys(newPrimaryKey: string, newBackupKey: string): Promise<void> {
    // Validate keys are different
    if (newBackupKey && newPrimaryKey === newBackupKey) {
      throw new Error('Primary and backup keys must be different');
    }

    const kvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

    if (kvConfigured) {
      await kv.set(PRIMARY_KEY_KEY, newPrimaryKey);
      if (newBackupKey) await kv.set(BACKUP_KEY_KEY, newBackupKey);

      // Reset to primary key
      await kv.set(CURRENT_KEY_KEY, newPrimaryKey);
      await kv.set(LAST_ROTATION_KEY, Date.now().toString());
    }

    // Update in-memory keys regardless of KV status
    this.primaryKey = newPrimaryKey;
    this.backupKey = newBackupKey || null;

    logger.info('API keys updated successfully');
  }
}

// Create singleton instance
let apiKeyManager: APIKeyManager | null = null;

export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManager) {
    // Use environment variables initially; KV will be consulted inside APIKeyManager.getCurrentKey()
    const primaryKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
    const backupKey = process.env.OPENAI_BACKUP_API_KEY || process.env.AI_BACKUP_API_KEY || null;

    apiKeyManager = new APIKeyManager(primaryKey, backupKey);
  }

  return apiKeyManager;
}