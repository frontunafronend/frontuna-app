import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly ENCRYPTION_KEY = 'frontuna-secure-key-v1.0';
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;

  /**
   * Encrypt data using AES-GCM algorithm
   */
  async encrypt(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const key = await this.generateKey();
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        encoder.encode(data)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-GCM algorithm
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.generateKey();
      
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Securely store encrypted data in localStorage
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = await this.encrypt(value);
      localStorage.setItem(this.getSecureKey(key), encryptedValue);
    } catch (error) {
      console.error('Failed to store secure item:', error);
      throw new Error('Failed to store data securely');
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const encryptedValue = localStorage.getItem(this.getSecureKey(key));
      if (!encryptedValue) {
        return null;
      }
      return await this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      // If decryption fails, remove the corrupted data
      this.removeSecureItem(key);
      return null;
    }
  }

  /**
   * Remove encrypted data from localStorage
   */
  removeSecureItem(key: string): void {
    localStorage.removeItem(this.getSecureKey(key));
  }

  /**
   * Clear all secure items (for logout)
   */
  clearAllSecureItems(): void {
    const keys = Object.keys(localStorage);
    const securePrefix = this.getSecureKeyPrefix();
    
    keys.forEach(key => {
      if (key.startsWith(securePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageAvailable(): boolean {
    try {
      return typeof crypto !== 'undefined' && 
             typeof crypto.subtle !== 'undefined' &&
             typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Generate encryption key from password
   */
  private async generateKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('frontuna-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get prefixed key for secure storage
   */
  private getSecureKey(key: string): string {
    return `${this.getSecureKeyPrefix()}${key}`;
  }

  /**
   * Get secure key prefix
   */
  private getSecureKeyPrefix(): string {
    return 'frontuna_secure_';
  }

  /**
   * Encrypt and store user session data
   */
  async storeUserSession(userData: any): Promise<void> {
    try {
      const sessionData = {
        user: userData,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      await this.setSecureItem('user_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store user session:', error);
      throw new Error('Failed to store user session');
    }
  }

  /**
   * Retrieve and decrypt user session data
   */
  async getUserSession(): Promise<any | null> {
    try {
      const sessionData = await this.getSecureItem('user_session');
      if (!sessionData) {
        return null;
      }

      const parsed = JSON.parse(sessionData);
      
      // Check if session is not too old (optional: add expiration logic)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - parsed.timestamp > maxAge) {
        this.removeSecureItem('user_session');
        return null;
      }

      return parsed.user;
    } catch (error) {
      console.error('Failed to retrieve user session:', error);
      this.removeSecureItem('user_session');
      return null;
    }
  }

  /**
   * Clear user session
   */
  clearUserSession(): void {
    this.removeSecureItem('user_session');
  }
}