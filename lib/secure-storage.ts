/**
 * Secure Storage Utilities
 * Provides encrypted localStorage with additional security measures
 */

// Simple encryption/decryption using Web Crypto API
class SecureStorage {
  private static instance: SecureStorage;
  private key: CryptoKey | null = null;
  private readonly keyName = 'qr-app-encryption-key';

  private constructor() {}

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Initialize encryption key
   */
  private async initializeKey(): Promise<void> {
    try {
      // Check if crypto API is available
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('SecureStorage: Web Crypto API not available, falling back to basic storage');
        return;
      }

      // Try to load existing key from IndexedDB
      const existingKey = await this.loadKeyFromIndexedDB();
      if (existingKey) {
        this.key = existingKey;
        return;
      }

      // Generate new key
      this.key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      // Store key in IndexedDB
      await this.saveKeyToIndexedDB(this.key);
    } catch (error) {
      console.warn('SecureStorage: Failed to initialize encryption key:', error);
      this.key = null;
    }
  }

  /**
   * Load encryption key from IndexedDB
   */
  private async loadKeyFromIndexedDB(): Promise<CryptoKey | null> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('qr-app-secure-storage', 1);
        
        request.onerror = () => {
          console.warn('SecureStorage: Failed to open IndexedDB');
          resolve(null);
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['keys'], 'readonly');
          const store = transaction.objectStore('keys');
          const getRequest = store.get(this.keyName);

          getRequest.onsuccess = async () => {
            if (getRequest.result && getRequest.result.keyData) {
              try {
                const key = await window.crypto.subtle.importKey(
                  'jwk',
                  getRequest.result.keyData,
                  { name: 'AES-GCM' },
                  true,
                  ['encrypt', 'decrypt']
                );
                resolve(key);
              } catch (error) {
                console.warn('SecureStorage: Failed to import key:', error);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };

          getRequest.onerror = () => {
            console.warn('SecureStorage: Failed to retrieve key from IndexedDB');
            resolve(null);
          };
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('keys')) {
            db.createObjectStore('keys');
          }
        };
      } catch (error) {
        console.warn('SecureStorage: IndexedDB not available:', error);
        resolve(null);
      }
    });
  }

  /**
   * Save encryption key to IndexedDB
   */
  private async saveKeyToIndexedDB(key: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('qr-app-secure-storage', 1);
        
        request.onerror = () => {
          console.warn('SecureStorage: Failed to open IndexedDB for saving key');
          resolve(); // Don't fail completely
        };

        request.onsuccess = async (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            const keyData = await window.crypto.subtle.exportKey('jwk', key);
            
            const transaction = db.transaction(['keys'], 'readwrite');
            const store = transaction.objectStore('keys');
            store.put({ keyData }, this.keyName);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => {
              console.warn('SecureStorage: Failed to save key to IndexedDB');
              resolve(); // Don't fail completely
            };
          } catch (error) {
            console.warn('SecureStorage: Failed to export/save key:', error);
            resolve(); // Don't fail completely
          }
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('keys')) {
            db.createObjectStore('keys');
          }
        };
      } catch (error) {
        console.warn('SecureStorage: IndexedDB not available for saving key:', error);
        resolve(); // Don't fail completely
      }
    });
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<string | null> {
    try {
      if (!this.key || !window.crypto || !window.crypto.subtle) {
        return data; // Fallback to unencrypted storage
      }

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.key,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      // Convert to base64
      return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
      console.warn('SecureStorage: Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string | null> {
    try {
      if (!this.key || !window.crypto || !window.crypto.subtle) {
        return encryptedData; // Assume it's unencrypted
      }

      // Convert from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.warn('SecureStorage: Decryption failed, data may be unencrypted:', error);
      return encryptedData; // Assume it's unencrypted legacy data
    }
  }

  /**
   * Securely store data in localStorage
   */
  public async setItem(key: string, value: any): Promise<boolean> {
    try {
      // Ensure key is initialized
      if (!this.key) {
        await this.initializeKey();
      }

      // Sanitize the key
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      if (sanitizedKey !== key) {
        console.warn('SecureStorage: Key was sanitized:', key, '->', sanitizedKey);
      }

      // Serialize and encrypt the value
      const serialized = JSON.stringify(value);
      
      // Add timestamp and integrity check
      const dataWithMetadata = {
        data: serialized,
        timestamp: Date.now(),
        checksum: await this.calculateChecksum(serialized)
      };

      const encrypted = await this.encrypt(JSON.stringify(dataWithMetadata));
      
      if (encrypted === null) {
        console.warn('SecureStorage: Failed to encrypt data for key:', sanitizedKey);
        return false;
      }

      localStorage.setItem(`secure_${sanitizedKey}`, encrypted);
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to store data:', error);
      return false;
    }
  }

  /**
   * Securely retrieve data from localStorage
   */
  public async getItem(key: string): Promise<any | null> {
    try {
      // Ensure key is initialized
      if (!this.key) {
        await this.initializeKey();
      }

      // Sanitize the key
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      
      const encrypted = localStorage.getItem(`secure_${sanitizedKey}`);
      if (!encrypted) {
        return null;
      }

      const decrypted = await this.decrypt(encrypted);
      if (!decrypted) {
        console.warn('SecureStorage: Failed to decrypt data for key:', sanitizedKey);
        return null;
      }

      // Parse metadata and verify integrity
      const dataWithMetadata = JSON.parse(decrypted);
      
      if (!dataWithMetadata.data || !dataWithMetadata.checksum) {
        // Legacy data without metadata
        return JSON.parse(decrypted);
      }

      // Verify checksum
      const calculatedChecksum = await this.calculateChecksum(dataWithMetadata.data);
      if (calculatedChecksum !== dataWithMetadata.checksum) {
        console.warn('SecureStorage: Data integrity check failed for key:', sanitizedKey);
        return null;
      }

      return JSON.parse(dataWithMetadata.data);
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  public removeItem(key: string): void {
    try {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      localStorage.removeItem(`secure_${sanitizedKey}`);
    } catch (error) {
      console.error('SecureStorage: Failed to remove item:', error);
    }
  }

  /**
   * Clear all secure storage data
   */
  public clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('secure_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('SecureStorage: Failed to clear storage:', error);
    }
  }

  /**
   * Calculate checksum for data integrity
   */
  private async calculateChecksum(data: string): Promise<string> {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback to simple hash
        return btoa(data).slice(0, 16);
      }

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch (error) {
      console.warn('SecureStorage: Checksum calculation failed:', error);
      return btoa(data).slice(0, 16);
    }
  }

  /**
   * Get storage statistics
   */
  public getStorageInfo(): { itemCount: number; estimatedSize: number } {
    try {
      let itemCount = 0;
      let estimatedSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('secure_')) {
          itemCount++;
          const value = localStorage.getItem(key);
          if (value) {
            estimatedSize += key.length + value.length;
          }
        }
      }

      return { itemCount, estimatedSize };
    } catch (error) {
      console.error('SecureStorage: Failed to get storage info:', error);
      return { itemCount: 0, estimatedSize: 0 };
    }
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Compatibility wrapper for easy migration
export class LegacyStorageUtils {
  /**
   * Migrate existing localStorage data to secure storage
   */
  public static async migrateToSecureStorage(oldKeys: string[]): Promise<void> {
    try {
      for (const key of oldKeys) {
        const oldValue = localStorage.getItem(key);
        if (oldValue) {
          try {
            const parsedValue = JSON.parse(oldValue);
            await secureStorage.setItem(key, parsedValue);
            localStorage.removeItem(key); // Remove old unencrypted data
            console.log(`Migrated ${key} to secure storage`);
          } catch (error) {
            console.warn(`Failed to migrate ${key}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Migration to secure storage failed:', error);
    }
  }

  /**
   * Check if migration is needed
   */
  public static needsMigration(keysToCheck: string[]): string[] {
    try {
      const keysNeedingMigration: string[] = [];
      
      for (const key of keysToCheck) {
        if (localStorage.getItem(key) && !localStorage.getItem(`secure_${key}`)) {
          keysNeedingMigration.push(key);
        }
      }
      
      return keysNeedingMigration;
    } catch (error) {
      console.error('Migration check failed:', error);
      return [];
    }
  }
}