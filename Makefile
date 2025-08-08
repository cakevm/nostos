# Nostos - Blockchain Lost & Found System
# Standard development tasks

.PHONY: help install dev build lint typecheck test clean deploy contracts setup all check

# Default target - show help
help:
	@echo "Nostos Development Commands"
	@echo "============================"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install      - Install all dependencies (Next.js + Contracts)"
	@echo "  make setup        - Full setup (install + build contracts)"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start Next.js development server"
	@echo "  make build        - Build Next.js production bundle"
	@echo "  make preview      - Preview production build locally"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         - Run ESLint"
	@echo "  make lint-fix     - Run ESLint with auto-fix"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make check        - Run all checks (lint + typecheck)"
	@echo ""
	@echo "Smart Contracts:"
	@echo "  make contracts    - Build smart contracts"
	@echo "  make test-contracts - Run contract tests"
	@echo "  make deploy-contracts - Deploy contracts (requires env setup)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean build artifacts and node_modules"
	@echo "  make clean-cache  - Clean Next.js cache"
	@echo "  make clean-all    - Full clean (including node_modules)"
	@echo ""
	@echo "Combined Commands:"
	@echo "  make all          - Full build (install + lint + typecheck + build)"
	@echo "  make pre-commit   - Run checks before committing (lint + typecheck)"
	@echo "  make pre-release  - Run all checks before pushing (lint + typecheck + build + test)"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@if [ -d "contracts" ]; then \
		echo "📦 Installing contract dependencies..."; \
		cd contracts && npm install; \
	fi

# Full setup including contract dependencies
setup: install
	@echo "🔧 Running setup script..."
	@if [ -f "setup.sh" ]; then \
		chmod +x setup.sh && ./setup.sh; \
	else \
		echo "⚠️  setup.sh not found, skipping..."; \
	fi
	@echo "✅ Setup complete!"

# Start development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Build for production
build:
	@echo "🔨 Building for production..."
	npm run build

# Preview production build
preview: build
	@echo "👁️  Starting production preview..."
	npm run start

# Run linter
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# Run linter with auto-fix
lint-fix:
	@echo "🔧 Running ESLint with auto-fix..."
	npm run lint -- --fix

# Run TypeScript type checking
typecheck:
	@echo "📝 Running TypeScript type check..."
	npx tsc --noEmit

# Run all checks
check: lint typecheck
	@echo "✅ All checks passed!"

# Run both lint and typecheck (alias for check)
pre-commit: check

# Run all checks before releasing/pushing to git
.PHONY: pre-release
pre-release:
	@echo "🚀 Running pre-release checks..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "1️⃣  Checking code quality..."
	@$(MAKE) lint
	@echo "✅ Linting passed!"
	@echo ""
	@echo "2️⃣  Checking TypeScript types..."
	@$(MAKE) typecheck
	@echo "✅ Type checking passed!"
	@echo ""
	@echo "3️⃣  Testing production build..."
	@$(MAKE) build
	@echo "✅ Build succeeded!"
	@echo ""
	@if [ -d "contracts" ]; then \
		echo "4️⃣  Testing smart contracts..."; \
		$(MAKE) test-contracts; \
		echo "✅ Contract tests passed!"; \
		echo ""; \
	fi
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✨ All pre-release checks passed!"
	@echo "Ready to release!"

# Build smart contracts
contracts:
	@echo "📜 Building smart contracts..."
	@if [ -d "contracts" ]; then \
		cd contracts && forge build; \
	else \
		echo "⚠️  contracts directory not found"; \
	fi

# Test smart contracts
test-contracts:
	@echo "🧪 Testing smart contracts..."
	@if [ -d "contracts" ]; then \
		cd contracts && forge test -vv; \
	else \
		echo "⚠️  contracts directory not found"; \
	fi

# Deploy smart contracts (requires environment setup)
deploy-contracts:
	@echo "🚀 Deploying smart contracts..."
	@if [ -d "contracts" ]; then \
		cd contracts && forge script script/Deploy.s.sol --broadcast; \
	else \
		echo "⚠️  contracts directory not found"; \
	fi

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf out
	@if [ -d "contracts" ]; then \
		cd contracts && rm -rf out cache; \
	fi

# Clean Next.js cache
clean-cache:
	@echo "🧹 Cleaning Next.js cache..."
	rm -rf .next

# Full clean including node_modules
clean-all: clean
	@echo "🧹 Removing node_modules..."
	rm -rf node_modules
	@if [ -d "contracts" ]; then \
		cd contracts && rm -rf node_modules; \
	fi
	@echo "✨ Full clean complete!"

# Full build process
all: install check build
	@echo "🎉 Full build complete!"

# Deployment helpers
.PHONY: deploy-vercel deploy-github

# Deploy to Vercel
deploy-vercel:
	@echo "🚀 Deploying to Vercel..."
	@if command -v vercel >/dev/null 2>&1; then \
		vercel --prod; \
	else \
		echo "⚠️  Vercel CLI not installed. Install with: npm i -g vercel"; \
	fi

# Trigger GitHub deployment workflow
deploy-github:
	@echo "🚀 Pushing to trigger GitHub deployment..."
	git push origin main

# Development utilities
.PHONY: update-deps audit-deps

# Update dependencies
update-deps:
	@echo "📦 Checking for dependency updates..."
	npx npm-check-updates -i

# Audit dependencies for vulnerabilities
audit-deps:
	@echo "🔒 Auditing dependencies..."
	npm audit
	@if [ -d "contracts" ]; then \
		echo "🔒 Auditing contract dependencies..."; \
		cd contracts && npm audit; \
	fi

# Quality gates for development workflow
.PHONY: verify verify-all

# Quick verification (lint + typecheck)
verify: check
	@echo "✅ Quick verification passed!"

# Full verification before release
verify-all: pre-release
	@echo "✅ Full verification passed!"

# Environment setup helpers
.PHONY: env-example env-check

# Create example environment file
env-example:
	@echo "📝 Creating .env.example..."
	@echo "# Porto Configuration (Optional)" > .env.example
	@echo "NEXT_PUBLIC_PORTO_APP_ID=" >> .env.example
	@echo "" >> .env.example
	@echo "# Contract Addresses" >> .env.example
	@echo "NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=" >> .env.example
	@echo "NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS=" >> .env.example
	@echo "" >> .env.example
	@echo "# RPC URLs (Optional - uses public RPCs by default)" >> .env.example
	@echo "NEXT_PUBLIC_SEPOLIA_RPC_URL=" >> .env.example
	@echo "NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=" >> .env.example
	@echo "✅ Created .env.example"

# Check environment setup
env-check:
	@echo "🔍 Checking environment setup..."
	@if [ -f ".env.local" ]; then \
		echo "✅ .env.local found"; \
	else \
		echo "⚠️  .env.local not found (optional)"; \
	fi
	@if [ -f "contracts/.env" ]; then \
		echo "✅ contracts/.env found"; \
	else \
		echo "⚠️  contracts/.env not found (needed for contract deployment)"; \
	fi

# Port management (useful for development)
.PHONY: kill-port

# Kill process on default Next.js port
kill-port:
	@echo "🔫 Killing process on port 3000..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "✅ Port 3000 is free"

# Quick shortcuts
.PHONY: d b l t c

# Shortcuts for common commands
d: dev
b: build
l: lint
t: typecheck
c: check