const express = require('express');
const { META } = require('@consumet/extensions');
const router = express.Router();

// Initialize the AniList provider (which uses Gogoanime by default for streaming links)
const anilist = new META.Anilist();

/**
 * GET /api/anime/trending
 * Fetches trending anime from AniList
 */
router.get('/trending', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await anilist.fetchTrendingAnime(page);
        res.json(data);
    } catch (error) {
        console.error('Error fetching trending anime:', error);
        res.status(500).json({ error: 'Failed to fetch trending anime' });
    }
});

/**
 * GET /api/anime/recent
 * Fetches recently updated anime episodes
 */
router.get('/recent', async (req, res) => {
    try {
        const page = req.query.page || 1;
        // Using default provider for recent episodes
        const data = await anilist.fetchRecentEpisodes(undefined, page);
        res.json(data);
    } catch (error) {
        console.error('Error fetching recent anime:', error);
        res.status(500).json({ error: 'Failed to fetch recent episodes' });
    }
});

/**
 * GET /api/anime/search?q=query
 * Searches for anime
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = req.query.page || 1;
        if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const data = await anilist.search(query, page);
        res.json(data);
    } catch (error) {
        console.error(`Error searching anime with query ${req.query.q}:`, error);
        res.status(500).json({ error: 'Failed to search anime' });
    }
});

/**
 * GET /api/anime/info/:id
 * Gets detailed info and episode list for an anime by its AniList ID
 */
router.get('/info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // We can also fetch the dub episodes if available
        const data = await anilist.fetchAnimeInfo(id);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching info for anime ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch anime info' });
    }
});

/**
 * GET /api/anime/watch/:episodeId
 * Gets the valid streaming URLs (.m3u8) for the given episode ID
 */
router.get('/watch/:episodeId', async (req, res) => {
    try {
        const { episodeId } = req.params;
        // Consumet's anilist provider fetches stream links (default to gogoanime underlying)
        const data = await anilist.fetchEpisodeSources(episodeId);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching episode sources for ${req.params.episodeId}:`, error);
        res.status(500).json({ error: 'Failed to fetch streaming sources' });
    }
});

module.exports = router;
