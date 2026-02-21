const express = require('express');
const router = express.Router();

const CONSUMET_URL = 'http://127.0.0.1:4444'; // Using local anime-api microservice

/**
 * Helper to fetch and parse JSON safely
 */
async function fetchApi(path) {
    const response = await fetch(`${CONSUMET_URL}${path}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
}

/**
 * GET /api/anime/home
 * Fetches multiple arrays for the V3 Home Dashboard in one go.
 */
router.get('/home', async (req, res) => {
    try {
        const data = await fetchApi('/api/');
        if (!data.results) return res.json({ spotlights: [], trending: [], popular: [], recent: [] });

        const mapItem = (item) => ({
            id: item.id,
            image: item.poster,
            title: { english: item.title, romaji: item.japanese_title },
            description: item.description || '',
            episodeNumber: item.tvInfo?.eps || item.tvInfo?.sub || item.tvInfo?.dub || item.newest_episode || ''
        });

        res.json({
            spotlights: (data.results.spotlights || []).map(mapItem),
            trending: (data.results.trending || []).map(mapItem),
            popular: (data.results.mostPopular || []).map(mapItem),
            recent: (data.results.latestEpisode || []).map(mapItem)
        });
    } catch (error) {
        console.error('Error fetching home data:', error.message);
        res.status(500).json({ error: 'Failed to fetch home data' });
    }
});

/**
 * GET /api/anime/search?q=query
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const data = await fetchApi(`/api/search?keyword=${encodeURIComponent(query)}`);
        if (!data.results) return res.json({ results: [] });

        const searchResults = data.results.map(item => ({
            id: item.id,
            image: item.poster,
            title: { english: item.title, romaji: item.japanese_title },
            releaseDate: item.tvInfo?.releaseDate || ''
        }));

        res.json({ results: searchResults });
    } catch (error) {
        console.error(`Error searching anime:`, error.message);
        res.status(500).json({ error: 'Failed to search anime' });
    }
});

/**
 * GET /api/anime/info/:id
 */
router.get('/info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch Details
        const info = await fetchApi(`/api/info?id=${id}`);
        // Fetch Episodes
        const eps = await fetchApi(`/api/episodes/${id}`);

        if (!info.results || !info.results.data) {
            return res.status(404).json({ error: 'Anime not found' });
        }

        const details = info.results.data;
        const episodeList = eps.results?.episodes || [];

        res.json({
            id: details.id,
            image: details.poster,
            cover: details.poster,
            title: { english: details.title, romaji: details.japanese_title },
            description: details.animeInfo?.Overview || '',
            status: details.animeInfo?.Status || '',
            type: details.showType || '',
            rating: parseInt(details.animeInfo?.['MAL Score']) * 10 || null,
            releaseDate: details.animeInfo?.Aired || '',
            episodes: episodeList.map(ep => ({
                id: ep.id,
                number: ep.number,
                title: ep.title
            }))
        });
    } catch (error) {
        console.error(`Error fetching anime info:`, error.message);
        res.status(500).json({ error: 'Failed to fetch anime info' });
    }
});

/**
 * GET /api/anime/watch/:episodeId
 */
router.get('/watch/:episodeId', async (req, res) => {
    try {
        const { episodeId } = req.params;
        // The episodeId string for anime-api usually has the format `anime-id?ep=episode-id`
        // But our UI passes whatever id is inside the episodes list.
        // Let's assume episodeId directly is the ID.
        // anime-api /api/stream accepts server names. We will grab the default server.
        const data = await fetchApi(`/api/stream?id=${encodeURIComponent(episodeId)}&server=hd-1`);

        if (!data.results || !data.results.streamingLink) {
            // Try another server if hd-1 fails
            const data2 = await fetchApi(`/api/stream?id=${encodeURIComponent(episodeId)}&server=hd-2`);
            if (!data2.results || !data2.results.streamingLink) {
                return res.status(404).json({ message: 'No video sources found' });
            }
            res.json({
                sources: [
                    { quality: 'default', url: data2.results.streamingLink }
                ]
            });
            return;
        }

        res.json({
            sources: [
                { quality: 'default', url: data.results.streamingLink }
            ]
        });
    } catch (error) {
        console.error(`Error fetching stream:`, error.message);
        res.status(500).json({ error: 'Failed to fetch streaming sources' });
    }
});

module.exports = router;
