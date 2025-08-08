"use client"

import { useState } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { Camera, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-stone-950 dark:to-slate-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-slate-200 dark:border-stone-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="hidden lg:flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/60 dark:via-amber-300/50 dark:to-amber-200/60 bg-clip-text text-transparent">
                <Home className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Nostos
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/register">
                <Button variant="outline">Register Item</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      {showScanner ? (
        <QRScanner onClose={() => router.push('/')} />
      ) : (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-stone-900 rounded-lg shadow-lg p-8">
              <Camera className="h-16 w-16 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/60 dark:via-amber-300/50 dark:to-amber-200/60 bg-clip-text text-transparent pb-1">
                Scan QR Code
              </h1>
              <p className="text-slate-600 dark:text-stone-300/70 mb-8">
                Use your camera to scan the QR code on a lost item
              </p>
              <Button
                onClick={() => setShowScanner(true)}
                size="lg"
                className="w-full"
              >
                <Camera className="mr-2 h-5 w-5" />
                Open Scanner
              </Button>
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-stone-800">
                <p className="text-sm text-slate-500 dark:text-stone-400">
                  Make sure to allow camera access when prompted
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}