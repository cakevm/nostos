"use client"

import { useParams } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { PortoAuth } from '@/components/PortoAuth'
import { NostosContract } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, QrCode } from 'lucide-react'
import { BlockExplorerLink } from '@/lib/block-explorer'
import { formatEther } from 'viem'
import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { formatDateTime } from '@/lib/format'

export default function ItemDetailPage() {
  const params = useParams()
  const itemId = params.id as string
  const { address, chain } = useAccount()
  const qrRef = useRef<HTMLCanvasElement>(null)

  // Read item data
  const { data: item } = useReadContract({
    address: chain ? NostosContract.getAddress(chain.id) : undefined,
    abi: NostosContract.abi,
    functionName: 'getItem',
    args: [`0x${itemId}`],
  }) as { data: readonly [`0x${string}`, bigint, bigint, `0x${string}`, boolean] | undefined }

  // Read claims
  const { data: claims, refetch: refetchClaims } = useReadContract({
    address: chain ? NostosContract.getAddress(chain.id) : undefined,
    abi: NostosContract.abi,
    functionName: 'getItemClaims',
    args: [`0x${itemId}`],
  }) as { data: readonly [`0x${string}`, `0x${string}`, number, bigint][] | undefined; refetch: () => void }

  // Contract write hooks
  const { writeContract: approveClaim, data: approveHash, error: approveError } = useWriteContract()
  const { writeContract: rejectClaim, data: rejectHash, error: rejectError } = useWriteContract()
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isRejecting, isSuccess: isRejectSuccess } = useWaitForTransactionReceipt({ hash: rejectHash })

  const handleApprove = async (claimIndex: number) => {
    if (!chain) return
    await approveClaim({
      address: NostosContract.getAddress(chain.id),
      abi: NostosContract.abi,
      functionName: 'approveClaim',
      args: [`0x${itemId}`, BigInt(claimIndex)],
      account: address!,
      chain: chain!,
    })
    refetchClaims()
  }

  const handleReject = async (claimIndex: number) => {
    if (!chain) return
    await rejectClaim({
      address: NostosContract.getAddress(chain.id),
      abi: NostosContract.abi,
      functionName: 'rejectClaim',
      args: [`0x${itemId}`, BigInt(claimIndex)],
      account: address!,
      chain: chain!,
    })
    refetchClaims()
  }

  const generateQR = async () => {
    if (!qrRef.current || typeof window === 'undefined') return
    // Assuming the encryption key was stored or can be regenerated
    const url = `${window.location.origin}/found/${itemId}?key=YOUR_ENCRYPTION_KEY`
    await QRCode.toCanvas(qrRef.current, url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <img src="/logo.svg" alt="Nostos" className="h-10" />
            </Link>
            <PortoAuth />
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-muted-foreground">This item does not exist or has been removed</p>
          </div>
        </main>
      </div>
    )
  }

  const [owner, rewardAmount, registrationTime, _encryptedDetails, isActive] = item
  const isOwner = address && address.toLowerCase() === owner.toLowerCase()
  const pendingClaims = claims ? claims.filter((c) => c[2] === 0) : []
  const approvedClaims = claims ? claims.filter((c) => c[2] === 1) : []
  const rejectedClaims = claims ? claims.filter((c) => c[2] === 2) : []

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <img src="/logo.svg" alt="Nostos" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            {isOwner && (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}
            <PortoAuth />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Transaction Status */}
        {(approveHash || rejectHash) && (!isApproveSuccess && !isRejectSuccess) && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-lg border border-blue-300 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Transaction Pending</p>
                <p className="text-sm mt-1">
                  {approveHash ? 'Approving claim...' : 'Rejecting claim...'}
                </p>
              </div>
              <BlockExplorerLink hash={approveHash || rejectHash || ''}>View Transaction</BlockExplorerLink>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {isApproveSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-4 rounded-lg border border-green-300 dark:border-green-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Claim Approved!</p>
                <p className="text-sm mt-1">The claim has been successfully approved.</p>
              </div>
              {approveHash && <BlockExplorerLink hash={approveHash} />}
            </div>
          </div>
        )}

        {isRejectSuccess && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-300 dark:border-red-900/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Claim Rejected</p>
                <p className="text-sm mt-1">The claim has been rejected.</p>
              </div>
              {rejectHash && <BlockExplorerLink hash={rejectHash} />}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(approveError || rejectError) && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-300 dark:border-red-900/30">
            <p className="font-semibold">Transaction Error</p>
            <p className="text-sm mt-1">{(approveError || rejectError)?.message}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Item Details */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">Item Details</h1>
              {isActive ? (
                <span className="px-3 py-1 text-sm bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-sm bg-red-500/10 text-red-600 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Item ID</dt>
                <dd className="font-mono text-sm">{itemId}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Owner</dt>
                <dd className="font-mono text-sm">
                  {isOwner ? 'You' : `${owner.slice(0, 6)}...${owner.slice(-4)}`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Reward Amount</dt>
                <dd className="font-semibold text-green-600">{formatEther(rewardAmount)} ETH</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Registered</dt>
                <dd>{formatDateTime(registrationTime)}</dd>
              </div>
            </dl>

            {isOwner && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">QR Code</h3>
                <div className="flex items-center gap-4">
                  <canvas ref={qrRef} className="border rounded" />
                  <div className="space-y-2">
                    <Button onClick={generateQR} variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      Regenerate QR
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Print this QR code and attach it to your item
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Claims Section */}
          {isOwner && (
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-bold mb-4">Claims</h2>
              
              {/* Pending Claims */}
              {pendingClaims.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Pending Claims ({pendingClaims.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingClaims.map((claim, index: number) => (
                      <ClaimCard
                        key={index}
                        claim={claim}
                        index={claims ? claims.indexOf(claim) : 0}
                        onApprove={() => handleApprove(claims ? claims.indexOf(claim) : 0)}
                        onReject={() => handleReject(claims ? claims.indexOf(claim) : 0)}
                        isApproving={isApproving}
                        isRejecting={isRejecting}
                        ownerPrivateKey={address} // This would need actual private key for decryption
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Claims */}
              {approvedClaims.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Approved Claims ({approvedClaims.length})
                  </h3>
                  <div className="space-y-3">
                    {approvedClaims.map((claim: any, index: number) => (
                      <div key={index} className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-mono">
                              Finder: {claim[0].slice(0, 6)}...{claim[0].slice(-4)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Claimed: {formatDateTime(claim[1])}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Claims */}
              {rejectedClaims.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Rejected Claims ({rejectedClaims.length})
                  </h3>
                  <div className="space-y-3">
                    {rejectedClaims.map((claim: any, index: number) => (
                      <div key={index} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-mono">
                              Finder: {claim[0].slice(0, 6)}...{claim[0].slice(-4)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Claimed: {formatDateTime(claim[1])}
                            </p>
                          </div>
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {claims && claims.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No claims have been submitted for this item yet
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ClaimCard({ 
  claim, 
  _index, 
  onApprove, 
  onReject, 
  isApproving, 
  isRejecting,
  _ownerPrivateKey 
}: any) {
  const [decryptedContact, setDecryptedContact] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  const handleDecrypt = () => {
    setIsDecrypting(true)
    try {
      // In production, this would use the actual owner's private key
      // For now, we'll show the encrypted data
      const _contactHex = claim[3] as string
      // const decrypted = decryptContactInfo(_contactHex.slice(2), _ownerPrivateKey)
      // setDecryptedContact(decrypted)
      setDecryptedContact("Contact info would be decrypted here with owner's private key")
    } catch (error) {
      console.error('Failed to decrypt contact info:', error)
      setDecryptedContact("Failed to decrypt contact information")
    } finally {
      setIsDecrypting(false)
    }
  }

  return (
    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-mono">
              Finder: {claim[0].slice(0, 6)}...{claim[0].slice(-4)}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {formatDateTime(claim[1])}
            </p>
          </div>
        </div>

        {!decryptedContact ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="w-full"
          >
            {isDecrypting ? 'Decrypting...' : 'View Contact Information'}
          </Button>
        ) : (
          <div className="p-3 bg-background rounded border">
            <p className="text-sm font-semibold mb-1">Contact Information:</p>
            <p className="text-sm whitespace-pre-wrap">{decryptedContact}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="flex-1"
          >
            {isApproving ? 'Approving...' : 'Approve & Pay Reward'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onReject}
            disabled={isApproving || isRejecting}
            className="flex-1"
          >
            {isRejecting ? 'Rejecting...' : 'Reject Claim'}
          </Button>
        </div>
      </div>
    </div>
  )
}