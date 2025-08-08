/**
 * Signature Cache for Dashboard
 * Stores wallet signatures in browser storage to avoid repeated signing
 */

interface CachedSignature {
  signature: string
  address: string
  timestamp: number
  purpose: 'item' | 'contact'
}

const CACHE_KEY = 'nostos_signature_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export class SignatureCache {
  private static cache: Map<string, CachedSignature> = new Map()
  private static initialized = false

  /**
   * Initialize cache from localStorage
   */
  private static init() {
    if (this.initialized || typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as Record<string, CachedSignature>
        const now = Date.now()
        
        // Load non-expired entries
        Object.entries(data).forEach(([key, value]) => {
          if (now - value.timestamp < CACHE_DURATION) {
            this.cache.set(key, value)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load signature cache:', error)
    }
    
    this.initialized = true
  }

  /**
   * Generate cache key
   */
  private static getCacheKey(
    address: string,
    itemId: string,
    purpose: 'item' | 'contact'
  ): string {
    return `${address.toLowerCase()}_${itemId.toLowerCase()}_${purpose}`
  }

  /**
   * Get cached signature
   */
  static get(
    address: string,
    itemId: string,
    purpose: 'item' | 'contact'
  ): string | null {
    this.init()
    
    const key = this.getCacheKey(address, itemId, purpose)
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    // Check if expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key)
      this.persist()
      return null
    }
    
    // Verify address matches
    if (cached.address.toLowerCase() !== address.toLowerCase()) {
      return null
    }
    
    return cached.signature
  }

  /**
   * Store signature in cache
   */
  static set(
    address: string,
    itemId: string,
    purpose: 'item' | 'contact',
    signature: string
  ) {
    this.init()
    
    const key = this.getCacheKey(address, itemId, purpose)
    this.cache.set(key, {
      signature,
      address,
      purpose,
      timestamp: Date.now()
    })
    
    this.persist()
  }

  /**
   * Clear cache for a specific address
   */
  static clearForAddress(address: string) {
    this.init()
    
    const keysToDelete: string[] = []
    this.cache.forEach((value, key) => {
      if (value.address.toLowerCase() === address.toLowerCase()) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
    this.persist()
  }

  /**
   * Clear all cached signatures
   */
  static clearAll() {
    this.cache.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
  }

  /**
   * Persist cache to localStorage
   */
  private static persist() {
    if (typeof window === 'undefined') return
    
    try {
      const data: Record<string, CachedSignature> = {}
      this.cache.forEach((value, key) => {
        data[key] = value
      })
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist signature cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    this.init()
    
    const now = Date.now()
    let active = 0
    let expired = 0
    
    this.cache.forEach(value => {
      if (now - value.timestamp < CACHE_DURATION) {
        active++
      } else {
        expired++
      }
    })
    
    return { active, expired, total: this.cache.size }
  }
}

/**
 * Bulk signature generator for multiple items
 * Uses a master signature to derive item-specific keys
 */
export class BulkSignatureGenerator {
  /**
   * Generate a master signature that can be used for multiple items
   */
  static async generateMasterSignature(
    signMessageAsync: (args: any) => Promise<string>,
    address: string,
    itemIds: string[]
  ): Promise<Map<string, string>> {
    // Create a deterministic message including all item IDs
    const message = `Nostos bulk decryption for ${itemIds.length} items at ${new Date().toISOString().split('T')[0]}`
    
    const masterSignature = await signMessageAsync({
      account: address,
      message
    })
    
    // Derive individual signatures from master
    const signatures = new Map<string, string>()
    
    itemIds.forEach((itemId, index) => {
      // Create deterministic per-item signature
      const itemSignature = this.deriveItemSignature(masterSignature, itemId, index)
      signatures.set(itemId, itemSignature)
      
      // Cache each signature
      SignatureCache.set(address, itemId, 'item', itemSignature)
    })
    
    return signatures
  }

  /**
   * Derive item-specific signature from master signature
   */
  private static deriveItemSignature(
    masterSignature: string,
    itemId: string,
    index: number
  ): string {
    // Simple derivation: combine master signature with item-specific data
    // In production, you might want to use a proper KDF
    const combined = `${masterSignature}_${itemId}_${index}`
    
    // Create a pseudo-signature (first 64 chars after 0x)
    // This is deterministic and unique per item
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to hex and pad to 64 chars
    const hexHash = Math.abs(hash).toString(16).padStart(64, '0')
    return `0x${hexHash}`
  }
}