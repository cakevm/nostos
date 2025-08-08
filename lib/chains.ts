import { sepolia, baseSepolia } from 'wagmi/chains'

// Re-export chains for use in other modules
export { sepolia, baseSepolia }

// Contract addresses per chain - Updated with pay-on-claim contract with separated fee/stake
export const CONTRACTS: Record<number, `0x${string}`> = {
  [sepolia.id]: '0x59c836DF385deF565213fA55883289381373a268', // Updated contract with platform fee + stake separation
  [baseSepolia.id]: '0xBC3E1381b9f3Ef13E937481DCF9d6ed802dF2BB2', // Deployed on Base Sepolia
}

export function getContractAddress(chainId: number): `0x${string}` {
  const address = CONTRACTS[chainId]
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn(`Contract not yet deployed on chain ${chainId}`)
    throw new Error(`Contract not deployed on chain ${chainId}. Please switch to Sepolia or Base Sepolia.`)
  }
  
  return address
}

export function getChainConfig(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia
    case baseSepolia.id:
      return baseSepolia
    default:
      console.warn(`Unknown chain ID: ${chainId}, defaulting to Sepolia`)
      return sepolia
  }
}