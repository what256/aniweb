#!/bin/bash
set -e

# Aniweb Smart Installer / Updater
# https://github.com/your-username/aniweb

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}      Aniweb Smart Setup Script       ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 1. Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}Docker installed successfully.${NC}"
else
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
fi

# 2. Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ] && ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Docker Compose is available.${NC}"
fi

# 3. Check for updates (if in a git repository)
if [ -d ".git" ]; then
    echo -e "${YELLOW}Checking for updates from Git repository...${NC}"
    # Stash any local changes to ensure clean pull
    git stash >/dev/null 2>&1 || true
    git pull origin main || git pull origin master || true
    echo -e "${GREEN}✓ Source code is up to date.${NC}"
else
    echo -e "${BLUE}ℹ Not a git repository, skipping git pull.${NC}"
fi

# 4. Manage Docker Containers
echo -e "${YELLOW}Preparing Aniweb containers...${NC}"

# Check if containers are already running, and if so, bring them down to rebuild
if docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Existing Aniweb installation detected. Updating and restarting...${NC}"
    docker compose down
fi

echo -e "${YELLOW}Building and starting Aniweb... (This may take a few minutes)${NC}"
sudo docker compose up -d --build

# 5. Setup Global CLI Tool
echo -e "${YELLOW}Installing global 'aniweb' CLI tool...${NC}"
cat << 'EOF' | sudo tee /usr/local/bin/aniweb > /dev/null
#!/bin/bash
# Aniweb Global CLI
ANIWEB_DIR="$HOME/aniweb"

if [ ! -d "$ANIWEB_DIR" ]; then
    echo "Error: Aniweb directory not found at $ANIWEB_DIR"
    exit 1
fi

cd "$ANIWEB_DIR"

case "$1" in
    up|start)
        sudo docker compose up -d
        ;;
    down|stop)
        sudo docker compose down
        ;;
    restart)
        sudo docker compose down && sudo docker compose up -d
        ;;
    logs)
        shift
        sudo docker compose logs -f "$@"
        ;;
    update)
        curl -sSL https://raw.githubusercontent.com/what256/aniweb/main/install-web.sh | bash
        ;;
    *)
        echo "Aniweb CLI - Usage:"
        echo "  aniweb start    - Start the Aniweb servers"
        echo "  aniweb stop     - Stop the Aniweb servers"
        echo "  aniweb restart  - Restart the servers"
        echo "  aniweb logs     - View live server logs"
        echo "  aniweb update   - Update Aniweb to the newest version"
        ;;
esac
EOF
sudo chmod +x /usr/local/bin/aniweb
echo -e "${GREEN}✓ 'aniweb' command is now available globally!${NC}"

# 5. Output success message and LAN IP
LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN} Aniweb is ready!                     ${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "You can access your private anime streaming server from any device on your network at:"
echo -e "${BLUE}http://${LOCAL_IP}${NC}"
echo ""
echo -e "To view logs, run: ${YELLOW}docker compose logs -f${NC}"
echo -e "To stop Aniweb, run: ${YELLOW}docker compose down${NC}"
echo -e "${GREEN}Enjoy!${NC}"
