/**
 * IndexedDB Manager for TOTP Accounts
 * Stores and manages TOTP accounts in browser's IndexedDB
 */

class TOTPIndexedDB {
  constructor(dbName = 'FinTrackTOTP', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.storeName = 'accounts';
  }

  /**
   * Initialize database
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: '_id' });
          
          // Create indexes for faster queries
          objectStore.createIndex('userId', 'userId', { unique: false });
          objectStore.createIndex('serviceName', 'serviceName', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          
          console.log('Object store created successfully');
        }
      };
    });
  }

  /**
   * Get all accounts
   * @returns {Promise<Array>}
   */
  async getAllAccounts() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error getting accounts:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get account by ID
   * @param {string} accountId
   * @returns {Promise<object|null>}
   */
  async getAccount(accountId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(accountId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error getting account:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Save or update account
   * @param {object} account
   * @returns {Promise<string>}
   */
  async saveAccount(account) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(account);

      request.onsuccess = () => {
        console.log('Account saved successfully:', account._id);
        resolve(account._id);
      };

      request.onerror = () => {
        console.error('Error saving account:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Save multiple accounts (batch operation)
   * @param {Array} accounts
   * @returns {Promise<number>}
   */
  async saveAccounts(accounts) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      let count = 0;
      
      accounts.forEach(account => {
        const request = objectStore.put(account);
        request.onsuccess = () => {
          count++;
          if (count === accounts.length) {
            console.log(`${count} accounts saved successfully`);
            resolve(count);
          }
        };
      });

      transaction.onerror = () => {
        console.error('Error saving accounts:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Delete account by ID
   * @param {string} accountId
   * @returns {Promise<void>}
   */
  async deleteAccount(accountId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(accountId);

      request.onsuccess = () => {
        console.log('Account deleted successfully:', accountId);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting account:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all accounts
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('All accounts cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing accounts:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sync with server - fetch all accounts and save to IndexedDB
   * @param {Array} serverAccounts
   * @returns {Promise<void>}
   */
  async syncWithServer(serverAccounts) {
    await this.init();
    
    // Clear existing data
    await this.clearAll();
    
    // Save new data
    if (serverAccounts && serverAccounts.length > 0) {
      await this.saveAccounts(serverAccounts);
    }
    
    console.log('Sync with server completed');
  }

  /**
   * Get database statistics
   * @returns {Promise<object>}
   */
  async getStats() {
    const accounts = await this.getAllAccounts();
    
    return {
      totalAccounts: accounts.length,
      dbName: this.dbName,
      version: this.version,
      storeName: this.storeName
    };
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('IndexedDB connection closed');
    }
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.TOTPIndexedDB = TOTPIndexedDB;
}
