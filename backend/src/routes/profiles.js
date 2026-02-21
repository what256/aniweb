const express = require('express');
const router = express.Router();
const dbStore = require('../dbStore');

// Utility to generate unique ID since uuid isn't installed
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET /api/profiles
router.get('/', (req, res) => {
    // Return profiles without PINs for security
    const profiles = dbStore.getProfiles().map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        hasPin: !!p.pin
    }));
    res.json({ success: true, profiles });
});

// POST /api/profiles
router.post('/', (req, res) => {
    const { id, name, avatar, pin } = req.body;
    let profiles = dbStore.getProfiles();

    if (id) {
        // Update existing
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
            profiles[index] = { ...profiles[index], name, avatar, pin: pin || profiles[index].pin };
        } else {
            return res.status(404).json({ error: 'Profile not found' });
        }
    } else {
        // Create new
        const newProfile = {
            id: generateId(),
            name: name || 'New User',
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            pin: pin || null
        };
        profiles.push(newProfile);
    }

    dbStore.saveProfiles(profiles);
    res.json({ success: true, profiles: profiles.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, hasPin: !!p.pin })) });
});

// DELETE /api/profiles/:id
router.delete('/:id', (req, res) => {
    let profiles = dbStore.getProfiles();
    profiles = profiles.filter(p => p.id !== req.params.id);
    dbStore.saveProfiles(profiles);
    res.json({ success: true });
});

// POST /api/profiles/auth
router.post('/auth', (req, res) => {
    const { id, pin } = req.body;
    const profile = dbStore.getProfileById(id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.pin) {
        return res.json({ success: true, token: profile.id }); // No pin required
    }

    if (profile.pin === pin) {
        return res.json({ success: true, token: profile.id });
    } else {
        return res.status(401).json({ error: 'Incorrect PIN' });
    }
});

module.exports = router;
