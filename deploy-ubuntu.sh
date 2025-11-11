#!/bin/bash

# RektNow - Ubuntu VPS Deployment Script
# Run this on your Ubuntu server after uploading files

echo "🚀 Starting RektNow deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Install PHP 8.1 with required extensions
echo "🐘 Installing PHP 8.1..."
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.1-fpm php8.1-cli php8.1-curl php8.1-mbstring php8.1-xml -y

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/rektnow
sudo chown -R $USER:$USER /var/www/rektnow

# Note: You need to upload dist/ and backend/ folders here before continuing
echo ""
echo "⚠️  PAUSE: Please upload your files now!"
echo "Upload dist/ to: /var/www/rektnow/dist"
echo "Upload backend/ to: /var/www/rektnow/backend"
echo ""
read -p "Press Enter when files are uploaded..."

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/rektnow
sudo chmod -R 755 /var/www/rektnow

# Create Nginx configuration
echo "⚙️  Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/rektnow > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/rektnow/dist;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy PHP backend
    location /api/ {
        alias /var/www/rektnow/backend/;
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index config.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires max;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
echo "✅ Enabling site..."
sudo ln -sf /etc/nginx/sites-available/rektnow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    
    # Restart services
    echo "🔄 Restarting services..."
    sudo systemctl restart php8.1-fpm
    sudo systemctl restart nginx
    
    # Enable services to start on boot
    sudo systemctl enable php8.1-fpm
    sudo systemctl enable nginx
    
    echo ""
    echo "✅ ✅ ✅ DEPLOYMENT COMPLETE! ✅ ✅ ✅"
    echo ""
    echo "🌐 Your site should now be accessible at:"
    echo "   http://$(curl -s ifconfig.me)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Point your domain DNS to this server IP"
    echo "2. Run: sudo certbot --nginx -d yourdomain.com (for SSL)"
    echo "3. Update Nginx server_name with your domain"
    echo ""
    echo "🔍 Check logs if something doesn't work:"
    echo "   sudo tail -f /var/log/nginx/error.log"
    echo "   sudo systemctl status php8.1-fpm"
    echo ""
else
    echo "❌ Nginx config test failed. Please check the configuration."
    exit 1
fi
