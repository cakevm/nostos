"use client"

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface QRGeneratorProps {
  data: string
  itemName: string
}

export function QRGenerator({ data, itemName }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }, (error) => {
        if (error) console.error('QR Code generation error:', error)
      })

      // Generate data URL for download
      QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
      }, (error, url) => {
        if (!error) setQrDataUrl(url)
      })
    }
  }, [data])

  const downloadQRCode = () => {
    if (qrDataUrl && typeof document !== 'undefined') {
      const link = document.createElement('a')
      link.download = `nostos-${itemName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = qrDataUrl
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white dark:bg-slate-100 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-300 shadow-lg">
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Print this QR code and attach it to your item
        </p>
        <Button onClick={downloadQRCode} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </div>
    </div>
  )
}