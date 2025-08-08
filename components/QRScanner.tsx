"use client"

import { useState, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { X, Camera, CameraOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QRScannerProps {
  onClose?: () => void
}

export function QRScanner({ onClose }: QRScannerProps) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const handleScan = (result: string) => {
    // Prevent multiple scans of the same code
    if (result === lastScanned) return
    setLastScanned(result)
    
    console.log('Scanned QR code:', result)
    
    // Check if it's a Nostos QR code
    try {
      const url = new URL(result)
      
      // Check if it's our domain or localhost
      if (url.pathname.startsWith('/found/')) {
        // Navigate to the found page
        setIsScanning(false)
        router.push(url.pathname + url.search)
      } else {
        setError('This QR code is not a valid Nostos item')
      }
    } catch (err) {
      // Not a valid URL
      setError('Invalid QR code format')
    }
  }

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    if (error?.name === 'NotAllowedError') {
      setError('Camera permission denied. Please allow camera access to scan QR codes.')
    } else if (error?.name === 'NotFoundError') {
      setError('No camera found. Please connect a camera to scan QR codes.')
    } else {
      setError('Failed to access camera')
    }
    setIsScanning(false)
  }

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Close button */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute -top-12 right-0 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        )}

        <div className="bg-slate-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan QR Code
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              Point your camera at a Nostos QR code
            </p>
          </div>

          {/* Scanner */}
          <div className="relative aspect-square bg-black">
            {isScanning ? (
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleScan(result[0].rawValue)
                  }
                }}
                onError={handleError}
                constraints={{
                  facingMode: 'environment',
                  aspectRatio: 1,
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <CameraOff className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Camera not available</p>
                  {error && (
                    <p className="text-amber-400 text-sm mt-2">{error}</p>
                  )}
                  <Button
                    onClick={() => {
                      setError(null)
                      setIsScanning(true)
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-amber-400 rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && isScanning && (
            <div className="bg-amber-950/50 border-t border-amber-900/50 p-4">
              <p className="text-amber-400 text-sm">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-slate-800 p-4 text-center">
            <p className="text-slate-300 text-sm">
              Scan the QR code on a lost item to view its details and submit a claim
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}