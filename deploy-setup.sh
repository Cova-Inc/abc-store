#!/bin/bash

# ABC Store Production Deployment Setup Script
# This script helps set up the production environment

echo "🚀 ABC Store Production Setup"
echo "=============================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
   echo "Please run with sudo: sudo bash deploy-setup.sh"
   exit 1
fi

# Create upload directory with proper permissions
echo "📁 Creating upload directory..."
mkdir -p /var/www/html/uploads/products
chown -R www-data:www-data /var/www/html/uploads
chmod -R 755 /var/www/html/uploads

sudo groupadd uploads 2>/dev/null || true
sudo usermod -aG uploads administrator
sudo usermod -aG uploads www-data

# Set ownership to the shared group and grant group write
sudo chown -R administrator:uploads /var/www/html/uploads
sudo chmod -R 2775 /var/www/html/uploads

echo "✅ Upload directory created at /var/www/html/uploads/products"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "⚠️  Nginx is not installed. Install it with:"
    echo "   sudo apt-get update && sudo apt-get install nginx"
    exit 1
fi

# Copy nginx configuration
echo "🔧 Setting up Nginx configuration..."
if [ -f "nginx.conf.example" ]; then
    cp nginx.conf.example /etc/nginx/sites-available/abc-store
    echo "✅ Nginx config copied to /etc/nginx/sites-available/abc-store"
    echo ""
    echo "⚠️  IMPORTANT: Edit the configuration file to set your domain:"
    echo "   sudo nano /etc/nginx/sites-available/abc-store"
    echo ""
    echo "Then enable the site:"
    echo "   sudo ln -sf /etc/nginx/sites-available/abc-store /etc/nginx/sites-enabled/abc-store"
    echo "   sudo nginx -t"
    echo "   sudo systemctl reload nginx"
else
    echo "❌ nginx.conf.example not found"
fi

sudo ln -sf /etc/nginx/sites-available/abc-store /etc/nginx/sites-enabled/abc-store
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx


echo ""
echo "📝 Environment Setup:"
echo "====================="
echo "1. Create production environment file:"
echo "   cp .env.example .env.production"
echo ""
echo "2. Edit .env.production and set:"
echo "   NODE_ENV=production"
echo "   UPLOAD_DIR=/var/www/html/uploads/products"
echo "   NEXT_PUBLIC_SERVER_URL=https://your-domain.com"
echo "   NEXT_PUBLIC_ASSET_URL=https://your-domain.com"
echo ""
echo "3. Build and start the application:"
echo "   npm run build"
echo "   NODE_ENV=production npm start"
echo ""
echo "🎉 Setup complete! Your uploads will be served by nginx from /uploads/"