"use client"

import { Package, QrCode, CheckCircle, ArrowRight, Wallet, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-stone-900">
      <Navigation />
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-300 dark:to-amber-400 bg-clip-text text-transparent">
            How Nostos Works
          </h1>
          <p className="text-xl text-slate-600 dark:text-stone-400 max-w-3xl mx-auto mb-8">
            Blockchain-powered lost & found system with private rewards and pay-on-claim model
          </p>
          
          {/* Porto Sponsoring Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-200">
                Powered by Porto Sponsoring
              </h2>
            </div>
            <div className="text-center">
              <p className="text-lg text-slate-700 dark:text-stone-300 mb-4">
                <strong>This use case is made possible thanks to Porto&apos;s transaction sponsoring.</strong>
              </p>
              <p className="text-slate-600 dark:text-stone-400 max-w-2xl mx-auto">
                Finders don&apos;t need to own crypto or understand blockchain technology. 
                Porto sponsors the gas fees, making it as easy as scanning a QR code and filling out a form.
                No wallet setup, no ETH required, no crypto knowledge needed.
              </p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                ✨ Zero-friction experience for everyday users
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-stone-200">
            Simple 3-Step Process
          </h2>
          
          {/* Registration Flow */}
          <div className="mb-16">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-stone-800">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-medium">
                  For Item Owners
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
                {/* Step 1 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Package className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Register Item</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    Add item details & reward amount. Pay only 0.0005 ETH stake.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Reward stays private & encrypted
                  </div>
                </div>

                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400 dark:text-stone-500" />
                </div>

                {/* Step 2 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                      <QrCode className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Print QR Label</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    Download & attach QR code to your item. Contains encrypted data.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Works even when item is offline
                  </div>
                </div>

                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400 dark:text-stone-500" />
                </div>

                {/* Step 3 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Get Notified</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    When found, pay reward to see finder contact & arrange return.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Pay only when item is actually found
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Finding Flow */}
          <div className="mb-16">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-stone-800">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  For Finders
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
                {/* Step 1 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <QrCode className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Scan QR Code</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    Use camera to scan QR on found item. See basic item info.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Works with any smartphone
                  </div>
                </div>

                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400 dark:text-stone-500" />
                </div>

                {/* Step 2 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Wallet className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Submit Contact</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    Connect wallet & provide your contact info. Gets encrypted.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    ✨ Porto sponsors the gas fees - no ETH needed
                  </div>
                </div>

                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-slate-400 dark:text-stone-500" />
                </div>

                {/* Step 3 */}
                <div className="text-center flex-1 max-w-xs">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-stone-200">Get Rewarded</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400 mb-3">
                    Owner contacts you. After returning item, receive reward automatically.
                  </p>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Reward sent to your wallet instantly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-stone-200">Secure & Private</h3>
            <p className="text-slate-600 dark:text-stone-400">
              Rewards encrypted with your wallet. Only you control access.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-stone-200">Pay-on-Claim</h3>
            <p className="text-slate-600 dark:text-stone-400">
              Small stake upfront. Reward paid only when item is found.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-stone-200">Blockchain Powered</h3>
            <p className="text-slate-600 dark:text-stone-400">
              Immutable records on Ethereum. No central authority needed.
            </p>
          </div>
        </div>

        {/* Security & Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-800 dark:text-stone-200">
            Why Nostos is Better
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">No Upfront Payment</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">Pay rewards only when items are actually found</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">Private Rewards</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">Reward amounts encrypted and hidden from public view</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">Fraud Protection</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">Finders can only claim after owner confirms return</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">Decentralized</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">No company controls your data or can shut down the service</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">Zero Crypto Knowledge</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">Porto sponsoring means finders need no wallet, no ETH, no setup</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-stone-200">Transparent</h3>
                  <p className="text-sm text-slate-600 dark:text-stone-400">All transactions recorded on blockchain for transparency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg">
                Register Your First Item
              </Button>
            </Link>
            <Link href="/scanner">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Scan Found Item
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}