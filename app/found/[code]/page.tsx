"use client"

import { useParams, useSearchParams } from 'next/navigation'
import { ClaimForm } from '@/components/ClaimForm'
import { Navigation } from '@/components/Navigation'

export default function FoundItemPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const itemId = params.code as string
  const _encryptionKey = searchParams.get('key')

  if (!itemId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Item ID</h1>
          <p className="text-amber-100/70">
            Please provide a valid item ID to claim a found item.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent pb-1">You Found a Lost Item!</h1>
          <p className="text-amber-100/70">
            Thank you for helping return this item to its owner.
          </p>
        </div>
        
        <ClaimForm 
          itemId={itemId} 
          qrUrl={typeof window !== 'undefined' ? window.location.href : undefined} 
        />
      </main>
    </div>
  )
}