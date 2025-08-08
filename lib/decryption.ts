import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'

/**
 * Decryption utilities for reading encrypted on-chain data using wallet signatures
 */

export interface ItemData {
  name: string
  description: string
  reward: string
  message?: string
  timestamp: number
}

export interface ContactData {
  name: string
  email?: string
  phone?: string
  message?: string
  timestamp: number
}

/**
 * Generate a random encryption key for item data
 * This key should be stored in the QR code for secure access
 */
export function generateRandomKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Derive decryption key from wallet signature
 * Works with both MetaMask and Porto wallets
 */
export async function deriveDecryptionKey(
  walletAddress: `0x${string}`,
  itemId: `0x${string}`,
  purpose: 'item' | 'contact' = 'item'
): Promise<string> {
  try {
    // Message to sign for key derivation
    const message = `Nostos ${purpose} decryption key for ${itemId}`
    
    let signature: string
    
    // Try direct personal_sign first (works with Porto)
    if (window.ethereum) {
      try {
        // Convert message to hex for personal_sign
        const messageHex = '0x' + Buffer.from(message, 'utf8').toString('hex')
        
        // Ensure we have account access
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts available. Please connect your wallet first.')
        }
        
        // Use personal_sign directly
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [messageHex, walletAddress.toLowerCase()]
        }) as string
        
        console.log('Successfully signed with personal_sign')
      } catch (directSignError: any) {
        console.warn('Direct personal_sign failed, trying viem:', directSignError.message)
        
        // Fall back to viem's signMessage (which also uses personal_sign internally)
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(window.ethereum)
        })
        
        signature = await walletClient.signMessage({
          account: walletAddress,
          message,
        })
      }
    } else {
      throw new Error('No wallet provider found')
    }

    // Use the signature as encryption key (deterministic)
    return signature.slice(2, 66) // Take first 64 hex chars (32 bytes)
  } catch (error: any) {
    console.error('Error deriving decryption key:', error)
    throw new Error(`Failed to derive decryption key: ${error.message}`)
  }
}

/**
 * Encrypt item data using AES with wallet-derived key
 */
export async function encryptItemData(
  itemData: ItemData,
  walletAddress: `0x${string}`,
  itemId: `0x${string}`
): Promise<string> {
  try {
    const key = await deriveDecryptionKey(walletAddress, itemId, 'item')
    const dataString = JSON.stringify(itemData)
    
    // Convert key to CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.slice(0, 32)), // 32 bytes for AES-256
      'AES-GCM',
      false,
      ['encrypt']
    )

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      new TextEncoder().encode(dataString)
    )

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    // Convert to hex string for storage
    return Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  } catch (error) {
    console.error('Error encrypting item data:', error)
    throw new Error('Failed to encrypt item data')
  }
}

/**
 * Decrypt item data using wallet signature
 */
export async function decryptItemData(
  encryptedHex: string,
  walletAddress: `0x${string}`,
  itemId: `0x${string}`
): Promise<ItemData> {
  try {
    const key = await deriveDecryptionKey(walletAddress, itemId, 'item')
    
    // Convert hex to bytes
    const encryptedBytes = new Uint8Array(
      encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )

    // Extract IV and encrypted data
    const iv = encryptedBytes.slice(0, 12)
    const encryptedData = encryptedBytes.slice(12)

    // Convert key to CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.slice(0, 32)),
      'AES-GCM',
      false,
      ['decrypt']
    )

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    )

    const decryptedString = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(decryptedString) as ItemData
  } catch (error) {
    console.error('Error decrypting item data:', error)
    throw new Error('Failed to decrypt item data - may not be owner')
  }
}

/**
 * Encrypt contact data for finder-to-owner communication
 */
export async function encryptContactData(
  contactData: ContactData,
  finderAddress: `0x${string}`,
  itemId: `0x${string}`
): Promise<string> {
  try {
    // Use finder's address and itemId to derive encryption key
    const key = await deriveDecryptionKey(finderAddress, itemId, 'contact')
    const dataString = JSON.stringify(contactData)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.slice(0, 32)),
      'AES-GCM',
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      new TextEncoder().encode(dataString)
    )

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    return Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  } catch (error) {
    console.error('Error encrypting contact data:', error)
    throw new Error('Failed to encrypt contact data')
  }
}

/**
 * Decrypt contact data (owner decrypts finder's contact info)
 */
export async function decryptContactData(
  encryptedHex: string,
  finderAddress: `0x${string}`,
  itemId: `0x${string}`
): Promise<ContactData> {
  try {
    // Owner uses finder's address to derive the same key
    const key = await deriveDecryptionKey(finderAddress, itemId, 'contact')
    
    const encryptedBytes = new Uint8Array(
      encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )

    const iv = encryptedBytes.slice(0, 12)
    const encryptedData = encryptedBytes.slice(12)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.slice(0, 32)),
      'AES-GCM',
      false,
      ['decrypt']
    )

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    )

    const decryptedString = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(decryptedString) as ContactData
  } catch (error) {
    console.error('Error decrypting contact data:', error)
    throw new Error('Failed to decrypt contact data')
  }
}

/**
 * Generate item ID and QR URL using deterministic method
 */
export function generateItemId(): `0x${string}` {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`
}

/**
 * Generate QR code URL with encryption key for item
 */
export function generateQRURL(
  itemId: `0x${string}`,
  encryptionKey: string,
  baseURL: string = typeof window !== 'undefined' ? window.location.origin : 'https://nostos.app'
): string {
  return `${baseURL}/found/${itemId.slice(2)}?key=${encryptionKey}`
}

/**
 * Parse QR URL to extract item ID and encryption key
 */
export function parseQRURL(url: string): { itemId: `0x${string}`, encryptionKey: string } | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const itemIdHex = pathParts[pathParts.length - 1]
    const encryptionKey = urlObj.searchParams.get('key')

    if (!itemIdHex || !encryptionKey) {
      return null
    }

    return {
      itemId: `0x${itemIdHex}` as `0x${string}`,
      encryptionKey
    }
  } catch (error) {
    return null
  }
}

/**
 * Check if wallet is available for encryption operations
 */
export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' &&
         typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined'
}