"use client"

import { useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Loader2, Wallet, ChevronDown, Copy, Check } from 'lucide-react'

export function PortoAuth() {
  const { address, isConnected, chain, connector: activeConnector } = useAccount()
  const { connect, isPending, error } = useConnect()
  const { disconnect, disconnectAsync } = useDisconnect()
  const connectors = useConnectors()
  const [mounted, setMounted] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  // Only show connection state after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Log any connection errors
  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
    }
  }, [error])

  // Find available connectors
  const metamaskConnector = connectors.find(connector => 
    connector.id === 'injected' || 
    connector.id === 'metamask' ||
    connector.name?.toLowerCase().includes('metamask') ||
    connector.name?.toLowerCase().includes('injected')
  )
  
  const portoConnector = connectors.find(connector => 
    connector.id === 'porto' || 
    connector.id === 'xyz.ithaca.porto' ||
    connector.name?.toLowerCase().includes('porto') ||
    connector.name?.toLowerCase().includes('ithaca')
  )

  // Get list of available connectors
  const availableConnectors = [metamaskConnector, portoConnector].filter(Boolean)
  const hasMultipleWallets = availableConnectors.length > 1

  const handleConnect = async (connector: any) => {
    if (!connector) return
    
    try {
      await connect({ connector })
      setShowWalletOptions(false)
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showWalletOptions) {
        setShowWalletOptions(false)
      }
    }
    
    if (showWalletOptions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showWalletOptions])

  // Show loading state during SSR
  if (!mounted) {
    return (
      <Button disabled variant="outline">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  if (isConnected && address) {
    const handleCopyAddress = async () => {
      try {
        await navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy address:', err)
      }
    }

    return (
      <div className="flex items-center gap-2">
        <div 
          className="text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 py-1 transition-colors group relative"
          onClick={handleCopyAddress}
          title="Click to copy address"
        >
          <p className="text-xs text-slate-600 dark:text-stone-400/60">
            {chain?.name || 'Sepolia'}
          </p>
          <div className="flex items-center gap-1">
            <p className="font-mono text-slate-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {copied ? (
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </div>
        </div>
        <Button
          onClick={async () => {
            try {
              if (activeConnector) {
                await disconnectAsync({ connector: activeConnector })
              } else {
                await disconnectAsync()
              }
            } catch (error) {
              console.error('Disconnect error:', error)
            }
          }}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  if (availableConnectors.length === 0) {
    return (
      <Button disabled variant="outline">
        No Wallet Available
      </Button>
    )
  }

  // If only one wallet is available, show simple connect button
  if (!hasMultipleWallets && availableConnectors[0]) {
    return (
      <Button
        onClick={() => handleConnect(availableConnectors[0])}
        variant="outline"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect {availableConnectors[0].name || 'Wallet'}
          </>
        )}
      </Button>
    )
  }

  // Multiple wallets available - show dropdown
  return (
    <div className="relative">
      <Button
        onClick={(e) => {
          e.stopPropagation()
          setShowWalletOptions(!showWalletOptions)
        }}
        variant="outline"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
            <ChevronDown className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      
      {showWalletOptions && !isPending && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-slate-200 dark:border-stone-800 py-1 z-50">
          {metamaskConnector && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleConnect(metamaskConnector)
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-orange-600" />
              <span>MetaMask</span>
            </button>
          )}
          {portoConnector && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleConnect(portoConnector)
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-400 to-purple-600" />
              <span>Porto / Ithaca</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}