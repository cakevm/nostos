# Nostos - The Journey Home for Lost Items

A blockchain-powered lost and found platform that helps reunite people with their belongings through secure QR codes and smart contracts.

> ⚠️ **WARNING: UNAUDITED CONTRACTS**  
> The smart contracts in this project have NOT been audited. Use at your own risk. This is experimental software and should not be used in production with significant value.

> ✅ **Created at Paradigm Frontiers Hackathon**  
> This project was built during the [Paradigm Frontiers](https://frontiers.paradigm.xyz/) hackathon in San Francisco, August 6-8, 2025.

## 🏛️ About

Nostos draws inspiration from the ancient Greek literary theme of the epic hero's return journey. Every lost item deserves its odyssey home. By combining blockchain technology with simple QR codes, we create a trustless system where honest finders are rewarded for returning lost items.

## ✨ Features

- **🔐 Secure Item Registration**: Register items on-chain with encrypted details using wallet signatures
- **📱 QR Code Labels**: Generate unique QR codes with encrypted item data that work offline
- **💰 Pay-on-Claim Model**: Pay rewards only when items are actually found (no upfront payment)
- **🔒 Private Rewards**: Reward amounts are encrypted and hidden from public view
- **🔑 Multi-Wallet Support**: Works with MetaMask and Porto/Ithaca wallets
- **⛽ Sponsored Transactions**: Finders don't need crypto, wallets, or ETH - Porto sponsors all gas fees
- **🌐 Multi-chain Support**: Deployed on Sepolia and Base Sepolia
- **🎭 Beautiful UI**: Animated Greek odyssey theme with boat animation and dark mode
- **📊 Dashboard**: Track all your items, claims, and returns in one place

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone https://github.com/yourusername/nostos.git
cd nostos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Visit http://localhost:3000

### Smart Contracts

```bash
cd contracts

# Install dependencies
./install-deps.sh

# Run tests
forge test

# Deploy (configure .env first)
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

## 📦 Deployed Contracts

- **Sepolia**: `0x59c836DF385deF565213fA55883289381373a268`
- **Base Sepolia**: `0xBC3E1381b9f3Ef13E937481DCF9d6ed802dF2BB2`
- **Mainnet**: Not yet deployed

## 🏗️ Project Structure

```
nostos/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utilities and configurations
├── public/           # Static assets
├── contracts/        # Solidity smart contracts
│   ├── src/         # Contract source code
│   ├── test/        # Contract tests
│   └── script/      # Deployment scripts
└── package.json     # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **Blockchain**: Wagmi, Viem, Porto SDK
- **Smart Contracts**: Solidity, Foundry, OpenZeppelin
- **Wallet Integration**: MetaMask, Porto/Ithaca (with passkeys)
- **Deployment**: Vercel

## 💰 Economics

- **Registration Fee**: 0.0005 ETH stake + 0.00025 ETH platform fee
- **Pay-on-Claim**: Rewards are only paid when items are found
- **Stake Return**: Get your stake back when marking item as returned
- **User Rewards**: Set custom rewards (default presets: 0.005, 0.01, 0.025 ETH)
- **Direct Transfer**: Platform fees go directly to configured EOA

## 🔒 Security & Privacy

- **Wallet Signature Encryption**: Item data encrypted using wallet signatures (personal_sign)
- **AES-256-GCM**: Military-grade encryption for all sensitive data
- **Private Rewards**: Reward amounts encrypted and hidden from public
- **Contact Privacy**: Finder contact info only revealed after payment
- **Smart Contract Security**: ClaimStatus enum, reentrancy protection, proper state management
- **No Sensitive Data On-chain**: Only encrypted hashes stored on blockchain

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nostos)

### Environment Variables

```env
# Porto Configuration (Required for sponsoring)
NEXT_PUBLIC_PORTO_APP_ID=your-porto-app-id
PORTO_MERCHANT_ADDRESS=0x...
PORTO_MERCHANT_PRIVATE_KEY=0x...

# Optional: Custom RPC endpoints
NEXT_PUBLIC_RPC_SEPOLIA=https://sepolia.infura.io/v3/...
NEXT_PUBLIC_RPC_BASE_SEPOLIA=https://base-sepolia.infura.io/v3/...
```

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## 📖 How It Works

### For Item Owners
1. **Connect Wallet**: Use MetaMask or Porto/Ithaca (with passkey auth)
2. **Register Item**: Add details and set reward (encrypted with your wallet)
3. **Pay Small Stake**: Only 0.0005 ETH stake + 0.00025 ETH fee
4. **Print QR Label**: Download and attach to your valuable items
5. **Get Notified**: When found, pay reward to reveal finder's contact
6. **Confirm Return**: Mark as returned to get your stake back

### For Finders
1. **Scan QR Code**: Use any smartphone camera to scan
2. **View Item Info**: See basic details (reward amount is hidden)
3. **Submit Contact**: Connect wallet (or use Porto for free) and provide contact info
4. **Zero Gas Fees**: Porto sponsors the transaction - you pay nothing
5. **Get Contacted**: Owner pays to see your info and arranges pickup
6. **Receive Reward**: Automatically sent to your wallet after return

## 🚀 Why Porto is Critical

Porto's transaction sponsoring is what makes Nostos accessible to everyone:

### 🎯 **The UX Problem with Traditional Crypto**
Imagine finding a lost item and wanting to help:
- ❌ Need to create a crypto wallet
- ❌ Need to buy ETH from an exchange
- ❌ Need to understand gas fees
- ❌ Need to manage private keys
- ❌ Too complex for 99% of people

### ✨ **How Porto Solves This**
- ✅ **Zero Friction**: Scan QR → Fill form → Done
- ✅ **No Wallet Setup**: Porto handles everything in the background
- ✅ **No ETH Required**: Transactions are sponsored
- ✅ **No Crypto Knowledge**: Works like any regular web form
- ✅ **Instant Onboarding**: From scan to claim in under 60 seconds

### 💡 **The Magic**
Porto sponsors the gas fees for finders, making the blockchain invisible to non-crypto users. This transforms a complex Web3 interaction into a simple Web2-like experience. Without Porto, this use case wouldn't be viable for mainstream adoption.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- Porto by Ithaca for authentication and transaction sponsoring
- OpenZeppelin for secure contract libraries
- Paradigm Frontiers hackathon for the opportunity
- **Built with [Claude Code](https://claude.ai/code)** - This entire project was vibe-coded with Claude Code 🤖✨

---

*Every lost item deserves its journey home* 🏛️⚓