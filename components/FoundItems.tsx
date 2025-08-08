"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Search, Clock, CheckCircle, XCircle, Loader2, DollarSign, Eye, EyeOff } from 'lucide-react'
import { getContractAddress } from '@/lib/chains'
import NostosABI from '@/lib/abi/Nostos.json'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia } from 'viem/chains'

interface FoundItemClaim {
  itemId: `0x${string}`
  itemOwner: `0x${string}`
  claimIndex: bigint
  timestamp: bigint
  status: 'pending' | 'revealed' | 'returned' | 'abandoned'
  escrowAmount?: bigint
}

export function FoundItems() {
  const { address, chain } = useAccount()
  const [claims, setClaims] = useState<FoundItemClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null)

  useEffect(() => {
    const fetchFoundItems = async () => {
      if (!address || !chain) {
        setLoading(false)
        return
      }

      try {
        console.log('Fetching items found by:', address)
        
        // Create a public client for event scanning
        const client = createPublicClient({
          chain: sepolia,
          transport: http()
        })
        
        const contractAddress = getContractAddress(chain.id)
        const currentBlock = await client.getBlockNumber()
        const fromBlock = currentBlock - 10000n // Last 10k blocks
        
        // Get all claims submitted by this finder
        const claimLogs = await client.getLogs({
          address: contractAddress,
          event: parseAbiItem('event ClaimSubmitted(bytes32 indexed itemId, address indexed finder, uint256 indexed claimIndex, uint256 timestamp, bytes encryptedContact)'),
          args: {
            finder: address,
          },
          fromBlock: fromBlock > 0n ? fromBlock : 0n,
          toBlock: currentBlock,
        })

        // Process each claim to get current status
        const processedClaims: FoundItemClaim[] = []
        
        for (const log of claimLogs) {
          const itemId = log.args.itemId as `0x${string}`
          const claimIndex = log.args.claimIndex as bigint
          const timestamp = log.args.timestamp as bigint
          
          // Get item details to find owner
          const itemData = await client.readContract({
            address: contractAddress,
            abi: NostosABI,
            functionName: 'getItem',
            args: [itemId],
          }) as any
          
          // Get claim details for current status
          const claimData = await client.readContract({
            address: contractAddress,
            abi: NostosABI,
            functionName: 'getClaim',
            args: [itemId, claimIndex],
          }) as any
          
          // Determine status based on claim data
          let status: 'pending' | 'revealed' | 'returned' | 'abandoned' = 'pending'
          if (claimData[1] === 2) status = 'returned' // ClaimStatus.Confirmed
          else if (claimData[1] === 1) status = 'revealed' // ClaimStatus.ContactRevealed
          else if (itemData[1] === 3) status = 'abandoned' // ItemStatus.Abandoned
          
          processedClaims.push({
            itemId,
            itemOwner: itemData[0],
            claimIndex,
            timestamp,
            status,
            escrowAmount: claimData[4] || 0n,
          })
        }
        
        setClaims(processedClaims.reverse()) // Most recent first
        
      } catch (error) {
        console.error('Error fetching found items:', error)
        setClaims([])
      } finally {
        setLoading(false)
      }
    }

    fetchFoundItems()
  }, [address, chain])

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'returned':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'revealed':
        return <DollarSign className="h-5 w-5 text-amber-500" />
      case 'abandoned':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'returned':
        return 'Item Returned - Reward Received'
      case 'revealed':
        return 'Contact Revealed - Awaiting Return'
      case 'abandoned':
        return 'Item Abandoned'
      default:
        return 'Claim Pending'
    }
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400">
          Please connect your wallet to view items you've found
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400">Loading your found items...</p>
      </div>
    )
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400 mb-4">
          You haven't found any items yet
        </p>
        <Button onClick={() => window.location.href = '/scan'}>
          Scan QR Code
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-200">
          Items You've Found
        </h2>
        <div className="text-sm text-slate-600 dark:text-stone-400">
          {claims.length} claim{claims.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4">
        {claims.map((claim) => (
          <div
            key={`${claim.itemId}-${claim.claimIndex}`}
            className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-stone-200">
                    Item #{claim.itemId.slice(0, 8)}...
                  </h3>
                  {getStatusIcon(claim.status)}
                </div>
                <p className="text-sm text-slate-600 dark:text-stone-400">
                  Found on {formatDate(claim.timestamp)}
                </p>
                <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">
                  Owner: {claim.itemOwner.slice(0, 6)}...{claim.itemOwner.slice(-4)}
                </p>
              </div>
              {claim.escrowAmount && claim.escrowAmount > 0n && (
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-stone-400">Reward</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatEther(claim.escrowAmount)} ETH
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  claim.status === 'returned'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : claim.status === 'revealed'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    : claim.status === 'abandoned'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {getStatusText(claim.status)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedClaim(
                  expandedClaim === `${claim.itemId}-${claim.claimIndex}` 
                    ? null 
                    : `${claim.itemId}-${claim.claimIndex}`
                )}
              >
                {expandedClaim === `${claim.itemId}-${claim.claimIndex}` ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </>
                )}
              </Button>
            </div>

            {/* Expanded Details */}
            {expandedClaim === `${claim.itemId}-${claim.claimIndex}` && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-stone-800">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 dark:text-stone-200 mb-3">
                    Claim Status Details
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    {claim.status === 'pending' && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 rounded p-3">
                        <p className="text-blue-800 dark:text-blue-300">
                          ⏳ Waiting for the owner to pay the reward and reveal your contact information.
                        </p>
                      </div>
                    )}
                    
                    {claim.status === 'revealed' && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded p-3">
                        <p className="text-amber-800 dark:text-amber-300">
                          📞 The owner has paid the reward and can now see your contact information. 
                          They should contact you soon to arrange the item return.
                        </p>
                      </div>
                    )}
                    
                    {claim.status === 'returned' && (
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded p-3">
                        <p className="text-green-800 dark:text-green-300">
                          ✅ Item successfully returned! The reward has been transferred to your wallet.
                        </p>
                      </div>
                    )}
                    
                    {claim.status === 'abandoned' && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded p-3">
                        <p className="text-red-800 dark:text-red-300">
                          ❌ The owner did not respond in time. You may have received the stake as compensation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}