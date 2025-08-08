import { createPublicClient, http, type Address } from 'viem'
import { NostosContract, ItemStatus, ClaimStatus } from './contracts'
import { getChainConfig } from './chains'

export interface Item {
  owner: Address
  status: ItemStatus
  registrationTime: bigint
  lastActivity: bigint
  stake: bigint
  encryptedData: `0x${string}`
}

export interface Claim {
  finder: Address
  status: ClaimStatus
  timestamp: bigint
  revealDeadline: bigint
  escrowAmount: bigint
  encryptedContact: `0x${string}`
}

export interface UserStats {
  totalItems: number
  activeItems: number
  returnedItems: number
}

export class NostosDataProvider {
  private client: any
  private contractAddress: Address
  private chainId: number

  constructor(chainId: number) {
    this.chainId = chainId
    const chainConfig = getChainConfig(chainId)
    this.client = createPublicClient({
      chain: chainConfig,
      transport: http(),
    })
    this.contractAddress = NostosContract.getAddress(chainId) as Address
  }

  // Get item details
  async getItem(itemId: `0x${string}`): Promise<Item | null> {
    try {
      console.log('Fetching item:', itemId, 'from contract:', this.contractAddress)
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getItem',
        args: [itemId],
      }) as any

      console.log('Item result:', result)

      if (!result || result[0] === '0x0000000000000000000000000000000000000000') {
        console.log('Item not found or owner is zero address')
        return null
      }

      return {
        owner: result[0],
        status: result[1],
        registrationTime: result[2],
        lastActivity: result[3],
        stake: result[4],
        encryptedData: result[5],
      }
    } catch (error) {
      console.error('Error fetching item:', error)
      return null
    }
  }

  // Get all claims for an item
  async getClaims(itemId: `0x${string}`): Promise<Claim[]> {
    try {
      const claimCount = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getClaimCount',
        args: [itemId],
      }) as bigint

      const claims: Claim[] = []
      for (let i = 0n; i < claimCount; i++) {
        const claim = await this.client.readContract({
          address: this.contractAddress,
          abi: NostosContract.abi,
          functionName: 'getClaim',
          args: [itemId, i],
        }) as any

        claims.push({
          finder: claim[0],
          status: claim[1],
          timestamp: claim[2],
          revealDeadline: claim[3],
          escrowAmount: claim[4],
          encryptedContact: claim[5],
        })
      }

      return claims
    } catch (error) {
      console.error('Error fetching claims:', error)
      return []
    }
  }

  // Get user's items
  async getUserItems(userAddress: Address): Promise<`0x${string}`[]> {
    try {
      const items = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getUserItems',
        args: [userAddress],
      }) as `0x${string}`[]

      return items || []
    } catch (error) {
      console.error('Error fetching user items:', error)
      return []
    }
  }

  // Get finder's claims
  async getFinderClaims(finderAddress: Address): Promise<`0x${string}`[]> {
    try {
      const items = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getFinderClaims',
        args: [finderAddress],
      }) as `0x${string}`[]

      return items || []
    } catch (error) {
      console.error('Error fetching finder claims:', error)
      return []
    }
  }

  // Get user statistics
  async getUserStats(userAddress: Address): Promise<UserStats> {
    try {
      const stats = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getUserStats',
        args: [userAddress],
      }) as bigint

      // Unpack the stats (16 bits each)
      const totalItems = Number(stats & 0xFFFFn)
      const activeItems = Number((stats >> 16n) & 0xFFFFn)
      const returnedItems = Number((stats >> 32n) & 0xFFFFn)

      return {
        totalItems,
        activeItems,
        returnedItems,
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalItems: 0,
        activeItems: 0,
        returnedItems: 0,
      }
    }
  }

  // Get registration fee
  async getRegistrationFee(): Promise<bigint> {
    try {
      const fee = await this.client.readContract({
        address: this.contractAddress,
        abi: NostosContract.abi,
        functionName: 'getRegistrationFee',
        args: [],
      }) as bigint

      return fee
    } catch (error) {
      console.error('Error fetching registration fee:', error)
      return 0n
    }
  }

  // Get items with full details for a user
  async getUserItemsWithDetails(userAddress: Address): Promise<Array<{ itemId: `0x${string}`, item: Item }>> {
    const itemIds = await this.getUserItems(userAddress)
    const itemsWithDetails = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await this.getItem(itemId)
        return item ? { itemId, item } : null
      })
    )
    
    return itemsWithDetails.filter((item): item is { itemId: `0x${string}`, item: Item } => item !== null)
  }

  // Get claims with details for a finder
  async getFinderClaimsWithDetails(finderAddress: Address): Promise<Array<{
    itemId: `0x${string}`
    item: Item
    claimIndex: number
    claim: Claim
  }>> {
    const itemIds = await this.getFinderClaims(finderAddress)
    const claimsWithDetails = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await this.getItem(itemId)
        if (!item) return null

        // Find the finder's claim index
        const claimIndexResult = await this.client.readContract({
          address: this.contractAddress,
          abi: NostosContract.abi,
          functionName: 'getFinderClaimIndex',
          args: [itemId, finderAddress],
        }) as bigint

        if (claimIndexResult === 2n ** 256n - 1n) return null // Not found

        const claims = await this.getClaims(itemId)
        const claim = claims[Number(claimIndexResult)]
        
        return claim ? { itemId, item, claimIndex: Number(claimIndexResult), claim } : null
      })
    )
    
    return claimsWithDetails.filter((claim): claim is {
      itemId: `0x${string}`
      item: Item
      claimIndex: number
      claim: Claim
    } => claim !== null)
  }

  // Get all active items (for browsing)
  async getAllActiveItems(_limit: number = 100): Promise<Array<{ itemId: `0x${string}`, item: Item }>> {
    // Since we can't iterate all items directly, we'd need to use events for initial discovery
    // This is a placeholder that would need event-based discovery for production
    // For now, returning empty array as this would require indexing
    console.warn('getAllActiveItems requires event indexing for full functionality')
    return []
  }
}