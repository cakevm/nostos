#!/bin/bash

# Git Hooks Setup Script
# Automatically run quality checks before commits and pushes

echo "🔧 Setting up Git Hooks"
echo "======================"
echo ""

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook
echo "Installing pre-commit hook..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit checks..."
make pre-commit
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed. Please fix the issues before committing."
    exit 1
fi
echo "✅ Pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed"

# Pre-push hook
echo "Installing pre-push hook..."
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "🚀 Running pre-push checks..."
make pre-release
if [ $? -ne 0 ]; then
    echo "❌ Pre-release checks failed. Please fix the issues before pushing."
    echo ""
    echo "To bypass (NOT recommended for main branch):"
    echo "  git push --no-verify"
    exit 1
fi
echo "✅ All checks passed! Pushing to remote..."
EOF

chmod +x .git/hooks/pre-push
echo "✅ Pre-push hook installed"

echo ""
echo "🎉 Git hooks successfully installed!"
echo ""
echo "What happens now:"
echo "• Before commit: Runs 'make pre-commit' (lint + typecheck)"
echo "• Before push:   Runs 'make pre-release' (lint + typecheck + build + tests)"
echo ""
echo "To skip hooks (use sparingly):"
echo "• git commit --no-verify"
echo "• git push --no-verify"
echo ""
echo "To uninstall hooks:"
echo "• rm .git/hooks/pre-commit"
echo "• rm .git/hooks/pre-push"