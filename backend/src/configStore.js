const fs = require('fs');
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, '../data/config.json');

const DEFAULT_CONFIG = {
    provider: 'gogoanime', // fallback placeholder, Consumet defaults usually work best
    defaultQuality: 'auto',
    preferredSub: 'english',
    autoPlayNextEpisode: true,
    autoSkipIntro: false
};

// Ensure data directory exists
const dataDir = path.dirname(CONFIG_FILE_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure default config file exists
if (!fs.existsSync(CONFIG_FILE_PATH)) {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

function getConfig() {
    try {
        const rawData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(rawData) };
    } catch (error) {
        console.error('Error reading config file, returning defaults', error);
        return DEFAULT_CONFIG;
    }
}

function updateConfig(newSettings) {
    try {
        const currentConfig = getConfig();
        const updatedConfig = { ...currentConfig, ...newSettings };
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updatedConfig, null, 2));
        return updatedConfig;
    } catch (error) {
        console.error('Error updating config file', error);
        throw new Error('Failed to update configuration.');
    }
}

module.exports = {
    getConfig,
    updateConfig,
};
