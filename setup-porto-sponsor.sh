#!/bin/bash

# Porto Sponsoring Setup Script
# This script helps set up Porto transaction sponsoring for gas-free user experience

echo "🚀 Porto Transaction Sponsoring Setup"
echo "====================================="
echo ""
echo "This will enable gas-free transactions for users with no crypto experience."
echo ""

# Check if Porto is installed
if ! command -v pnpx &> /dev/null; then
    echo "❌ pnpx not found. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "Step 1: Creating Porto Merchant Account"
echo "----------------------------------------"
echo "This will create a sponsor wallet that pays gas fees for your users."
echo ""

# Run Porto onboarding
echo "Running: pnpx porto onboard -a"
pnpx porto onboard -a

echo ""
echo "Step 2: Environment Variables"
echo "-----------------------------"
echo "Add the following to your .env.local file:"
echo ""
echo "# Porto Merchant Account (for gas sponsoring)"
echo "MERCHANT_ADDRESS=<your_merchant_address>"
echo "MERCHANT_PRIVATE_KEY=<your_merchant_private_key>"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "📝 .env.local file found. Please add the above variables manually."
else
    echo "Would you like to create .env.local with placeholders? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        cat > .env.local << 'EOF'
# Porto Merchant Account (for gas sponsoring)
# Get these values from: pnpx porto onboard -a
MERCHANT_ADDRESS=
MERCHANT_PRIVATE_KEY=

# Optional: Vercel URL for production
# NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app
EOF
        echo "✅ Created .env.local with placeholders"
    fi
fi

echo ""
echo "Step 3: Fund Your Merchant Account"
echo "-----------------------------------"
echo "Your merchant account needs ETH to pay for gas fees."
echo ""
echo "For Sepolia testnet:"
echo "  1. Get free test ETH from: https://sepoliafaucet.com"
echo "  2. Send to your MERCHANT_ADDRESS"
echo ""
echo "For Base Sepolia testnet:"
echo "  1. Get free test ETH from: https://docs.base.org/docs/tools/faucets"
echo "  2. Send to your MERCHANT_ADDRESS"
echo ""

echo "Step 4: Test Your Setup"
echo "-----------------------"
echo "1. Start your development server: npm run dev"
echo "2. Visit /found page without a wallet"
echo "3. Click 'Connect Wallet' and choose Porto"
echo "4. Submit a claim - it should be gas-free!"
echo ""

echo "✨ How It Works for Non-Crypto Users:"
echo "--------------------------------------"
echo "1. Users click 'Connect Wallet' on the Found page"
echo "2. Porto creates a wallet instantly (no seed phrases!)"
echo "3. Users sign in with passkey/email (like any web app)"
echo "4. Your merchant account pays all gas fees"
echo "5. Users can claim items with ZERO crypto knowledge!"
echo ""

echo "📚 Documentation:"
echo "- Porto Sponsoring Guide: https://porto.sh/sdk/guides/sponsoring"
echo "- Porto Dashboard: https://porto.sh/dashboard"
echo ""

echo "✅ Setup complete! Your app now supports gas-free transactions for all users."