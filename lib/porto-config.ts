import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, baseSepolia } from 'wagmi/chains'
import { porto } from 'porto/wagmi'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia, baseSepolia, mainnet],
  connectors: [
    porto({
      chains: [sepolia, baseSepolia, mainnet],
      transports: {
        [sepolia.id]: http(),
        [baseSepolia.id]: http(),
        [mainnet.id]: http(),
      },
    }),
    injected(), // Fallback to regular wallet
  ],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}