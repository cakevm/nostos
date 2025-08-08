"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { MyItems } from '@/components/MyItems'
import { FoundItems } from '@/components/FoundItems'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Package, Plus, TrendingUp, DollarSign, Clock, Search } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'registered' | 'found'>('registered')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-stone-950 dark:to-slate-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/60 dark:via-amber-300/50 dark:to-amber-200/60 bg-clip-text text-transparent pb-1">
            My Dashboard
          </h1>
          <p className="text-slate-600 dark:text-stone-300/70">
            Manage your registered items and track claims
          </p>
        </div>

        {!mounted ? (
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-200 mb-2">
              Loading Dashboard...
            </h2>
          </div>
        ) : address ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-slate-500 dark:text-stone-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-stone-200">0</p>
                <p className="text-sm text-slate-600 dark:text-stone-400">Registered Items</p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-slate-500 dark:text-stone-500">Active</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-stone-200">0</p>
                <p className="text-sm text-slate-600 dark:text-stone-400">Items Active</p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-slate-500 dark:text-stone-500">Pending</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-stone-200">0</p>
                <p className="text-sm text-slate-600 dark:text-stone-400">Claims Pending</p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs text-slate-500 dark:text-stone-500">Rewards</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-stone-200">0 ETH</p>
                <p className="text-sm text-slate-600 dark:text-stone-400">Total Rewards</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
              <Link href="/register">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Item
                </Button>
              </Link>
              <Link href="/scan">
                <Button variant="outline">
                  Scan QR Code
                </Button>
              </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === 'registered' ? 'default' : 'outline'}
                onClick={() => setActiveTab('registered')}
              >
                <Package className="mr-2 h-4 w-4" />
                My Registered Items
              </Button>
              <Button
                variant={activeTab === 'found' ? 'default' : 'outline'}
                onClick={() => setActiveTab('found')}
              >
                <Search className="mr-2 h-4 w-4" />
                Items I&apos;ve Found
              </Button>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-stone-900/50 rounded-lg border border-slate-200 dark:border-stone-800 p-6">
              {activeTab === 'registered' ? <MyItems /> : <FoundItems />}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-slate-200 dark:border-stone-800 p-12 text-center">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-200 mb-2">
              Welcome to Your Dashboard
            </h2>
            <p className="text-slate-600 dark:text-stone-400 mb-6">
              Connect your wallet to view and manage your registered items
            </p>
            <p className="text-sm text-slate-500 dark:text-stone-500">
              Use the Porto button in the navigation to connect
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

