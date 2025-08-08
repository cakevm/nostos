"use client"

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getContractAddress } from '@/lib/chains'
import { NostosContract } from '@/lib/contracts'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { BlockExplorerLink } from '@/lib/block-explorer'

interface RevealContactModalProps {
  itemId: `0x${string}`
  claimIndex: number
  onClose: () => void
  onSuccess?: () => void
}

export function RevealContactModal({ itemId, claimIndex, onClose, onSuccess }: RevealContactModalProps) {
  const { address, chain } = useAccount()
  const [rewardAmount, setRewardAmount] = useState('0.01')
  
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleReveal = async () => {
    if (!chain) {
      alert('Please connect your wallet')
      return
    }

    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      alert('Please enter a valid reward amount')
      return
    }

    try {
      const contractAddress = getContractAddress(chain.id)
      const value = parseEther(rewardAmount)

      console.log('Revealing contact for item:', itemId, 'claim:', claimIndex, 'with reward:', value.toString())

      await writeContract({
        address: contractAddress,
        abi: NostosContract.abi,
        functionName: 'revealContactInfo',
        args: [itemId, BigInt(claimIndex)],
        value: value,
        account: address!,
        chain: chain!,
      })
    } catch (err) {
      console.error('Error revealing contact:', err)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-slate-600 dark:text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact Revealed!</h3>
            <p className="text-sm text-slate-600 dark:text-stone-400 mb-4">
              The finder's contact information is now available. The reward has been escrowed and will be paid when you confirm the item return.
            </p>
            {hash && (
              <div className="mb-4">
                <BlockExplorerLink hash={hash} />
              </div>
            )}
            <Button onClick={() => { onSuccess?.(); onClose(); }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Reveal Finder's Contact</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reward">Reward Amount (ETH)</Label>
            <Input
              id="reward"
              type="number"
              step="0.001"
              min="0"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="0.01"
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">
              This amount will be escrowed and paid to the finder upon successful return
            </p>
          </div>

          {hash && !isSuccess && (
            <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded text-sm">
              <p className="font-semibold mb-1">Transaction Pending:</p>
              <p>Your transaction is being processed.</p>
              <div className="mt-2">
                <BlockExplorerLink hash={hash}>Track Transaction</BlockExplorerLink>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-3 rounded text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                {error.message?.includes('InsufficientEscrow') 
                  ? 'Please enter a reward amount greater than 0'
                  : error.message?.includes('ClaimExpired')
                  ? 'This claim has expired. The finder can now claim your stake.'
                  : error.message || 'Failed to reveal contact'}
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded">
            <p className="text-xs text-slate-700 dark:text-slate-400">
              <strong>How it works:</strong><br />
              1. You pay the reward amount now (escrowed)<br />
              2. Finder's contact info becomes visible<br />
              3. Contact the finder to arrange return<br />
              4. Confirm return to release the reward
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReveal}
              disabled={isPending || isConfirming || !rewardAmount || parseFloat(rewardAmount) <= 0}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                `Pay ${rewardAmount || '0'} ETH to Reveal`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}