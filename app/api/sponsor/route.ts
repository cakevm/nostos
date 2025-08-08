import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Porto sponsorship is optional - return error if not configured
  if (!process.env.MERCHANT_ADDRESS || !process.env.MERCHANT_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'Porto sponsorship not configured' },
      { status: 501 }
    )
  }

  try {
    // Dynamically import Porto only if configured
    const { MerchantRpc } = await import('porto/server')
    const { sepolia } = await import('@/lib/chains')
    
    const handler = MerchantRpc.requestHandler({
      address: process.env.MERCHANT_ADDRESS as `0x${string}`,
      key: process.env.MERCHANT_PRIVATE_KEY as `0x${string}`,
      chains: [sepolia],
      sponsor(request: any) {
        // Sponsor submitClaim function calls on Sepolia (optional - users can pay their own gas)
        if (request.chainId !== sepolia.id) return false
        
        // Check if this is a submitClaim transaction
        const calls = request.calls
        if (calls && calls.length > 0) {
          const firstCall = calls[0] as any
          // Sponsor if it's a submitClaim function
          return firstCall.functionName === 'submitClaim'
        }
        
        return false
      }
    })
    
    return handler(req as any)
  } catch (error) {
    console.error('Porto sponsorship error:', error)
    return NextResponse.json(
      { error: 'Porto sponsorship failed' },
      { status: 500 }
    )
  }
}