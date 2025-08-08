"use client"

import { useSignMessage, useAccount } from 'wagmi'
import { useState, useCallback } from 'react'
import type { ItemData, ContactData } from './decryption'

/**
 * Custom hook for encryption operations using wallet signatures
 * Works with both MetaMask and Porto wallets through wagmi
 */
export function useEncryption() {
  const { signMessageAsync } = useSignMessage()
  const { address } = useAccount()
  const [isSigningForEncryption, setIsSigningForEncryption] = useState(false)

  /**
   * Derive encryption key using wallet signature
   */
  const deriveKey = useCallback(async (
    itemId: `0x${string}`,
    purpose: 'item' | 'contact' = 'item'
  ): Promise<string> => {
    const message = `Nostos ${purpose} decryption key for ${itemId}`
    
    try {
      setIsSigningForEncryption(true)
      // Use wagmi's signMessageAsync which handles both MetaMask and Porto properly
      const signature = await signMessageAsync({ 
      account: address!,
      message 
    })
      
      // Use the signature as encryption key (deterministic)
      return signature.slice(2, 66) // Take first 64 hex chars (32 bytes)
    } catch (error: any) {
      console.error('Error signing for encryption:', error)
      throw new Error(`Failed to sign for encryption: ${error.message}`)
    } finally {
      setIsSigningForEncryption(false)
    }
  }, [signMessageAsync])

  /**
   * Encrypt item data
   */
  const encryptItem = useCallback(async (
    itemData: ItemData,
    itemId: `0x${string}`
  ): Promise<string> => {
    const key = await deriveKey(itemId, 'item')
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
  }, [deriveKey])

  /**
   * Decrypt item data
   */
  const decryptItem = useCallback(async (
    encryptedHex: string,
    itemId: `0x${string}`
  ): Promise<ItemData> => {
    const key = await deriveKey(itemId, 'item')
    
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
  }, [deriveKey])

  /**
   * Encrypt contact data
   */
  const encryptContact = useCallback(async (
    contactData: ContactData,
    itemId: `0x${string}`
  ): Promise<string> => {
    const key = await deriveKey(itemId, 'contact')
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
  }, [deriveKey])

  /**
   * Decrypt contact data (for owner to decrypt finder's info)
   */
  const decryptContact = useCallback(async (
    encryptedHex: string,
    finderAddress: `0x${string}`,
    itemId: `0x${string}`
  ): Promise<ContactData> => {
    // For contact decryption, we need to derive the key that the finder used
    // This requires the owner to sign with finder's address in the message
    const message = `Nostos contact decryption key for ${itemId}`
    const signature = await signMessageAsync({ 
      account: address!,
      message 
    })
    const key = signature.slice(2, 66)
    
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
  }, [signMessageAsync])

  return {
    encryptItem,
    decryptItem,
    encryptContact,
    decryptContact,
    isSigningForEncryption
  }
}