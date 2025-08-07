#!/bin/bash

# IPA Server Installation Script for Ubuntu
# This script installs and configures the IPA server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Starting IPA Server installation..."

# Check Ubuntu version
UBUNTU_VERSION=$(lsb_release -rs)
if [[ "$UBUNTU_VERSION" != "20.04" && "$UBUNTU_VERSION" != "22.04" && "$UBUNTU_VERSION" != "24.04" ]]; then
    print_warning "This script is tested on Ubuntu 20.04, 22.04, and 24.04. You are running Ubuntu $UBUNTU_VERSION"
fi

# Update system
print_status "Updating system packages..."
sudo apt update

# Install Node.js and npm
print_status "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js is already installed"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
APP_DIR="$HOME/ipa-server"
print_status "Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"

# Copy application files
print_status "Copying application files..."
cp -r . "$APP_DIR/"

# Navigate to application directory
cd "$APP_DIR"

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create environment file
print_status "Creating environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    print_warning "Please edit .env file and add your GEMINI_API_KEY"
    print_status "You can edit it with: nano $APP_DIR/.env"
fi

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/ipa-server.service > /dev/null <<EOF
[Unit]
Description=IPA Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
print_status "Enabling systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable ipa-server

# Create log rotation configuration
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/ipa-server > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload ipa-server
    endscript
}
EOF

# Set up firewall (optional)
read -p "Do you want to configure firewall for port 3001? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Configuring firewall..."
    sudo ufw allow 3001/tcp
    print_success "Firewall configured for port 3001"
fi

# Create startup script
print_status "Creating startup script..."
tee "$APP_DIR/start.sh" > /dev/null <<EOF
#!/bin/bash
cd "$APP_DIR"
npm start
EOF

chmod +x "$APP_DIR/start.sh"

# Create management script
print_status "Creating management script..."
tee "$APP_DIR/manage.sh" > /dev/null <<EOF
#!/bin/bash

case "\$1" in
    start)
        sudo systemctl start ipa-server
        ;;
    stop)
        sudo systemctl stop ipa-server
        ;;
    restart)
        sudo systemctl restart ipa-server
        ;;
    status)
        sudo systemctl status ipa-server
        ;;
    logs)
        sudo journalctl -u ipa-server -f
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x "$APP_DIR/manage.sh"

# Set proper permissions
print_status "Setting proper permissions..."
chmod 755 "$APP_DIR"
chmod 644 "$APP_DIR/.env"

print_success "Installation completed successfully!"

# Display next steps
echo
print_status "Next steps:"
echo "1. Edit the environment file: nano $APP_DIR/.env"
echo "2. Add your GEMINI_API_KEY to the .env file"
echo "3. Start the server: $APP_DIR/manage.sh start"
echo "4. Check status: $APP_DIR/manage.sh status"
echo "5. View logs: $APP_DIR/manage.sh logs"
echo
print_status "Server will be available at: http://$(hostname -I | awk '{print $1}'):3001"
print_status "API health check: http://$(hostname -I | awk '{print $1}'):3001/api/health"
echo
print_success "Installation script completed!"

