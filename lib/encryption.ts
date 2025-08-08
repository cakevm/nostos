import CryptoJS from 'crypto-js'

export interface ItemData {
  name: string
  description: string
  reward: string
  message: string
  timestamp: number
}

// Generate a random encryption key
export function generateEncryptionKey(): string {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Encrypt item data with AES
export function encryptItemData(data: ItemData, key: string): string {
  const jsonString = JSON.stringify(data)
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString()
  return encrypted
}

// Decrypt item data with AES
export function decryptItemData(encryptedData: string, key: string): ItemData {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(jsonString)
  } catch {
    throw new Error('Failed to decrypt item data. Invalid key or corrupted data.')
  }
}

// Encrypt contact info with owner's public key (simplified for demo)
// In production, use proper public key encryption
export function encryptContactInfo(contact: string, ownerAddress: string): string {
  // For demo: simple encryption with owner address as key
  // In production: use owner's actual public key
  const encrypted = CryptoJS.AES.encrypt(contact, ownerAddress.toLowerCase()).toString()
  return encrypted
}

// Decrypt contact info with owner's private key (simplified for demo)
export function decryptContactInfo(encryptedContact: string, ownerAddress: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedContact, ownerAddress.toLowerCase())
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch {
    throw new Error('Failed to decrypt contact info')
  }
}

// Convert hex string to bytes for smart contract
export function hexToBytes(hex: string): `0x${string}` {
  return `0x${hex}` as `0x${string}`
}

// Convert string to hex for storage
export function stringToHex(str: string): string {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

// Convert hex to string for display
export function hexToString(hex: string): string {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  let str = ''
  for (let i = 0; i < cleanHex.length; i += 2) {
    str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16))
  }
  return str
}