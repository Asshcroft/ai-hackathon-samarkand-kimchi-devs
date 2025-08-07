#!/bin/bash

# IPA Client Installation Script for Ubuntu
# This script installs and configures the IPA console client

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

print_status "Starting IPA Client installation..."

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

# Create application directory
APP_DIR="$HOME/ipa-client"
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

# Create configuration file
print_status "Creating configuration file..."
if [ ! -f config.json ]; then
    cat > config.json <<EOF
{
  "server": {
    "host": "localhost",
    "port": 3001,
    "protocol": "http"
  },
  "client": {
    "name": "IPA Console Client",
    "version": "1.0.0",
    "reconnectAttempts": 5,
    "reconnectDelay": 3000
  },
  "display": {
    "colors": true,
    "timestamps": true,
    "maxMessageLength": 1000
  }
}
EOF
    print_warning "Please edit config.json and update server settings"
fi

# Create desktop shortcut
print_status "Creating desktop shortcut..."
cat > "$HOME/Desktop/IPA Client.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=IPA Client
Comment=IPA Console Client
Exec=gnome-terminal --working-directory=$APP_DIR -- npm start
Icon=terminal
Terminal=true
Categories=Utility;TerminalEmulator;
EOF

chmod +x "$HOME/Desktop/IPA Client.desktop"

# Create launcher script
print_status "Creating launcher script..."
tee "$APP_DIR/launch.sh" > /dev/null <<EOF
#!/bin/bash
cd "$APP_DIR"
npm start
EOF

chmod +x "$APP_DIR/launch.sh"

# Create configuration script
print_status "Creating configuration script..."
tee "$APP_DIR/configure.sh" > /dev/null <<EOF
#!/bin/bash

echo "IPA Client Configuration"
echo "========================"
echo

# Get server host
read -p "Enter server host/IP [localhost]: " SERVER_HOST
SERVER_HOST=\${SERVER_HOST:-localhost}

# Get server port
read -p "Enter server port [3001]: " SERVER_PORT
SERVER_PORT=\${SERVER_PORT:-3001}

# Get server protocol
read -p "Enter server protocol [http]: " SERVER_PROTOCOL
SERVER_PROTOCOL=\${SERVER_PROTOCOL:-http}

# Update config.json
cat > config.json <<CONFIGEOF
{
  "server": {
    "host": "$SERVER_HOST",
    "port": $SERVER_PORT,
    "protocol": "$SERVER_PROTOCOL"
  },
  "client": {
    "name": "IPA Console Client",
    "version": "1.0.0",
    "reconnectAttempts": 5,
    "reconnectDelay": 3000
  },
  "display": {
    "colors": true,
    "timestamps": true,
    "maxMessageLength": 1000
  }
}
CONFIGEOF

echo "Configuration updated successfully!"
echo "Server URL: $SERVER_PROTOCOL://$SERVER_HOST:$SERVER_PORT"
EOF

chmod +x "$APP_DIR/configure.sh"

# Create help script
print_status "Creating help script..."
tee "$APP_DIR/help.sh" > /dev/null <<EOF
#!/bin/bash

echo "IPA Console Client Help"
echo "======================="
echo
echo "Available commands:"
echo "  /help     - Show this menu"
echo "  /list     - List all articles"
echo "  /read     - Read an article"
echo "  /stats    - Show articles statistics"
echo "  /config   - Show current configuration"
echo "  /clear    - Clear screen"
echo "  /quit     - Exit client"
echo
echo "Usage examples:"
echo "  npm start                    - Start the client"
echo "  ./launch.sh                  - Alternative start method"
echo "  ./configure.sh               - Configure server settings"
echo "  ./help.sh                    - Show this help"
echo
echo "For more information, see README.md"
EOF

chmod +x "$APP_DIR/help.sh"

# Test server connectivity
print_status "Testing server connectivity..."
if command -v curl &> /dev/null; then
    SERVER_HOST=$(node -e "console.log(require('./config.json').server.host)")
    SERVER_PORT=$(node -e "console.log(require('./config.json').server.port)")
    SERVER_PROTOCOL=$(node -e "console.log(require('./config.json').server.protocol)")
    
    if curl -s "$SERVER_PROTOCOL://$SERVER_HOST:$SERVER_PORT/api/health" > /dev/null; then
        print_success "Server is reachable at $SERVER_PROTOCOL://$SERVER_HOST:$SERVER_PORT"
    else
        print_warning "Server is not reachable at $SERVER_PROTOCOL://$SERVER_HOST:$SERVER_PORT"
        print_warning "Please make sure the server is running and update config.json if needed"
    fi
else
    print_warning "curl not found, skipping connectivity test"
fi

print_success "Installation completed successfully!"

# Display next steps
echo
print_status "Next steps:"
echo "1. Configure server settings: $APP_DIR/configure.sh"
echo "2. Or edit config.json manually: nano $APP_DIR/config.json"
echo "3. Start the client: cd $APP_DIR && npm start"
echo "4. Or use the desktop shortcut: IPA Client"
echo "5. View help: $APP_DIR/help.sh"
echo
print_status "Client will connect to: $(node -e "const c=require('./config.json'); console.log(c.server.protocol+'://'+c.server.host+':'+c.server.port)")"
echo
print_success "Installation script completed!"

