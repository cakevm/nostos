interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    isMetaMask?: boolean
    isPorto?: boolean
    isIthaca?: boolean
    on?: (event: string, callback: (...args: any[]) => void) => void
    removeListener?: (event: string, callback: (...args: any[]) => void) => void
  }
}