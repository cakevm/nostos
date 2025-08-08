"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import { BoatAnimation } from '@/components/BoatAnimation'
import { Presentation } from '@/components/Presentation'
import { Shield, QrCode, Search, Gift, Lock, Zap, Play } from 'lucide-react'

export default function Home() {
  const [showPresentation, setShowPresentation] = useState(false)

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation showRegisterButton />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <BoatAnimation />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/70 dark:via-amber-300/60 dark:to-amber-200/70 bg-clip-text text-transparent pb-2">
            Never Lose Your Valuables Again
          </h1>
          <p className="text-xl text-slate-700 dark:text-stone-300/70 mb-8 max-w-2xl mx-auto">
            A blockchain-powered lost and found system that reunites you with your belongings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-700/80 dark:hover:bg-amber-600/80 text-white border-0">
                Register Item
              </Button>
            </Link>
            <Link href="/found">
              <Button size="lg" className="font-semibold bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white border-0">
                <Search className="mr-2 h-5 w-5" />
                Found Something?
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-semibold border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={() => setShowPresentation(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              View Presentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-stone-100/50 to-stone-50 dark:from-slate-900/50 dark:to-slate-950">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-stone-200">Why Choose Nostos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur p-6 rounded-xl border border-amber-200/30 dark:border-amber-900/10 shadow-sm hover:shadow-md dark:hover:shadow-amber-900/10 transition-all">
              <Shield className="h-12 w-12 text-amber-600 dark:text-amber-300/60 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-stone-200">Secure & Private</h3>
              <p className="text-slate-600 dark:text-stone-400/70">
                Your personal information is encrypted on-chain. Only you can decrypt it with your unique key.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur p-6 rounded-xl border border-amber-200/30 dark:border-amber-900/10 shadow-sm hover:shadow-md dark:hover:shadow-amber-900/10 transition-all">
              <QrCode className="h-12 w-12 text-amber-600 dark:text-amber-300/60 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-stone-200">QR Code Labels</h3>
              <p className="text-slate-600 dark:text-stone-400/70">
                Generate unique QR codes for your items. Finders scan to instantly connect with you.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur p-6 rounded-xl border border-amber-200/30 dark:border-amber-900/10 shadow-sm hover:shadow-md dark:hover:shadow-amber-900/10 transition-all">
              <Gift className="h-12 w-12 text-amber-600 dark:text-amber-300/60 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-stone-200">Reward System</h3>
              <p className="text-slate-600 dark:text-stone-400/70">
                Incentivize honest finders with rewards. Set your own reward amount for each item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-stone-200">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-stone-200">For Item Owners</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">1</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Register Your Item</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Add item details and set a reward amount</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">2</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Get QR Code</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Print and attach the unique QR code to your item</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">3</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Receive Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Get notified when someone finds your item</p>
                  </div>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-stone-200">For Finders</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">1</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Scan QR Code</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Use any QR scanner to access the claim page</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">2</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Submit Contact Info</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Securely share your contact details (sponsored transaction)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700/50 dark:to-amber-800/50 text-slate-800 dark:text-stone-200 rounded-full flex items-center justify-center font-semibold shadow-sm">3</span>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-stone-200">Get Rewarded</p>
                    <p className="text-sm text-slate-500 dark:text-stone-400/60">Receive the reward for returning the item</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-stone-50 to-stone-100/50 dark:from-slate-950 dark:to-slate-900/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-stone-200">Powered by Blockchain</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur p-6 rounded-xl border border-amber-200/30 dark:border-amber-900/10 shadow-sm hover:shadow-md dark:hover:shadow-amber-900/10 transition-all">
              <Lock className="h-10 w-10 text-amber-600 dark:text-amber-300/50 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-stone-200">End-to-End Encryption</h3>
              <p className="text-sm text-slate-500 dark:text-stone-400/60">
                Item details are encrypted with AES-256. Contact information uses public key encryption. Only authorized parties can decrypt.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur p-6 rounded-xl border border-amber-200/30 dark:border-amber-900/10 shadow-sm hover:shadow-md dark:hover:shadow-amber-900/10 transition-all">
              <Zap className="h-10 w-10 text-amber-600 dark:text-amber-300/50 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-stone-200">Sponsored Transactions</h3>
              <p className="text-sm text-slate-500 dark:text-stone-400/60">
                Finders don't need crypto wallets or ETH. Porto authentication enables gasless claims through sponsored transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Protecting Your Items Today</h2>
          <p className="text-slate-600 dark:text-stone-300/60 mb-8 max-w-xl mx-auto">
            For just $5 per item, get lifetime protection with our blockchain-secured lost and found system.
          </p>
          <Link href="/register">
            <Button size="lg" className="font-semibold">
              Register Your First Item
            </Button>
          </Link>
        </div>
      </section>

      {/* Floating Found Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Link href="/found">
          <Button className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold shadow-lg hover:shadow-xl rounded-full p-4 h-16 w-16 border-0">
            <Search className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-200/20 dark:border-amber-900/10 bg-stone-100/50 dark:bg-slate-900/50 py-8 px-4">
        <div className="container mx-auto text-center text-sm text-slate-600 dark:text-stone-400/60">
          <p className="font-medium text-slate-700 dark:text-stone-300">&copy; 2025 Nostos</p>
          <p className="mt-2">
            Powered by blockchain technology
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300/60 text-xs border border-amber-300 dark:border-amber-900/20">
              <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400/60 animate-pulse"></div>
              Sepolia & Base Sepolia
            </span>
          </div>
        </div>
      </footer>
    </div>
    
    {showPresentation && (
      <Presentation onClose={() => setShowPresentation(false)} />
    )}
    </>
  )
}