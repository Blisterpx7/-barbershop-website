#!/bin/bash

# Barbershop API Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting Barbershop API deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "🛑 Stopping existing processes..."
pm2 stop barbershop-api 2>/dev/null || true
pm2 delete barbershop-api 2>/dev/null || true

# Start the application
echo "▶️ Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
echo "🔧 Setting up PM2 startup script..."
pm2 startup

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application status:"
pm2 status
echo ""
echo "📝 View logs with: pm2 logs barbershop-api"
echo "📊 Monitor with: pm2 monit"
echo "🔄 Restart with: pm2 restart barbershop-api"
