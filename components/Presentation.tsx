"use client"

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Package, QrCode, Shield, Zap, Search, CheckCircle, ArrowRight, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PresentationProps {
  onClose: () => void
}

export function Presentation({ onClose }: PresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark for presentation
  const totalSlides = 7

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextSlide, prevSlide, onClose])

  const slides = [
    // Slide 1: Title with animation
    <div key="slide1" className="flex flex-col items-center justify-center h-full relative">
      {/* Animated background from homepage */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      
      {/* Floating ship animation from homepage */}
      <div className="absolute top-10 right-10 animate-float">
        <svg width="120" height="120" viewBox="0 0 200 200" className="text-amber-600 dark:text-amber-500 opacity-30">
          <path d="M100 40 L140 100 L100 120 L60 100 Z" fill="currentColor" />
          <path d="M100 120 L100 160 L80 140 L100 120" fill="currentColor" opacity="0.7" />
          <path d="M100 120 L120 140 L100 160 L100 120" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-300 dark:to-amber-400 bg-clip-text text-transparent animate-fade-in">
          NOSTOS
        </h1>
        <p className="text-3xl text-slate-600 dark:text-stone-400 mb-4">
          νόστος - The Journey Home
        </p>
        <p className="text-xl text-slate-500 dark:text-stone-500 max-w-2xl mx-auto mb-4">
          Blockchain-powered lost & found system ensuring every item finds its way back
        </p>
        <div className="flex gap-4 justify-center">
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-400">
            🔓 Permissionless
          </span>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-400">
            📜 Smart Contract Based
          </span>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-400">
            🌍 Decentralized
          </span>
        </div>
      </div>
    </div>,

    // Slide 2: The Problem
    <div key="slide2" className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-12 text-slate-800 dark:text-stone-200">The Problem</h2>
      
      <div className="grid grid-cols-3 gap-12 max-w-4xl">
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-red-600 dark:text-red-500">
              <circle cx="50" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M35 45 L65 45 L65 70 Q50 85 35 70 Z" fill="none" stroke="currentColor" strokeWidth="3" />
              <text x="50" y="95" textAnchor="middle" className="text-3xl font-bold" fill="currentColor">?</text>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">14M Items Lost Yearly</h3>
          <p className="text-slate-600 dark:text-stone-400">Airlines alone lose millions of bags</p>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-orange-600 dark:text-orange-500">
              <rect x="20" y="40" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M40 40 L40 30 Q50 20 60 30 L60 40" fill="none" stroke="currentColor" strokeWidth="3" />
              <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Incentive</h3>
          <p className="text-slate-600 dark:text-stone-400">Good samaritans get nothing</p>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-purple-600 dark:text-purple-500">
              <circle cx="30" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="70" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
              <line x1="45" y1="50" x2="55" y2="50" stroke="currentColor" strokeWidth="3" strokeDasharray="2 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Privacy Concerns</h3>
          <p className="text-slate-600 dark:text-stone-400">Sharing contact info is risky</p>
        </div>
      </div>
    </div>,

    // Slide 3: How It Works (3-step process)
    <div key="slide3" className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-12 text-slate-800 dark:text-stone-200">How Nostos Works</h2>
      
      <div className="flex items-center justify-center gap-8 max-w-5xl">
        {/* Step 1 */}
        <div className="text-center flex-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Register & Label</h3>
          <p className="text-slate-600 dark:text-stone-400">
            Add item + reward<br/>
            Print QR sticker
          </p>
        </div>

        <ArrowRight className="h-8 w-8 text-slate-400 dark:text-stone-500 animate-pulse" />

        {/* Step 2 */}
        <div className="text-center flex-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Finder Scans</h3>
          <p className="text-slate-600 dark:text-stone-400">
            Scan QR code<br/>
            Submit contact (FREE!)
          </p>
        </div>

        <ArrowRight className="h-8 w-8 text-slate-400 dark:text-stone-500 animate-pulse" />

        {/* Step 3 */}
        <div className="text-center flex-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Return & Reward</h3>
          <p className="text-slate-600 dark:text-stone-400">
            Owner pays reward<br/>
            Item returned home
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xl text-amber-600 dark:text-amber-400 font-semibold">
          Pay-on-Claim: You only pay rewards when items are actually found!
        </p>
      </div>
    </div>,

    // Slide 4: Porto Integration (Gas-Free)
    <div key="slide4" className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-12 text-slate-800 dark:text-stone-200">Zero Friction for Finders</h2>
      
      <div className="grid grid-cols-2 gap-12 max-w-4xl">
        {/* Without Porto */}
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-8 animate-fade-in-left">
          <h3 className="text-2xl font-bold mb-6 text-slate-700 dark:text-stone-300">
            ❌ Traditional Crypto
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <X className="h-5 w-5" />
              <span>Install MetaMask</span>
            </div>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <X className="h-5 w-5" />
              <span>Buy ETH for gas</span>
            </div>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <X className="h-5 w-5" />
              <span>Manage seed phrases</span>
            </div>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <X className="h-5 w-5" />
              <span>Understand gas fees</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">Most people give up here 😔</p>
          </div>
        </div>

        {/* With Porto */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8 border-2 border-green-300 dark:border-green-700 animate-fade-in-right">
          <h3 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-300">
            ✨ With Porto
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>One-click connection</span>
            </div>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>FREE - no gas needed!</span>
            </div>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Sign in with email/passkey</span>
            </div>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Works like any app</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Anyone can help! 🎉</p>
          </div>
        </div>
      </div>

      <div className="mt-8 animate-bounce">
        <div className="bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-full">
          <p className="text-green-700 dark:text-green-300 font-semibold">
            We sponsor all gas fees for good samaritans!
          </p>
        </div>
      </div>
    </div>,

    // Slide 5: Key Features
    <div key="slide5" className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-12 text-slate-800 dark:text-stone-200">Why Nostos?</h2>
      
      <div className="grid grid-cols-3 gap-8 max-w-5xl">
        <div className="text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
          <p className="text-slate-600 dark:text-stone-400 text-sm">
            Encrypted rewards & contacts on blockchain
          </p>
        </div>

        <div className="text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pay When Found</h3>
          <p className="text-slate-600 dark:text-stone-400 text-sm">
            Only pay rewards when items are claimed
          </p>
        </div>

        <div className="text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="48" height="48" viewBox="0 0 100 100" className="text-purple-700 dark:text-purple-400">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M50 30 L65 45 L50 55 L35 45 Z" fill="currentColor" opacity="0.4" />
              <path d="M50 45 L65 60 L50 70 L35 60 Z" fill="currentColor" opacity="0.6" />
              <path d="M50 60 L65 75 L50 85 L35 75 Z" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
          <p className="text-slate-600 dark:text-stone-400 text-sm">
            Permissionless & trustless on Ethereum
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-6 max-w-4xl">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl p-5 border border-amber-200 dark:border-amber-800/30">
          <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">For Owners</h4>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-stone-400">
            <li>• Higher return rate</li>
            <li>• Pay only on success</li>
            <li>• Secure & private</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800/30">
          <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">For Finders</h4>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-stone-400">
            <li>• Completely FREE</li>
            <li>• Get rewarded</li>
            <li>• No crypto knowledge</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800/30">
          <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-2">Platform</h4>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-stone-400">
            <li>• Permissionless</li>
            <li>• No middleman</li>
            <li>• Always available</li>
          </ul>
        </div>
      </div>
    </div>,

    // Slide 6: Permissionless & Decentralized
    <div key="slide6" className="flex flex-col items-center justify-center h-full">
      <h2 className="text-5xl font-bold mb-12 text-slate-800 dark:text-stone-200">
        Truly Decentralized & Permissionless
      </h2>
      
      <div className="grid grid-cols-2 gap-12 max-w-5xl">
        {/* Smart Contract Benefits */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800/30">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
              <svg width="32" height="32" viewBox="0 0 100 100" className="mr-3 text-indigo-700 dark:text-indigo-300">
                <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="30" r="5" fill="currentColor" />
                <circle cx="30" cy="50" r="5" fill="currentColor" />
                <circle cx="70" cy="50" r="5" fill="currentColor" />
                <circle cx="50" cy="70" r="5" fill="currentColor" />
                <line x1="50" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="30" x2="70" y2="50" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
                <line x1="70" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
              </svg>
              100% On-Chain
            </h3>
            <ul className="space-y-3 text-slate-700 dark:text-stone-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>No servers needed</strong> - Runs on Ethereum</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>No company control</strong> - Community owned</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Always available</strong> - 24/7/365 uptime</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Censorship resistant</strong> - No one can stop it</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Permissionless Access */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/30">
            <h3 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-300 flex items-center">
              <svg width="32" height="32" viewBox="0 0 100 100" className="mr-3 text-amber-700 dark:text-amber-300">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M50 25 L50 75" stroke="currentColor" strokeWidth="3" />
                <path d="M25 50 L75 50" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="25" r="5" fill="currentColor" />
                <circle cx="75" cy="50" r="5" fill="currentColor" />
                <circle cx="50" cy="75" r="5" fill="currentColor" />
                <circle cx="25" cy="50" r="5" fill="currentColor" />
              </svg>
              Permissionless
            </h3>
            <ul className="space-y-3 text-slate-700 dark:text-stone-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>No sign-ups</strong> - Just connect & use</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>No approvals</strong> - Instant access for all</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>No geo-blocks</strong> - Works worldwide</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Open source</strong> - Verify & contribute</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 max-w-3xl">
        <p className="text-center text-slate-700 dark:text-stone-300">
          <strong className="text-slate-800 dark:text-stone-200">Smart Contract Address:</strong><br/>
          <code className="text-sm font-mono text-amber-600 dark:text-amber-400">
            Sepolia: 0x59c836DF385deF565213fA55883289381373a268
          </code><br/>
          <code className="text-sm font-mono text-amber-600 dark:text-amber-400">
            Base: 0xBC3E1381b9f3Ef13E937481DCF9d6ed802dF2BB2
          </code>
        </p>
      </div>
    </div>,

    // Slide 7: Call to Action
    <div key="slide7" className="flex flex-col items-center justify-center h-full relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-300 dark:to-amber-400 bg-clip-text text-transparent">
          Start Your Nostos Journey
        </h2>
        
        <p className="text-2xl text-slate-600 dark:text-stone-400 mb-12 max-w-2xl mx-auto">
          Join thousands protecting their valuables with blockchain technology
        </p>

        <div className="flex gap-6 justify-center mb-12">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-xl"
              onClick={onClose}
            >
              <Package className="mr-2 h-6 w-6" />
              Register Items
            </Button>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-xl border-2"
              onClick={onClose}
            >
              <Search className="mr-2 h-6 w-6" />
              Found Something?
            </Button>
          </div>
        </div>

        <div className="text-slate-500 dark:text-stone-500">
          <p className="text-sm mb-2">🔗 Smart Contracts Deployed on</p>
          <div className="flex gap-4 justify-center mb-4">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
              Sepolia Testnet
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
              Base Sepolia
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-stone-600">
            Open source • Permissionless • No central authority
          </p>
        </div>
      </div>
    </div>
  ]

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'dark' : ''}`}>
      <div className={`w-full h-full ${isDarkMode ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-sm`}>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute bottom-4 left-4 p-2 rounded-lg ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
            } transition-colors`}
            aria-label="Close presentation"
          >
            <X className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>

          {/* Theme toggle button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute top-4 right-4 p-2 rounded-lg ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
            } transition-colors`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6 text-yellow-400" />
            ) : (
              <Moon className="h-6 w-6 text-slate-700" />
            )}
          </button>

          {/* Slide content */}
          <div className="w-full max-w-7xl mx-auto px-8 h-[80vh]">
            {slides[currentSlide]}
          </div>

          {/* Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
              } transition-colors`}
              aria-label="Previous slide"
            >
              <ChevronLeft className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </button>

            {/* Slide indicators */}
            <div className="flex gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide 
                      ? 'w-8 bg-amber-500' 
                      : isDarkMode ? 'bg-white/30 hover:bg-white/50' : 'bg-black/30 hover:bg-black/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
              } transition-colors`}
              aria-label="Next slide"
            >
              <ChevronRight className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </button>
          </div>

          {/* Keyboard hints */}
          <div className={`absolute top-4 left-4 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
            <span>Use ← → arrows or space to navigate</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out both;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out both;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  )
}