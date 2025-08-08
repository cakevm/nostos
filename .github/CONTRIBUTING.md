# Contributing to Nostos

First off, thank you for considering contributing to Nostos! 🏛️

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment details (OS, browser, wallet type)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the setup instructions** in the README
3. **Make your changes:**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Before submitting:**
   - Run `npm run lint` to check code style
   - Run `npm run build` to ensure the app builds
   - Run tests with `npm test` (when available)
   - For smart contracts: run `forge test` in the contracts directory

5. **Submit your PR:**
   - Use the PR template
   - Link any related issues
   - Provide screenshots for UI changes
   - Ensure all CI checks pass

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/nostos.git
cd nostos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# For smart contract development
cd contracts
forge install
forge test
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Build system changes
- `ci:` CI/CD changes
- `chore:` Other changes that don't modify src or test files

Examples:
```
feat: add support for Base mainnet
fix: resolve wallet connection issue with Porto
docs: update README with deployment instructions
```

## Smart Contract Development

When working on smart contracts:

1. Write comprehensive tests for any new functionality
2. Ensure gas optimization where possible
3. Follow Solidity best practices and security patterns
4. Document any new functions or state variables
5. Run `forge fmt` to format your code
6. Run `forge test --gas-report` to check gas usage

## Frontend Guidelines

- Use TypeScript for type safety
- Follow the existing component structure
- Keep components small and focused
- Use Tailwind CSS for styling
- Ensure dark mode compatibility
- Test with both MetaMask and Porto wallets

## Testing

- Write unit tests for utility functions
- Test smart contract interactions on testnet
- Verify QR code generation and scanning
- Test the complete user flow (register → lose → find → return)

## Documentation

- Update the README for new features
- Add JSDoc comments for complex functions
- Update .env.example for new environment variables
- Document any new API endpoints or smart contract functions

## Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Once approved, your PR will be merged
4. Your contribution will be credited in the project

## Security

- Never commit private keys or sensitive data
- Report security vulnerabilities privately to the maintainers
- Follow security best practices for smart contracts
- Validate and sanitize all user inputs

## Questions?

Feel free to open an issue for any questions about contributing!

Thank you for helping make Nostos better! 🚀