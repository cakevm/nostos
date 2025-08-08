"use client"

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QRGenerator } from './QRGenerator'
import { getContractAddress } from '@/lib/chains'
import { generateItemId, type ItemData } from '@/lib/decryption'
import { useEncryption } from '@/lib/useEncryption'
import { NostosContract, REGISTRATION_FEE, PLATFORM_FEE, MIN_STAKE } from '@/lib/contracts'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const REWARD_PRESETS = [
  { label: '0.005 ETH', value: '0.005' },   // 10x the stake
  { label: '0.01 ETH', value: '0.01' },     // 20x the stake
  { label: '0.025 ETH', value: '0.025' },   // 50x the stake
  { label: 'Custom', value: 'custom' },
]

export function ItemRegistration() {
  const { address, chain } = useAccount()
  const router = useRouter()
  const { encryptItem, isSigningForEncryption } = useEncryption()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward: '0.005', // Default to first preset (10x stake)
    message: '',
  })
  const [selectedPreset, setSelectedPreset] = useState('0.005')
  const [customReward, setCustomReward] = useState('')
  const [qrData, setQrData] = useState<{ url: string; itemName: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handlePresetClick = (value: string) => {
    setSelectedPreset(value)
    if (value !== 'custom') {
      setFormData({ ...formData, reward: value })
      setCustomReward('')
    }
  }

  const handleCustomRewardChange = (value: string) => {
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomReward(value)
      setFormData({ ...formData, reward: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit clicked - address:', address, 'chain:', chain?.id)
    
    if (!address) {
      console.error('No wallet connected')
      alert('Please connect your wallet first')
      return
    }
    
    // Use Sepolia chain ID if chain is undefined (wallet connected but wrong network)
    const chainId = chain?.id || 11155111 // Sepolia ID

    // Validate reward amount
    const rewardAmount = selectedPreset === 'custom' ? customReward : formData.reward
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      alert('Please enter a valid reward amount')
      return
    }

    console.log('Starting registration with reward:', rewardAmount)
    
    try {
      // Generate item ID
      const itemId = generateItemId()
      console.log('Generated itemId:', itemId)
      
      // Prepare item data - store reward in ETH
      const itemData: ItemData = {
        name: formData.name,
        description: formData.description,
        reward: rewardAmount, // Store as plain number for easier parsing
        message: formData.message,
        timestamp: Date.now(),
      }
      
      // Encrypt item data using wallet signature through wagmi
      const encryptedHex = await encryptItem(itemData, itemId)
      
      // Use the constant from contracts.ts
      const contractAddress = getContractAddress(chainId)
      
      console.log('Writing to contract:', contractAddress, 'on chain:', chainId, 'with registration fee:', REGISTRATION_FEE.toString())
      
      writeContract({
        address: contractAddress,
        abi: NostosContract.abi,
        functionName: 'registerItem',
        args: [itemId, `0x${encryptedHex}`],
        value: REGISTRATION_FEE, // Total registration fee (platform fee + stake)
        account: address!,
        chain: chain!,
      })
      
      // Store QR data for after transaction success
      if (typeof window !== 'undefined') {
        const qrUrl = `${window.location.origin}/found/${itemId.slice(2)}`
        setQrData({ url: qrUrl, itemName: formData.name })
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      alert(`Registration failed: ${err.message || 'Unknown error'}`)
    }
  }

  const registrationFee = formatEther(REGISTRATION_FEE)
  const platformFee = formatEther(PLATFORM_FEE)
  const minStake = formatEther(MIN_STAKE)
  const rewardAmount = selectedPreset === 'custom' ? customReward : formData.reward

  if (isSuccess && qrData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent pb-1">Item Registered Successfully!</h2>
          <p className="text-slate-600 dark:text-stone-300/70">
            Your item has been registered on the blockchain. Download and print this QR code.
          </p>
        </div>
        
        <QRGenerator data={qrData.url} itemName={qrData.itemName} />
        
        <div className="mt-8 text-center">
          <Button onClick={() => window.location.reload()}>
            Register Another Item
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/60 dark:via-amber-300/50 dark:to-amber-200/60 bg-clip-text text-transparent pb-1">Register Lost Item</h2>
        <p className="text-slate-600 dark:text-stone-300/70">
          Register your item on the blockchain and get a QR code label.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-700 dark:text-stone-200">Item Name</Label>
          <Input
            id="name"
            required
            placeholder="e.g., iPhone 16 Pro"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-slate-700 dark:text-stone-200">Description</Label>
          <Textarea
            id="description"
            required
            placeholder="Describe your item and any identifying features"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-slate-700 dark:text-stone-200">Reward Amount (ETH)</Label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {REWARD_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={selectedPreset === preset.value ? "default" : "outline"}
                onClick={() => handlePresetClick(preset.value)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          {selectedPreset === 'custom' && (
            <Input
              type="text"
              placeholder="Enter amount in ETH (e.g., 0.002)"
              value={customReward}
              onChange={(e) => handleCustomRewardChange(e.target.value)}
              required
            />
          )}
          {selectedPreset !== 'custom' && (
            <p className="text-sm text-slate-500 dark:text-stone-400">
              Selected: {formData.reward} ETH
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="message" className="text-slate-700 dark:text-stone-200">Message to Finder (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Thank you for finding my item! Please contact me to arrange return."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900/30 dark:to-slate-800/30 p-4 rounded-lg border border-slate-300 dark:border-slate-700/30">
        <p className="text-sm font-medium text-slate-700 dark:text-stone-200">
          Pay-on-Claim Model:
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-stone-400">Platform Fee:</span>
            <span className="text-slate-700 dark:text-stone-300">{platformFee} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-stone-400">Refundable Stake:</span>
            <span className="text-slate-700 dark:text-stone-300">{minStake} ETH</span>
          </div>
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span>Private Reward Amount:</span>
            <span>{rewardAmount || '0'} ETH</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-slate-300 dark:border-slate-700/30 text-blue-600 dark:text-blue-400">
            <span>Pay Now (Total):</span>
            <span>{registrationFee} ETH</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-stone-500 mt-3">
          ✨ <strong>Pay-on-Claim:</strong> Platform fee + refundable stake paid now. Reward is paid only when someone finds your item. Stake is forfeited if you don't respond to claims within 30 days.
        </p>
      </div>

      {mounted && !address && (
        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-4 rounded-lg text-sm border border-amber-300 dark:border-amber-900/30">
          Please connect your wallet using the Porto button in the header to register items.
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm border border-red-300 dark:border-red-900/30">
          {error.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!mounted || !address || isPending || isConfirming || isSigningForEncryption}
      >
        {!mounted ? (
          'Loading...'
        ) : !address ? (
          'Connect Wallet to Register'
        ) : isSigningForEncryption ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing for Encryption...
          </>
        ) : isPending || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPending ? 'Confirming...' : 'Processing...'}
          </>
        ) : (
          `Register Item (${registrationFee} ETH)`
        )}
      </Button>
    </form>
  )
}