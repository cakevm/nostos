"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Search, ArrowRight, Camera } from 'lucide-react'

export default function FoundPage() {
  const router = useRouter()
  const [itemId, setItemId] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemId && encryptionKey) {
      router.push(`/found/${itemId}?key=${encryptionKey}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600/70 to-green-600/70 dark:from-emerald-700/50 dark:to-green-700/50 rounded-full mb-6 shadow-md">
              <Search className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 dark:from-emerald-300/60 dark:via-green-300/50 dark:to-emerald-300/60 bg-clip-text text-transparent pb-1">
              Found a Lost Item?
            </h1>
            <p className="text-xl text-slate-600 dark:text-stone-300/60">
              Help return it to its owner and earn a reward
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/30 backdrop-blur p-8 rounded-xl border border-slate-200 dark:border-slate-800/30 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700 dark:text-stone-200 flex items-center">
              <QrCode className="mr-3 h-6 w-6 text-emerald-600 dark:text-emerald-400/60" />
              Option 1: Scan QR Code
            </h2>
            <p className="text-slate-600 dark:text-stone-300/60 mb-6">
              If the item has a Nostos QR code label, simply scan it with your phone's camera or QR scanner app. 
              You'll be automatically directed to the claim page.
            </p>
            <Button 
              onClick={() => router.push('/scan')}
              className="w-full mb-4 bg-gradient-to-r from-emerald-600/70 to-green-600/70 hover:from-emerald-500/70 hover:to-green-500/70 dark:from-emerald-700/50 dark:to-green-700/50 text-white font-medium shadow-sm hover:shadow-md"
            >
              <Camera className="mr-2 h-4 w-4" />
              Open QR Scanner
            </Button>
            <div className="bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800/20 rounded-lg p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-400/60">
                💡 Tip: Most modern phones can scan QR codes directly from the camera app
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/30 backdrop-blur p-8 rounded-xl border border-slate-200 dark:border-slate-800/30 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700 dark:text-stone-200 flex items-center">
              <ArrowRight className="mr-3 h-6 w-6 text-emerald-600 dark:text-emerald-400/60" />
              Option 2: Enter Details Manually
            </h2>
            <p className="text-slate-600 dark:text-stone-300/60 mb-6">
              If you have the item ID and encryption key, enter them below:
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemId" className="text-slate-700 dark:text-stone-200">Item ID</Label>
                <Input
                  id="itemId"
                  placeholder="Enter the item ID (e.g., abc123...)"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="key" className="text-slate-700 dark:text-stone-200">Encryption Key</Label>
                <Input
                  id="key"
                  placeholder="Enter the encryption key"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600/70 to-green-600/70 hover:from-emerald-500/70 hover:to-green-500/70 dark:from-emerald-700/50 dark:to-green-700/50 text-white font-medium shadow-sm hover:shadow-md"
              >
                Continue to Claim Form
              </Button>
            </form>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-stone-200">How It Works</h3>
            <div className="space-y-3 text-slate-600 dark:text-stone-400/60">
              <p>1. Scan the QR code or enter the item details</p>
              <p>2. Provide your contact information</p>
              <p>3. The owner will be notified and contact you</p>
              <p>4. Receive your reward for returning the item</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}