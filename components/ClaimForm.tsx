"use client"

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getContractAddress, sepolia, baseSepolia } from '@/lib/chains'
import { decryptItemData, parseQRURL, type ItemData, type ContactData } from '@/lib/decryption'
import { useEncryption } from '@/lib/useEncryption'
import { NostosContract, ItemStatus } from '@/lib/contracts'
import { NostosDataProvider, type Item } from '@/lib/contract-data'
import { Loader2, CheckCircle } from 'lucide-react'

interface ClaimFormProps {
  itemId: string
  qrUrl?: string // Full QR URL for parsing
}

export function ClaimForm({ itemId, qrUrl }: ClaimFormProps) {
  const { address, chain } = useAccount()
  const { encryptContact, isSigningForEncryption } = useEncryption()
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [itemData, setItemData] = useState<ItemData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemOwner, setItemOwner] = useState<`0x${string}` | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [itemNotFound, setItemNotFound] = useState(false)
  
  // Fetch item data using the data provider
  useEffect(() => {
    async function fetchItem() {
      setIsLoading(true)
      setItemNotFound(false)
      
      // Use the current chain if connected, otherwise default to Sepolia
      const chainId = chain?.id || sepolia.id
      
      // Ensure itemId has 0x prefix
      const formattedItemId = itemId.startsWith('0x') ? itemId : `0x${itemId}`
      
      console.log('Fetching item with ID:', formattedItemId)
      console.log('Original Chain ID:', chain?.id, 'Using Chain ID:', chainId)
      
      try {
        // Try current chain first
        const contractAddress = getContractAddress(chainId)
        console.log('Contract address:', contractAddress)
        const provider = new NostosDataProvider(chainId)
        let itemData = await provider.getItem(formattedItemId as `0x${string}`)
        
        console.log('Fetched item data on chain', chainId, ':', itemData)
        
        // If not found on current chain, try the other chain
        if (!itemData || itemData.owner === '0x0000000000000000000000000000000000000000') {
          const alternateChainId = chainId === sepolia.id ? baseSepolia.id : sepolia.id
          console.log('Item not found on chain', chainId, ', trying chain', alternateChainId)
          
          const altProvider = new NostosDataProvider(alternateChainId)
          itemData = await altProvider.getItem(formattedItemId as `0x${string}`)
          
          if (itemData && itemData.owner !== '0x0000000000000000000000000000000000000000') {
            console.log('Item found on alternate chain', alternateChainId)
            // Alert user they need to switch chains
            alert(`This item was registered on ${alternateChainId === sepolia.id ? 'Sepolia' : 'Base Sepolia'}. Please switch your wallet to the correct network.`)
          }
        }
        
        if (itemData && itemData.owner !== '0x0000000000000000000000000000000000000000') {
          setItem(itemData)
          setItemOwner(itemData.owner)
          console.log('Item found with owner:', itemData.owner)
        } else {
          console.log('Item not found on any chain')
          setItemNotFound(true)
        }
      } catch (error) {
        console.error('Error fetching item:', error)
        setItemNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchItem()
  }, [chain, itemId])

  // Set item data display based on QR information
  useEffect(() => {
    if (item && item.owner !== '0x0000000000000000000000000000000000000000') {
      // Try to decrypt using QR data if available
      if (qrUrl) {
        const qrData = parseQRURL(qrUrl)
        if (qrData?.encryptionKey) {
          try {
            // For now, show basic info - in a real implementation,
            // the QR would contain limited public info
            setItemData({
              name: 'Found Item',
              description: 'Item details available to owner only',
              reward: 'Hidden until claimed',
              timestamp: Date.now()
            })
          } catch (error) {
            console.error('Failed to process QR data:', error)
          }
        }
      } else {
        // Show generic item info for direct access
        setItemData({
          name: 'Found Item',
          description: 'Scan the QR code to see item details',
          reward: 'Reward available on successful return',
          timestamp: Date.now()
        })
      }
    }
  }, [item, qrUrl])

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !chain || !itemOwner) return

    setIsSubmitting(true)
    try {
      // Prepare contact data
      const contactData: ContactData = {
        name: contactForm.name,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        message: contactForm.message || undefined,
        timestamp: Date.now()
      }
      
      // Encrypt contact data using finder's wallet signature through wagmi
      const encryptedContact = await encryptContact(contactData, `0x${itemId}`)
      
      await writeContract({
        address: getContractAddress(chain.id),
        abi: NostosContract.abi,
        functionName: 'submitClaim',
        args: [`0x${itemId}`, `0x${encryptedContact}`],
        account: address!,
        chain: chain!,
      })
    } catch (err) {
      console.error('Claim submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-400" />
        <p>Loading item details...</p>
      </div>
    )
  }

  if (itemNotFound || !item) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2 text-amber-50">Item Not Found</h2>
        <p className="text-amber-100/70 mb-4">
          This item hasn't been registered yet on the blockchain.
        </p>
        <div className="bg-amber-900/20 p-4 rounded-lg max-w-md mx-auto">
          <p className="text-amber-100/80 text-sm mb-2">
            <strong>Item ID:</strong>
          </p>
          <p className="text-amber-100/60 text-xs font-mono break-all">
            {itemId}
          </p>
        </div>
        <p className="text-amber-100/60 mt-6 text-sm">
          If you're the owner, please register this item first at{' '}
          <a href="/register" className="text-amber-400 hover:text-amber-300 underline">
            /register
          </a>
        </p>
      </div>
    )
  }

  if (!itemData) {
    // Set default item data if not already set
    setItemData({
      name: 'Found Item',
      description: 'Scan the QR code to see item details',
      reward: 'Reward available on successful return',
      timestamp: Date.now()
    })
    return null
  }

  // Check if item is already returned or abandoned
  if (item.status === ItemStatus.Returned) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-amber-50">Item Already Returned</h2>
        <p className="text-amber-100/70">
          This item has already been successfully returned to its owner.
        </p>
      </div>
    )
  }

  if (item.status === ItemStatus.Abandoned) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2 text-amber-50">Item Abandoned</h2>
        <p className="text-amber-100/70">
          This item has been marked as abandoned due to non-response from the owner.
        </p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-amber-50">Claim Submitted Successfully!</h2>
        <p className="text-amber-100/70 mb-4">
          Your claim has been submitted! The owner will pay to reveal your contact information and reach out to arrange the return.
        </p>
        <p className="text-sm text-amber-100/60">
          Thank you for being an honest finder!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900/60 backdrop-blur p-6 rounded-xl border border-amber-900/20 shadow-lg hover:shadow-amber-900/20 transition-shadow">
        <h2 className="text-xl font-bold mb-4 text-amber-50">Found Item Details</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-semibold text-amber-100">Item Name:</dt>
            <dd className="text-amber-100/80">{itemData.name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-amber-100">Description:</dt>
            <dd className="text-amber-100/80">{itemData.description}</dd>
          </div>
          <div>
            <dt className="font-semibold text-amber-100">Reward:</dt>
            <dd className="text-emerald-400 font-bold">{itemData.reward}</dd>
          </div>
          {itemData.message && (
            <div>
              <dt className="font-semibold text-amber-100">Message from Owner:</dt>
              <dd className="italic text-amber-100/80">{itemData.message}</dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              required
              placeholder="John Doe"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={contactForm.phone}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="message">Message to Owner (Optional)</Label>
          <Textarea
            id="message"
            placeholder="I found your item at the coffee shop on Main Street. Please contact me to arrange pickup."
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="bg-blue-950/30 border border-blue-900/30 rounded-lg p-4">
          <p className="text-xs text-blue-100/80">
            🔒 Your contact information will be encrypted using your wallet and only visible to the item owner after they pay the reward.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/30 text-red-400 p-4 rounded-lg text-sm border border-red-900/30">
            {error.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!contactForm.name || (!contactForm.email && !contactForm.phone) || isPending || isConfirming || isSubmitting || isSigningForEncryption}
        >
          {isSigningForEncryption ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing for Encryption...
            </>
          ) : isPending || isConfirming || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Submitting...'}
            </>
          ) : (
            'Submit Claim'
          )}
        </Button>

        {!address && (
          <div className="bg-amber-950/30 border border-amber-900/30 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-100/80">
              💵 Connect your wallet to submit a claim. Small gas fee required.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}