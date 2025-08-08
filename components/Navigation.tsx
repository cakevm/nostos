"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PortoAuth } from '@/components/PortoAuth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Search, Package, HelpCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

interface NavigationProps {
  showRegisterButton?: boolean
  showDashboardButton?: boolean
}

export function Navigation({ showRegisterButton = false, showDashboardButton = false }: NavigationProps) {
  const { address } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-200/60 dark:via-amber-300/50 dark:to-amber-200/60 bg-clip-text text-transparent">
            Nostos
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/help">
            <Button variant="ghost" size="icon" title="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          {mounted && address && (
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Your Items</span>
              </Button>
            </Link>
          )}
          {showRegisterButton && (
            <Link href="/register">
              <Button variant="ghost">Register Item</Button>
            </Link>
          )}
          {showDashboardButton && (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          )}
          <Link href="/found">
            <Button className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium shadow-sm hover:shadow-md transition-all">
              <Search className="mr-2 h-4 w-4" />
              Found Item
            </Button>
          </Link>
          <ThemeToggle />
          <PortoAuth />
        </div>
      </div>
    </nav>
  )
}