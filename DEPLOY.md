# Deployment Guide for Nostos

## Prerequisites
- Vercel account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Merchant wallet with ETH on Sepolia/Base Sepolia for sponsoring transactions

## Step 1: Prepare Environment Variables

1. Copy `.env.example` to `.env.local` for local testing:
```bash
cp .env.example .env.local
```

2. Update the following in `.env.local`:
   - `MERCHANT_ADDRESS`: Your wallet address that will sponsor transactions
   - `MERCHANT_PRIVATE_KEY`: Private key for the merchant wallet (keep this secret!)

## Step 2: Push to Git Repository

```bash
git add .
git commit -m "Initial Nostos webapp"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Link to existing project or create new
   - Select the webapp directory
   - Accept default settings for Next.js

4. Set environment variables:
```bash
vercel env add NEXT_PUBLIC_PORTO_APP_ID
vercel env add PORTO_MERCHANT_ADDRESS
vercel env add PORTO_MERCHANT_PRIVATE_KEY
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `.` (leave blank or set to root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. Add Environment Variables:
   - `NEXT_PUBLIC_PORTO_APP_ID`: Your Porto app ID
   - `PORTO_MERCHANT_ADDRESS`: Your merchant wallet address
   - `PORTO_MERCHANT_PRIVATE_KEY`: Your merchant private key (mark as sensitive)

5. Click "Deploy"

## Step 4: Post-Deployment

1. Test the deployed app:
   - Visit your Vercel URL
   - Try registering an item
   - Test the QR code scanning flow

2. Custom Domain (optional):
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain

## Important Security Notes

1. **Never commit `.env.local` or any file with private keys to Git**
2. **Use Vercel's environment variables for production secrets**
3. **The merchant private key should only be set in Vercel's dashboard, marked as sensitive**

## Mainnet Deployment

To deploy on Ethereum mainnet:

1. Deploy the contract to mainnet:
```bash
cd ../contracts
forge script script/Deploy.s.sol --rpc-url mainnet --private-key YOUR_DEPLOY_KEY --broadcast
```

2. Update environment variable:
   - `NEXT_PUBLIC_MAINNET_CONTRACT`: [deployed mainnet address]

3. Update `NEXT_PUBLIC_DEFAULT_CHAIN` to `mainnet` when ready

## Monitoring

- Check Vercel dashboard for deployment logs
- Monitor function logs for API routes
- Use Vercel Analytics for usage tracking

## Troubleshooting

### Build Errors
- Check Node version (should be 18.x or higher)
- Clear cache: `rm -rf .next node_modules && npm install`

### Environment Variables Not Working
- Ensure variables starting with `NEXT_PUBLIC_` are properly prefixed
- Redeploy after adding new environment variables

### Porto Authentication Issues
- Verify merchant wallet has sufficient ETH on Sepolia/Base Sepolia
- Check that merchant private key is correctly formatted (0x prefix)
- Ensure Porto app ID is valid

## Support

For issues specific to:
- Smart contracts: Check `contracts/README.md`
- Porto integration: Visit Porto documentation
- Vercel deployment: https://vercel.com/docs