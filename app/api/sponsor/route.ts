import { MerchantRpc } from 'porto/server'
import { sepolia } from '@/lib/chains'

export const POST = MerchantRpc.requestHandler({
  address: process.env.MERCHANT_ADDRESS as `0x${string}`,
  key: process.env.MERCHANT_PRIVATE_KEY as `0x${string}`,
  chains: [sepolia],
  sponsor(request) {
    // Sponsor submitClaim function calls on Sepolia (optional - users can pay their own gas)
    if (request.chainId !== sepolia.id) return false
    
    // Check if this is a submitClaim transaction
    const calls = request.calls
    if (calls && calls.length > 0) {
      const firstCall = calls[0]
      // Sponsor if it's a submitClaim function
      return firstCall.functionName === 'submitClaim'
    }
    
    return false
  }
})