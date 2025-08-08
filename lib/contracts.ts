import { getContractAddress } from './chains'
import NostosABI from './abi/Nostos.json'
import { parseEther } from 'viem'

export const NostosContract = {
  abi: NostosABI as any,
  getAddress: (chainId: number) => getContractAddress(chainId),
}

// Contract constants matching Solidity
export const PLATFORM_FEE = parseEther('0.0001') // Platform fee (goes to feeRecipient)
export const MIN_STAKE = parseEther('0.0004') // Minimum stake (stays in contract for forfeiture)
export const REGISTRATION_FEE = parseEther('0.0005') // Total minimum payment (fee + stake)
export const CLAIM_TIMEOUT = 30 * 24 * 60 * 60 // 30 days in seconds

// Item and Claim status enums matching contract
export enum ItemStatus {
  Active = 0,
  HasClaims = 1,
  Returned = 2,
  Abandoned = 3
}

export enum ClaimStatus {
  Pending = 0,
  ContactRevealed = 1,
  Completed = 2,
  Disputed = 3
}

// Helper to generate item IDs
export function generateItemId(): `0x${string}` {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return `0x${Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`
}