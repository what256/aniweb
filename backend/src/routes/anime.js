const express = require('express');
const { META, ANIME } = require('@consumet/extensions');
const { getConfig } = require('../configStore');
const router = express.Router();

// Initialize the AniList provider (which uses Gogoanime by default for streaming links)
const anilist = new META.Anilist();

// Helper to get raw provider based on config
function getProvider() {
    const config = getConfig();
    const providerStr = config.provider || 'gogoanime';
    if (providerStr.toLowerCase() === 'zoro') return new ANIME.Zoro();
    if (providerStr.toLowerCase() === 'enime') return new ANIME.Enime();
    return new ANIME.Gogoanime();
}

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

        try {
            // First try Meta Anilist for rich metadata
            const data = await anilist.search(query, page);
            if (data && data.results && data.results.length > 0) {
                return res.json(data);
            }
        } catch (anilistError) {
            console.warn('Anilist search failed, falling back to direct provider:', anilistError.message);
        }

        // Fallback to direct provider search if Anilist fails or returns empty
        const provider = getProvider();
        const fallbackData = await provider.search(query, page);
        res.json(fallbackData);

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
        // Fetch stream links using the globally configured provider via configStore
        const provider = getProvider();

        try {
            // Try fetching from the raw provider directly using the episodeId
            // Some providers might need the ID mapped, but usually Consumet handles this well.
            const data = await provider.fetchEpisodeSources(episodeId);
            return res.json(data);
        } catch (providerError) {
            console.warn('Configured provider failed to fetch sources, falling back to anilist default:', providerError.message);
            // Fallback to Anilist default (usually Gogoanime wrapped)
            const fallbackData = await anilist.fetchEpisodeSources(episodeId);
            return res.json(fallbackData);
        }
    } catch (error) {
        console.error(`Error fetching episode sources for ${req.params.episodeId}:`, error);
        res.status(500).json({ error: 'Failed to fetch streaming sources' });
    }
});

module.exports = router;
