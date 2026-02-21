# Aniweb 🍿

Aniweb is a self-hosted, personal, zero-configuration anime streaming platform.

Unlike traditional media servers (like Plex or Jellyfin), Aniweb **does not require you to download terabytes of video files**. Instead, it dynamically catalogs trending and seasonal anime using the AniList API and fetches real-time streaming components on the fly (via `@consumet/extensions`), piping the `.m3u8` streams directly to a sleek, modern web player.

## Features ✨

*   **Zero Configuration:** A comprehensive 1-click Docker installation. No databases to configure or APIs to sign up for.
*   **Dynamic Cataloging:** Real-time data of trending and recently updated anime sourced directly from AniList.
*   **Real-Time Streaming:** Bypasses provider limits to pull raw HLS video streams (with Sub/Dub tracking).
*   **Premium Interface:** A visually stunning, dark-mode, glassmorphic UI built with React + Tailwind CSS.
*   **Custom Player:** Fully integrated native `.m3u8` video playback straight in the browser.

## The Microservice Architecture 🐳

Aniweb is broken down into modular components that are orchestrated by Docker:
*   `backend`: A Node.js/Express API that utilizes web scraping wrappers to retrieve the direct underlying streaming links.
*   `frontend`: A high-performance React frontend served by an Nginx web server.

## Installation 🚀

You can spin up Aniweb on any Linux environment (Ubuntu, Debian, Raspberry Pi, etc.) with a single command!

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/aniweb.git
   cd aniweb
   ```

2. Run the smart installer:
   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```

The script will handle downloading dependencies, setting up Docker/Docker Compose (if required), and spinning up the servers. Wait a few moments, and the script will output the specific IP (e.g., `http://192.168.1.100`) where Aniweb is hosted on your local network!

## Manual Development Run 🛠️

If you prefer to run it manually or want to tinker with the code:

**Run the Backend:**
```bash
cd backend
npm install
npm start
```

**Run the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Contributing 🤝

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/your-username/aniweb/issues).

## Disclaimer ⚠️

This project is for educational and self-hosting purposes only. Aniweb simply acts as a proxy for publicly available content across the internet. We do not host, store, or directly distribute any copyrighted material on our servers.

## License 📝

[MIT License](LICENSE)
