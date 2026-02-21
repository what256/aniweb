#!/bin/bash
set -e

# ==========================================
# Aniweb Curl-Bash Installer
# Designed to be run directly via:
# curl -sSL https://raw.githubusercontent.com/what256/aniweb/main/install-web.sh | bash
# ==========================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}      Aniweb Web Setup Script         ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Determine target directory
TARGET_DIR="${HOME}/aniweb"

# Check if git is installed
if ! [ -x "$(command -v git)" ]; then
    echo -e "${RED}Error: Git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Clone or pull repository
if [ -d "$TARGET_DIR/.git" ]; then
    echo -e "${YELLOW}Aniweb directory already exists at $TARGET_DIR.${NC}"
    echo -e "${YELLOW}Updating from GitHub...${NC}"
    cd "$TARGET_DIR"
    sudo git fetch --all || true
    sudo git reset --hard origin/main || sudo git reset --hard origin/master || true
else
    echo -e "${YELLOW}Cloning Aniweb repository to $TARGET_DIR...${NC}"
    git clone https://github.com/what256/aniweb.git "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

# Make the internal install script executable and run it
echo -e "${YELLOW}Starting Aniweb Core Installer...${NC}"
sudo chmod +x install.sh
sudo ./install.sh
