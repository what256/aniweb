const express = require('express');
const { getConfig } = require('../configStore');
const router = express.Router();

const CONSUMET_URL = 'http://consumet:3000';

function getProvider() {
    const config = getConfig();
    return config.provider || 'gogoanime';
}

/**
 * GET /api/anime/trending
 */
router.get('/trending', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await fetch(`${CONSUMET_URL}/meta/anilist/trending?page=${page}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching trending anime:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending anime' });
    }
});

/**
 * GET /api/anime/recent
 */
router.get('/recent', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const provider = getProvider();
        const response = await fetch(`${CONSUMET_URL}/meta/anilist/recent-episodes?page=${page}&provider=${provider}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching recent anime:', error.message);
        res.status(500).json({ error: 'Failed to fetch recent episodes' });
    }
});

/**
 * GET /api/anime/search?q=query
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = req.query.page || 1;
        if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const response = await fetch(`${CONSUMET_URL}/meta/anilist/${encodeURIComponent(query)}?page=${page}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error searching anime with query ${req.query.q}:`, error.message);
        res.status(500).json({ error: 'Failed to search anime' });
    }
});

/**
 * GET /api/anime/info/:id
 */
router.get('/info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const provider = getProvider();
        const response = await fetch(`${CONSUMET_URL}/meta/anilist/info/${id}?provider=${provider}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching info for anime ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch anime info' });
    }
});

/**
 * GET /api/anime/watch/:episodeId
 */
router.get('/watch/:episodeId', async (req, res) => {
    try {
        const { episodeId } = req.params;
        const response = await fetch(`${CONSUMET_URL}/meta/anilist/watch/${encodeURIComponent(episodeId)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error fetching episode sources for ${req.params.episodeId}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch streaming sources' });
    }
});

module.exports = router;
