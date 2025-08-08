import { createPublicClient, http, parseAbiItem, getContract } from 'viem'
import { sepolia, baseSepolia } from 'viem/chains'
import { getContractAddress } from './chains'
import NostosABI from './abi/Nostos.json'

// Create clients for each chain
export const publicClients = {
  [sepolia.id]: createPublicClient({
    chain: sepolia,
    transport: http()
  }),
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia,
    transport: http()
  }),
}

// Event types matching the contract
export interface ItemRegisteredEvent {
  itemId: `0x${string}`
  owner: `0x${string}`
  stake: bigint
  timestamp: bigint
  encryptedData: `0x${string}`
}

export interface ClaimSubmittedEvent {
  itemId: `0x${string}`
  finder: `0x${string}`
  claimIndex: bigint
  timestamp: bigint
  encryptedContact: `0x${string}`
}

export interface ContactRevealedEvent {
  itemId: `0x${string}`
  owner: `0x${string}`
  claimIndex: bigint
  escrowAmount: bigint
  timestamp: bigint
}

export interface ItemReturnedEvent {
  itemId: `0x${string}`
  owner: `0x${string}`
  finder: `0x${string}`
  rewardAmount: bigint
  timestamp: bigint
}

export interface UserStatsUpdatedEvent {
  user: `0x${string}`
  totalItems: bigint
  activeItems: bigint
  returnedItems: bigint
}

/**
 * Get logs from recent blocks only (default last 10k blocks)
 */
async function getRecentLogs(
  client: any,
  params: any,
  blockRange: number = 10000
) {
  const currentBlock = await client.getBlockNumber()
  const fromBlock = currentBlock - BigInt(blockRange)
  
  try {
    return await client.getLogs({
      ...params,
      fromBlock: fromBlock > 0n ? fromBlock : 0n,
      toBlock: currentBlock,
    })
  } catch (error) {
    console.error('Error fetching recent logs:', error)
    return []
  }
}

/**
 * Get all items registered by a user by scanning events (recent blocks only)
 */
export async function getUserItems(
  userAddress: `0x${string}`, 
  chainId: number,
  blockRange: number = 10000
): Promise<ItemRegisteredEvent[]> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getRecentLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event ItemRegistered(bytes32 indexed itemId, address indexed owner, uint256 stake, uint256 timestamp, bytes encryptedData)'),
      args: {
        owner: userAddress,
      },
    }, blockRange)

    return logs.map(log => ({
      itemId: log.args.itemId!,
      owner: log.args.owner!,
      stake: log.args.stake!,
      timestamp: log.args.timestamp!,
      encryptedData: log.args.encryptedData!,
    }))
  } catch (error) {
    console.error('Error fetching user items:', error)
    return []
  }
}

/**
 * Get all claims for a specific item (recent blocks only)
 */
export async function getItemClaims(
  itemId: `0x${string}`, 
  chainId: number,
  blockRange: number = 10000
): Promise<ClaimSubmittedEvent[]> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getRecentLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event ClaimSubmitted(bytes32 indexed itemId, address indexed finder, uint256 indexed claimIndex, uint256 timestamp, bytes encryptedContact)'),
      args: {
        itemId: itemId,
      },
    }, blockRange)

    return logs.map(log => ({
      itemId: log.args.itemId!,
      finder: log.args.finder!,
      claimIndex: log.args.claimIndex!,
      timestamp: log.args.timestamp!,
      encryptedContact: log.args.encryptedContact!,
    }))
  } catch (error) {
    console.error('Error fetching item claims:', error)
    return []
  }
}

/**
 * Get contact reveal events for an item (recent blocks only)
 */
export async function getContactReveals(
  itemId: `0x${string}`, 
  chainId: number,
  blockRange: number = 10000
): Promise<ContactRevealedEvent[]> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getRecentLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event ContactRevealed(bytes32 indexed itemId, address indexed owner, uint256 indexed claimIndex, uint256 escrowAmount, uint256 timestamp)'),
      args: {
        itemId: itemId,
      },
    }, blockRange)

    return logs.map(log => ({
      itemId: log.args.itemId!,
      owner: log.args.owner!,
      claimIndex: log.args.claimIndex!,
      escrowAmount: log.args.escrowAmount!,
      timestamp: log.args.timestamp!,
    }))
  } catch (error) {
    console.error('Error fetching contact reveals:', error)
    return []
  }
}

/**
 * Get item return events (recent blocks only)
 */
export async function getItemReturns(
  itemId: `0x${string}`, 
  chainId: number,
  blockRange: number = 10000
): Promise<ItemReturnedEvent[]> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getRecentLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event ItemReturned(bytes32 indexed itemId, address indexed owner, address indexed finder, uint256 rewardAmount, uint256 timestamp)'),
      args: {
        itemId: itemId,
      },
    }, blockRange)

    return logs.map(log => ({
      itemId: log.args.itemId!,
      owner: log.args.owner!,
      finder: log.args.finder!,
      rewardAmount: log.args.rewardAmount!,
      timestamp: log.args.timestamp!,
    }))
  } catch (error) {
    console.error('Error fetching item returns:', error)
    return []
  }
}

/**
 * Get user statistics from events (recent blocks only)
 */
export async function getUserStats(
  userAddress: `0x${string}`, 
  chainId: number,
  blockRange: number = 10000
): Promise<UserStatsUpdatedEvent | null> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getRecentLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event UserStatsUpdated(address indexed user, uint256 totalItems, uint256 activeItems, uint256 returnedItems)'),
      args: {
        user: userAddress,
      },
    }, blockRange)

    // Return the latest stats update
    if (logs.length > 0) {
      const latestLog = logs[logs.length - 1]
      return {
        user: latestLog.args.user!,
        totalItems: latestLog.args.totalItems!,
        activeItems: latestLog.args.activeItems!,
        returnedItems: latestLog.args.returnedItems!,
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return null
  }
}

/**
 * Get logs with extended historical range (chunked for larger ranges)
 */
async function getHistoricalLogs(
  client: any,
  params: any,
  totalBlocks: number
) {
  const currentBlock = await client.getBlockNumber()
  const fromBlock = currentBlock - BigInt(totalBlocks)
  const chunkSize = 9000 // Stay under 10k limit
  const allLogs = []
  
  for (let start = fromBlock; start <= currentBlock; start += BigInt(chunkSize)) {
    const end = start + BigInt(chunkSize) - 1n > currentBlock 
      ? currentBlock 
      : start + BigInt(chunkSize) - 1n
    
    try {
      const logs = await client.getLogs({
        ...params,
        fromBlock: start > 0n ? start : 0n,
        toBlock: end,
      })
      allLogs.push(...logs)
    } catch (error) {
      console.warn(`Failed to get historical logs for blocks ${start}-${end}:`, error)
    }
  }
  
  return allLogs
}

/**
 * Get user items with extended historical scan
 */
export async function getUserItemsExtended(
  userAddress: `0x${string}`, 
  chainId: number,
  totalBlocks: number = 50000
): Promise<ItemRegisteredEvent[]> {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)
  
  try {
    const logs = await getHistoricalLogs(client, {
      address: contractAddress,
      event: parseAbiItem('event ItemRegistered(bytes32 indexed itemId, address indexed owner, uint256 stake, uint256 timestamp, bytes encryptedData)'),
      args: {
        owner: userAddress,
      },
    }, totalBlocks)

    return logs.map(log => ({
      itemId: log.args.itemId!,
      owner: log.args.owner!,
      stake: log.args.stake!,
      timestamp: log.args.timestamp!,
      encryptedData: log.args.encryptedData!,
    }))
  } catch (error) {
    console.error('Error fetching extended user items:', error)
    return []
  }
}

/**
 * Subscribe to new events for real-time updates
 */
export function watchUserEvents(
  userAddress: `0x${string}`,
  chainId: number,
  onEvent: (event: any) => void
) {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`No client configured for chain ${chainId}`)
  }

  const contractAddress = getContractAddress(chainId)

  // Watch for new item registrations by this user
  const unwatch1 = client.watchEvent({
    address: contractAddress,
    event: parseAbiItem('event ItemRegistered(bytes32 indexed itemId, address indexed owner, uint256 stake, uint256 timestamp, bytes encryptedData)'),
    args: { owner: userAddress },
    onLogs: (logs) => logs.forEach(log => onEvent({ type: 'ItemRegistered', ...log.args }))
  })

  // Watch for new claims on user's items
  const unwatch2 = client.watchEvent({
    address: contractAddress,
    event: parseAbiItem('event ClaimSubmitted(bytes32 indexed itemId, address indexed finder, uint256 indexed claimIndex, uint256 timestamp, bytes encryptedContact)'),
    onLogs: async (logs) => {
      // Filter for user's items by checking ownership
      for (const log of logs) {
        try {
          const contract = getContract({
            address: contractAddress,
            abi: NostosABI as any,
            client: client,
          })
          
          const [owner] = await contract.read.getItem([log.args.itemId])
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            onEvent({ type: 'ClaimSubmitted', ...log.args })
          }
        } catch (error) {
          console.error('Error checking item ownership:', error)
        }
      }
    }
  })

  // Return cleanup function
  return () => {
    unwatch1()
    unwatch2()
  }
}