import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Check for Porto merchant configuration
  const merchantAddress = process.env.PORTO_MERCHANT_ADDRESS
  const merchantKey = process.env.PORTO_MERCHANT_PRIVATE_KEY
  
  // Porto sponsorship is optional - if not configured, users pay their own gas
  // This is fine as Porto wallets work without sponsorship too
  if (!merchantAddress || !merchantKey) {
    console.log('Porto sponsorship not configured - users will pay their own gas')
    // Return a proper Porto response that allows the transaction to continue
    return NextResponse.json({
      jsonrpc: '2.0',
      id: 1,
      result: null
    })
  }

  try {
    // Dynamically import Porto only if configured
    const { MerchantRpc } = await import('porto/server')
    const { sepolia, baseSepolia } = await import('@/lib/chains')
    
    const handler = MerchantRpc.requestHandler({
      address: merchantAddress as `0x${string}`,
      key: merchantKey as `0x${string}`,
      chains: [sepolia, baseSepolia],
      sponsor(request: any) {
        // ONLY sponsor submitClaim for finders - making it free for good samaritans to return items
        if (request.chainId !== sepolia.id && request.chainId !== 84532) return false // Support Base Sepolia too
        
        // Check transaction calls
        const calls = request.calls
        if (calls && calls.length > 0) {
          const firstCall = calls[0] as any
          
          // Log what function is being called
          console.log('Porto RPC request for function:', firstCall.functionName)
          
          // Sponsor ONLY finder claims (gas-free for good samaritans returning lost items)
          if (firstCall.functionName === 'submitClaim') {
            console.log('Sponsoring submitClaim transaction for finder - FREE returns!')
            return true
          }
          
          // Explicitly log when NOT sponsoring
          if (firstCall.functionName === 'registerItem') {
            console.log('NOT sponsoring registerItem - owner must pay')
          }
        }
        
        // Do NOT sponsor revealContactInfo, confirmReturn, or registerItem - owners should pay
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