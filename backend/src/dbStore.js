const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure files exist
if (!fs.existsSync(PROFILES_FILE)) {
    // Default profile
    const defaultProfiles = [
        { id: 'default-1', name: 'Guest', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest', pin: null }
    ];
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(defaultProfiles, null, 2));
}

if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({}, null, 2));
}

// --- PROFILES ---

function getProfiles() {
    try {
        const rawData = fs.readFileSync(PROFILES_FILE, 'utf-8');
        return JSON.parse(rawData);
    } catch (e) {
        return [];
    }
}

function saveProfiles(profiles) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

function getProfileById(id) {
    const profiles = getProfiles();
    return profiles.find(p => p.id === id);
}

// --- HISTORY ---

function getHistory() {
    try {
        const rawData = fs.readFileSync(HISTORY_FILE, 'utf-8');
        return JSON.parse(rawData);
    } catch (e) {
        return {};
    }
}

function saveHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function getProfileHistory(profileId) {
    const history = getHistory();
    return history[profileId] || {};
}

function updateProfileHistory(profileId, animeId, data) {
    const history = getHistory();
    if (!history[profileId]) history[profileId] = {};

    history[profileId][animeId] = {
        ...history[profileId][animeId],
        ...data,
        updatedAt: Date.now()
    };

    saveHistory(history);
    return history[profileId][animeId];
}

module.exports = {
    getProfiles,
    saveProfiles,
    getProfileById,
    getHistory,
    saveHistory,
    getProfileHistory,
    updateProfileHistory
};
