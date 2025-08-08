// Cache for decrypted item data to avoid repeated signature requests
// This is a client-side, in-memory cache that persists during the session

import type { ItemData } from './decryption'

interface CacheEntry {
  itemId: string
  owner: string
  decryptedData: ItemData
  timestamp: number
}

class DecryptionCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly maxAge = 1000 * 60 * 60 // 1 hour cache validity
  private readonly maxEntries = 100 // Maximum number of cached items

  /**
   * Generate a cache key from owner address and item ID
   */
  private getCacheKey(owner: string, itemId: string): string {
    return `${owner.toLowerCase()}-${itemId.toLowerCase()}`
  }

  /**
   * Store decrypted data in cache
   */
  set(owner: string, itemId: string, decryptedData: ItemData): void {
    const key = this.getCacheKey(owner, itemId)
    
    // Implement LRU-like behavior: if cache is full, remove oldest entry
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      itemId,
      owner,
      decryptedData,
      timestamp: Date.now()
    })
  }

  /**
   * Retrieve decrypted data from cache if available and not expired
   */
  get(owner: string, itemId: string): ItemData | null {
    const key = this.getCacheKey(owner, itemId)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return entry.decryptedData
  }

  /**
   * Check if an item is in cache (without retrieving it)
   */
  has(owner: string, itemId: string): boolean {
    const key = this.getCacheKey(owner, itemId)
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear cache for a specific owner (useful when switching accounts)
   */
  clearForOwner(owner: string): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (entry.owner.toLowerCase() === owner.toLowerCase()) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get the oldest cache entry key for LRU eviction
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    })

    return oldestKey
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats(): { size: number; maxSize: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxEntries,
      maxAge: this.maxAge
    }
  }
}

// Create a singleton instance
export const decryptionCache = new DecryptionCache()

// Export for use in React components
export function useDecryptionCache() {
  return {
    getFromCache: (owner: string, itemId: string) => 
      decryptionCache.get(owner, itemId),
    
    saveToCache: (owner: string, itemId: string, data: ItemData) => 
      decryptionCache.set(owner, itemId, data),
    
    hasInCache: (owner: string, itemId: string) => 
      decryptionCache.has(owner, itemId),
    
    clearUserCache: (owner: string) => 
      decryptionCache.clearForOwner(owner),
    
    clearAllCache: () => 
      decryptionCache.clear(),
    
    getCacheStats: () => 
      decryptionCache.getStats()
  }
}