#!/bin/bash

# CHECKPOINT 1 DEPLOYMENT SCRIPT
# Run this script to complete deployment

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 CHECKPOINT 1 COMPLETE DEPLOYMENT SCRIPT"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This script will:"
echo "  1. Check your Supabase configuration"
echo "  2. Deploy database schema"
echo "  3. Create test data"
echo "  4. Verify everything works"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the nursing-pwa directory:"
    echo "  cd C:\\Users\\shemh\\OneDrive\\Desktop\\nursing-pwa"
    exit 1
fi

echo "✅ Project directory verified"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Run deployment
echo "════════════════════════════════════════════════════════════════"
echo "Running automated deployment..."
echo "════════════════════════════════════════════════════════════════"
echo ""

node auto-deploy.mjs

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "  1. npm run dev"
    echo "  2. Open http://localhost:3000"
    echo "  3. Test signup flow"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "⚠️  DEPLOYMENT NEEDS YOUR SERVICE KEY"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "The deployment script needs your Supabase Service Role Secret"
    echo "to complete. It will prompt you for it."
    echo ""
fi
