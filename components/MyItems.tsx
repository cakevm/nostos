"use client"

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { QRGenerator } from './QRGenerator'
import { RevealContactModal } from './RevealContactModal'
import { Package, Clock, CheckCircle, AlertCircle, Loader2, QrCode, Eye, EyeOff, Wallet, ExternalLink, Mail, Phone, MessageSquare } from 'lucide-react'
import { getUserItems, getUserItemsExtended, getItemClaims, getContactReveals, getItemReturns } from '@/lib/events'
import { generateQRURL, isWalletAvailable, type ItemData as DecryptedItemData, type ContactData } from '@/lib/decryption'
import { useEncryption } from '@/lib/useEncryption'
import { useDecryptionCache } from '@/lib/decryption-cache'
import type { ItemRegisteredEvent, ClaimSubmittedEvent } from '@/lib/events'
import { NostosContract, ClaimStatus } from '@/lib/contracts'
import { getContractAddress } from '@/lib/chains'

interface ClaimWithDetails extends ClaimSubmittedEvent {
  status?: ClaimStatus
  encryptedContact?: `0x${string}`
  contactInfo?: ContactData
}

interface EnrichedItem extends ItemRegisteredEvent {
  claims: ClaimWithDetails[]
  decryptedData?: DecryptedItemData
  isReturned: boolean
  hasRevealedClaims: boolean
}

export function MyItems() {
  const { address, chain } = useAccount()
  const publicClient = usePublicClient()
  const { decryptItem, decryptContact } = useEncryption()
  const [items, setItems] = useState<EnrichedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<{ [key: string]: boolean }>({})
  const [decryptionStatus, setDecryptionStatus] = useState<{ [key: string]: 'loading' | 'success' | 'error' | 'cached' }>({})
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasTriedExtended, setHasTriedExtended] = useState(false)
  const [revealModalData, setRevealModalData] = useState<{ itemId: `0x${string}`, claimIndex: number } | null>(null)
  const [confirmingReturn, setConfirmingReturn] = useState<{ itemId: `0x${string}`, claimIndex: number } | null>(null)
  const { getFromCache, saveToCache, clearUserCache } = useDecryptionCache()
  
  // Contract write hooks for confirming return
  const { writeContract: confirmReturnWrite, data: confirmReturnHash } = useWriteContract()
  const { isLoading: isConfirmingReturn, isSuccess: isReturnConfirmed } = useWaitForTransactionReceipt({
    hash: confirmReturnHash,
  })

  // Function to fetch and decrypt claim contact info
  const fetchClaimDetails = async (itemId: `0x${string}`, claimIndex: number): Promise<ClaimWithDetails | null> => {
    if (!publicClient || !chain) return null
    
    try {
      const contractAddress = getContractAddress(chain.id)
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: NostosContract.abi,
        functionName: 'getClaim',
        args: [itemId, BigInt(claimIndex)],
      }) as any
      
      const finderAddress = result[0] as `0x${string}`
      const status = result[1] as ClaimStatus
      const encryptedContact = result[5] as `0x${string}`
      
      let contactInfo: ContactData | undefined
      
      if (status === ClaimStatus.ContactRevealed && encryptedContact) {
        // Contact has been revealed, decrypt it using the proper decryption function
        try {
          // Remove 0x prefix for decryption
          const encryptedHex = encryptedContact.slice(2)
          contactInfo = await decryptContact(encryptedHex, finderAddress, itemId)
          console.log('Decrypted contact info:', contactInfo)
        } catch (err) {
          console.error('Error decrypting contact:', err)
          // Try fallback: it might be plain hex-encoded JSON
          try {
            const contactBytes = encryptedContact.slice(2)
            const contactString = Buffer.from(contactBytes, 'hex').toString('utf8')
            contactInfo = JSON.parse(contactString) as ContactData
          } catch (fallbackErr) {
            console.error('Fallback decryption also failed:', fallbackErr)
          }
        }
      }
      
      return {
        finder: finderAddress,
        itemId,
        claimIndex: BigInt(claimIndex),
        timestamp: result[2],
        status,
        encryptedContact,
        contactInfo
      }
    } catch (error) {
      console.error('Error fetching claim details:', error)
      return null
    }
  }

  // Handle confirming item return
  const handleConfirmReturn = async (itemId: `0x${string}`, claimIndex: number, finderName?: string) => {
    if (!chain) {
      alert('Please connect your wallet')
      return
    }

    // Confirm with the user
    const confirmed = window.confirm(
      `Are you sure you want to mark this item as returned${finderName ? ` to ${finderName}` : ''}?\n\n` +
      'This will:\n' +
      '• Release the escrowed reward to the finder\n' +
      '• Mark the item as successfully returned\n' +
      '• This action cannot be undone'
    )
    
    if (!confirmed) return

    setConfirmingReturn({ itemId, claimIndex })

    try {
      const contractAddress = getContractAddress(chain.id)
      
      await confirmReturnWrite({
        address: contractAddress,
        abi: NostosContract.abi,
        functionName: 'confirmReturn',
        args: [itemId, BigInt(claimIndex)],
      })
    } catch (error) {
      console.error('Error confirming return:', error)
      setConfirmingReturn(null)
    }
  }

  // Handle successful return confirmation
  useEffect(() => {
    if (isReturnConfirmed && confirmingReturn) {
      // Update the item status to returned
      setItems(prev => prev.map(item => {
        if (item.itemId === confirmingReturn.itemId) {
          return {
            ...item,
            isReturned: true,
            claims: item.claims.map(claim => 
              Number(claim.claimIndex) === confirmingReturn.claimIndex 
                ? { ...claim, status: ClaimStatus.Completed }
                : claim
            )
          }
        }
        return item
      }))
      setConfirmingReturn(null)
      
      // Show success message
      alert('Item marked as returned! The reward has been sent to the finder.')
    }
  }, [isReturnConfirmed, confirmingReturn])

  // Clear cache when user changes
  useEffect(() => {
    if (address) {
      // Don't clear cache for the same user
      return
    }
    // Clear all cache when no user is connected
    clearUserCache('')
  }, [address, clearUserCache])

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!address || !chain) {
        setLoading(false)
        return
      }

      try {
        console.log('Fetching items for address:', address, 'on chain:', chain.id)
        
        // Fetch items from blockchain events
        const registeredItems = await getUserItems(address, chain.id)
        console.log('Found registered items:', registeredItems.length)
        
        if (registeredItems.length === 0) {
          setItems([])
          setLoading(false)
          return
        }

        // Enrich items with claims and return status
        const enrichedItems: EnrichedItem[] = []
        
        for (const item of registeredItems) {
          try {
            // Get claims for this item
            const claims = await getItemClaims(item.itemId, chain.id)
            
            // Check if item was returned
            const returns = await getItemReturns(item.itemId, chain.id)
            const isReturned = returns.length > 0

            // Check if any claims were revealed (owner paid to see contact)
            const reveals = await getContactReveals(item.itemId, chain.id)
            const hasRevealedClaims = reveals.length > 0

            // Fetch detailed claim info for revealed claims
            const detailedClaims: ClaimWithDetails[] = []
            for (const claim of claims) {
              const details = await fetchClaimDetails(item.itemId, Number(claim.claimIndex))
              if (details) {
                detailedClaims.push({
                  ...claim,
                  status: details.status,
                  encryptedContact: details.encryptedContact,
                  contactInfo: details.contactInfo
                })
              } else {
                detailedClaims.push(claim)
              }
            }

            enrichedItems.push({
              ...item,
              claims: detailedClaims,
              isReturned,
              hasRevealedClaims,
            })
          } catch (error) {
            console.error(`Error enriching item ${item.itemId}:`, error)
            // Still include the item but without enriched data
            enrichedItems.push({
              ...item,
              claims: [],
              isReturned: false,
              hasRevealedClaims: false,
            })
          }
        }

        setItems(enrichedItems)

        // Attempt to decrypt item data if wallet is available
        if (isWalletAvailable()) {
          for (const item of enrichedItems) {
            // Check cache first to avoid unnecessary signature requests
            const cached = getFromCache(address, item.itemId)
            if (cached) {
              // Update item with cached data immediately
              const itemIndex = enrichedItems.findIndex(i => i.itemId === item.itemId)
              if (itemIndex !== -1) {
                enrichedItems[itemIndex].decryptedData = cached
                setDecryptionStatus(prev => ({ ...prev, [item.itemId]: 'cached' }))
              }
            } else {
              // Decrypt items not in cache
              decryptItemData(item.itemId, item.encryptedData)
            }
          }
          // Update items with cached data
          setItems([...enrichedItems])
        }

      } catch (error) {
        console.error('Error fetching user items:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserItems()
  }, [address, chain])

  const loadMoreItems = async () => {
    if (!address || !chain || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      console.log('Loading more items from extended history...')
      
      // Fetch items from extended history (last 50k blocks)
      const extendedItems = await getUserItemsExtended(address, chain.id, 50000)
      console.log('Found extended items:', extendedItems.length)
      
      // Merge with existing items (remove duplicates)
      const existingItemIds = new Set(items.map(item => item.itemId))
      const newItems = extendedItems.filter(item => !existingItemIds.has(item.itemId))
      
      if (newItems.length > 0) {
        // Enrich new items with claims and return status
        const enrichedNewItems: EnrichedItem[] = []
        
        for (const item of newItems) {
          try {
            const claims = await getItemClaims(item.itemId, chain.id)
            const returns = await getItemReturns(item.itemId, chain.id)
            const reveals = await getContactReveals(item.itemId, chain.id)
            
            enrichedNewItems.push({
              ...item,
              claims,
              isReturned: returns.length > 0,
              hasRevealedClaims: reveals.length > 0,
            })
          } catch (error) {
            console.error(`Error enriching new item ${item.itemId}:`, error)
            enrichedNewItems.push({
              ...item,
              claims: [],
              isReturned: false,
              hasRevealedClaims: false,
            })
          }
        }
        
        setItems(prev => [...prev, ...enrichedNewItems])
        
        // Try to decrypt new items
        if (isWalletAvailable()) {
          for (const item of enrichedNewItems) {
            decryptItemData(item.itemId, item.encryptedData)
          }
        }
      }
      
      setHasTriedExtended(true)
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const decryptItemData = async (itemId: `0x${string}`, encryptedData: `0x${string}`) => {
    if (!address) return

    // Check cache first
    const cached = getFromCache(address, itemId)
    if (cached) {
      console.log('Using cached decryption for item:', itemId)
      setItems(prev => 
        prev.map(item => 
          item.itemId === itemId 
            ? { ...item, decryptedData: cached }
            : item
        )
      )
      setDecryptionStatus(prev => ({ ...prev, [itemId]: 'cached' }))
      return
    }

    setDecryptionStatus(prev => ({ ...prev, [itemId]: 'loading' }))
    
    try {
      // Remove '0x' prefix for decryption
      const hexData = encryptedData.slice(2)
      const decrypted = await decryptItem(hexData, itemId)
      
      // Save to cache
      saveToCache(address, itemId, decrypted)
      
      setItems(prev => 
        prev.map(item => 
          item.itemId === itemId 
            ? { ...item, decryptedData: decrypted }
            : item
        )
      )
      
      setDecryptionStatus(prev => ({ ...prev, [itemId]: 'success' }))
    } catch (error) {
      console.error('Error decrypting item:', error)
      setDecryptionStatus(prev => ({ ...prev, [itemId]: 'error' }))
    }
  }

  const getStatusIcon = (item: EnrichedItem) => {
    if (item.isReturned) {
      return <CheckCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
    }
    if (item.claims.length > 0) {
      return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
    }
    return <Clock className="h-5 w-5 text-slate-400" />
  }

  const getStatusText = (item: EnrichedItem) => {
    if (item.isReturned) {
      return 'Returned'
    }
    if (item.claims.length > 0) {
      return `${item.claims.length} claim${item.claims.length > 1 ? 's' : ''} submitted`
    }
    return 'Active'
  }

  const formatDate = (timestamp: bigint | number) => {
    const date = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const generateItemQRURL = (itemId: `0x${string}`) => {
    // Generate QR URL that finders can scan to submit claims
    // The encryption key will be derived from the finder's wallet when they scan
    return `${window.location.origin}/found/${itemId.slice(2)}`
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400">
          Please connect your wallet to view your registered items
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400">Loading your items...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-stone-400 mb-4">
          You haven't registered any items yet
        </p>
        <Button onClick={() => window.location.href = '/register'}>
          Register Your First Item
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-200">
          My Registered Items
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-stone-400">
            {items.length} item{items.length > 1 ? 's' : ''}
            <span className="text-xs text-slate-500 dark:text-stone-500 ml-2">
              (last 10k blocks)
            </span>
          </div>
          {!hasTriedExtended && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreItems}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More History'
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-stone-200">
                    Item #{item.itemId.slice(0, 8)}...
                  </h3>
                  {getStatusIcon(item)}
                </div>
                <p className="text-sm text-slate-600 dark:text-stone-400">
                  Registered on {formatDate(item.timestamp)}
                </p>
                {decryptionStatus[item.itemId] === 'loading' && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Decrypting...
                  </p>
                )}
                {decryptionStatus[item.itemId] === 'cached' && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    Loaded from cache
                  </p>
                )}
                {decryptionStatus[item.itemId] === 'error' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Failed to decrypt
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-stone-400">Stake</p>
                <p className="font-semibold text-slate-600 dark:text-stone-400">
                  {formatEther(item.stake)} ETH
                </p>
                {item.decryptedData && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-600 dark:text-stone-400">Reward</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      {item.decryptedData.reward} ETH
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  item.isReturned
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : item.claims.length > 0 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}>
                  {getStatusText(item)}
                </span>
                {item.decryptedData && (
                  <div className="text-xs text-slate-600 dark:text-stone-400">
                    "{item.decryptedData.name}"
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/found/${item.itemId.slice(2)}`, '_blank')}
                  title="View the claim page for this item"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Claim Page
                </Button>
                {item.claims.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item.itemId)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Claims ({item.claims.length})
                  </Button>
                )}
                {(decryptionStatus[item.itemId] === 'success' || decryptionStatus[item.itemId] === 'cached') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQR({ ...showQR, [item.itemId]: !showQR[item.itemId] })}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {showQR[item.itemId] ? 'Hide' : 'Show'} QR
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={decryptionStatus[item.itemId] === 'loading'}
                    onClick={() => decryptItemData(item.itemId, item.encryptedData)}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {decryptionStatus[item.itemId] === 'loading' ? 'Decrypting...' : 'Decrypt Item'}
                  </Button>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            {showQR[item.itemId] && item.decryptedData && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-stone-800">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-slate-600 dark:text-stone-400 mb-2">
                      QR Code for "{item.decryptedData.name}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-stone-500">
                      Scan to report this item as found
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <QRGenerator 
                        data={generateItemQRURL(item.itemId)}
                        itemName={item.decryptedData.name}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Claims Details */}
            {selectedItem === item.itemId && item.claims.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-stone-800">
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-400">
                      Submitted Claims ({item.claims.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItem(null)}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {item.claims.map((claim, index) => (
                      <div key={`${claim.itemId}-${claim.claimIndex}`} className="bg-white dark:bg-stone-800 rounded p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-stone-200">
                              Claim #{Number(claim.claimIndex) + 1}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-stone-400">
                              From: {claim.finder.slice(0, 6)}...{claim.finder.slice(-4)}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-stone-400">
                              Submitted: {formatDate(claim.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            {claim.status === ClaimStatus.ContactRevealed ? (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                                Contact Revealed
                              </span>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setRevealModalData({ 
                                  itemId: item.itemId, 
                                  claimIndex: Number(claim.claimIndex) 
                                })}
                              >
                                Reveal Contact
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Show completed status if item was returned */}
                        {claim.status === ClaimStatus.Completed && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Item successfully returned! Reward has been paid to the finder.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Show contact info if revealed but not yet returned */}
                        {claim.status === ClaimStatus.ContactRevealed && claim.contactInfo && (
                          <div className="mt-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">
                                  Finder's Contact Information:
                                </p>
                                <div className="space-y-1 text-sm text-amber-800 dark:text-amber-400">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Name:</span>
                                    <span>{claim.contactInfo.name}</span>
                                  </div>
                                  {claim.contactInfo.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <a href={`mailto:${claim.contactInfo.email}`} className="underline hover:text-amber-600">
                                        {claim.contactInfo.email}
                                      </a>
                                    </div>
                                  )}
                                  {claim.contactInfo.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      <a href={`tel:${claim.contactInfo.phone}`} className="underline hover:text-amber-600">
                                        {claim.contactInfo.phone}
                                      </a>
                                    </div>
                                  )}
                                  {claim.contactInfo.message && (
                                    <div className="mt-2 p-2 bg-amber-100/30 dark:bg-amber-900/10 rounded">
                                      <p className="text-xs font-medium mb-1">Message:</p>
                                      <p className="text-xs italic">{claim.contactInfo.message}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                                onClick={() => handleConfirmReturn(item.itemId, Number(claim.claimIndex), claim.contactInfo?.name)}
                                disabled={isConfirmingReturn && confirmingReturn?.itemId === item.itemId && confirmingReturn?.claimIndex === Number(claim.claimIndex)}
                              >
                                {isConfirmingReturn && confirmingReturn?.itemId === item.itemId && confirmingReturn?.claimIndex === Number(claim.claimIndex) ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Confirming...
                                  </>
                                ) : (
                                  'Mark as Returned'
                                )}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-slate-600 dark:text-stone-400"
                              >
                                Dispute Claim
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                    <p className="text-xs text-blue-800 dark:text-blue-400">
                      💡 Pay the reward amount to reveal contact details and arrange item return
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reveal Contact Modal */}
      {revealModalData && (
        <RevealContactModal
          itemId={revealModalData.itemId}
          claimIndex={revealModalData.claimIndex}
          onClose={() => setRevealModalData(null)}
          onSuccess={async () => {
            // Refresh the specific claim to show contact info
            setRevealModalData(null)
            
            // Update the specific claim with revealed contact info
            const updatedClaim = await fetchClaimDetails(revealModalData.itemId, revealModalData.claimIndex)
            if (updatedClaim) {
              setItems(prev => prev.map(item => {
                if (item.itemId === revealModalData.itemId) {
                  return {
                    ...item,
                    hasRevealedClaims: true,
                    claims: item.claims.map(claim => 
                      Number(claim.claimIndex) === revealModalData.claimIndex 
                        ? { ...claim, status: updatedClaim.status, contactInfo: updatedClaim.contactInfo }
                        : claim
                    )
                  }
                }
                return item
              }))
            }
          }}
        />
      )}
    </div>
  )
}