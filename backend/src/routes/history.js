const express = require('express');
const router = express.Router();
const dbStore = require('../dbStore');

// GET /api/history/:profileId
router.get('/:profileId', (req, res) => {
    const { profileId } = req.params;
    const history = dbStore.getProfileHistory(profileId);
    // Convert object to sorted array by updatedAt
    const historyArray = Object.values(history).sort((a, b) => b.updatedAt - a.updatedAt);
    res.json({ success: true, history: historyArray });
});

// POST /api/history
router.post('/', (req, res) => {
    const { profileId, animeId, episodeId, timestamp, animeTitle, episodeNumber, image, duration } = req.body;
    if (!profileId || !animeId) return res.status(400).json({ error: 'Missing profileId or animeId' });

    const updated = dbStore.updateProfileHistory(profileId, animeId, {
        animeId,
        episodeId,
        timestamp,
        animeTitle,
        episodeNumber,
        image,
        duration
    });

    res.json({ success: true, data: updated });
});

module.exports = router;
