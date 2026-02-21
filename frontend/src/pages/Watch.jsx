import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, StepForward, StepBack, Info } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

export default function Watch() {
    const { episodeId } = useParams();
    const [searchParams] = useSearchParams();
    const animeId = searchParams.get('animeId');
    const navigate = useNavigate();

    const [streamInfo, setStreamInfo] = useState(null);
    const [animeInfo, setAnimeInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('default');
    const [settings, setSettings] = useState({ autoPlayNextEpisode: true });

    useEffect(() => {
        // Fetch User Settings
        fetch('http://localhost:5000/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => console.error("Could not load settings"));

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`http://localhost:5000/api/anime/watch/${encodeURIComponent(episodeId)}`);
                const data = await res.json();

                if (data.message || !data.sources || data.sources.length === 0) {
                    setError(data.message || 'No video sources found for this episode.');
                    return;
                }

                setStreamInfo(data);

                // Find default or auto quality
                const defaultSource = data.sources.find(s => s.quality === 'default' || s.quality === 'auto');
                if (defaultSource) {
                    setSelectedQuality(defaultSource.quality);
                } else {
                    setSelectedQuality(data.sources[0].quality);
                }

                // If we have animeId, fetch the full anime info to get episode list for Next/Prev
                if (animeId) {
                    try {
                        const infoRes = await fetch(`http://localhost:5000/api/anime/info/${encodeURIComponent(animeId)}`);
                        const infoData = await infoRes.json();
                        setAnimeInfo(infoData);
                    } catch (e) {
                        console.error("Failed to fetch anime info for navigation", e);
                    }
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load video stream.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [episodeId, animeId]);

    const currentSource = streamInfo?.sources?.find(s => s.quality === selectedQuality)?.url;

    // Determine Prev / Next episodes
    let prevEpisode = null;
    let nextEpisode = null;
    let currentEpisodeNum = null;

    if (animeInfo && animeInfo.episodes) {
        const currentIndex = animeInfo.episodes.findIndex(ep => ep.id === episodeId);
        if (currentIndex !== -1) {
            currentEpisodeNum = animeInfo.episodes[currentIndex].number;
            if (currentIndex > 0) prevEpisode = animeInfo.episodes[currentIndex - 1];
            if (currentIndex < animeInfo.episodes.length - 1) nextEpisode = animeInfo.episodes[currentIndex + 1];
        }
    }

    const handleVideoEnd = () => {
        if (settings.autoPlayNextEpisode && nextEpisode) {
            navigate(`/watch/${nextEpisode.id}?animeId=${animeId}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <Link
                to={`/anime/${animeId}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Details
            </Link>

            <div className="bg-premium-800 p-1 rounded-2xl shadow-2xl mb-6">
                {loading ? (
                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-black rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-accent mb-4"></div>
                        <div className="text-gray-400 text-sm tracking-widest uppercase">Decrypting Stream...</div>
                    </div>
                ) : error ? (
                    <div className="w-full aspect-video flex items-center justify-center bg-black rounded-xl text-red-400 p-8 text-center">
                        {error}
                    </div>
                ) : (
                    <VideoPlayer url={currentSource} onEnded={handleVideoEnd} />
                )}
            </div>

            {/* Episode Navigation Controls */}
            {!loading && !error && (
                <div className="flex items-center justify-between mb-6 gap-4">
                    {prevEpisode ? (
                        <Link
                            to={`/watch/${prevEpisode.id}?animeId=${animeId}`}
                            className="flex-1 bg-premium-800 hover:bg-premium-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
                        >
                            <StepBack className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Previous Episode</span>
                            <span className="font-sm text-gray-400">({prevEpisode.number})</span>
                        </Link>
                    ) : (
                        <div className="flex-1 bg-premium-800/50 text-gray-500 p-4 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                            <StepBack className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Previous Episode</span>
                        </div>
                    )}

                    {nextEpisode ? (
                        <Link
                            to={`/watch/${nextEpisode.id}?animeId=${animeId}`}
                            className="flex-1 bg-premium-accent hover:bg-premium-accentHover text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-premium-accent/20"
                        >
                            <span className="font-semibold hidden sm:inline">Next Episode</span>
                            <span className="font-sm text-white/70">({nextEpisode.number})</span>
                            <StepForward className="w-5 h-5" />
                        </Link>
                    ) : (
                        <div className="flex-1 bg-premium-800/50 text-gray-500 p-4 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                            <span className="font-semibold hidden sm:inline">Next Episode</span>
                            <StepForward className="w-5 h-5" />
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && streamInfo && (
                <div className="glass-panel p-6 rounded-2xl flex flex-wrap gap-6 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
                            <Info className="w-6 h-6 text-premium-accent" />
                            Currently Watching
                        </h1>
                        <p className="text-gray-400 text-sm ml-9 truncate max-w-sm">
                            Episode {currentEpisodeNum ? currentEpisodeNum : episodeId}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-4 py-2 rounded-lg">
                            <Server className="w-4 h-4" />
                            Quality
                        </div>
                        <select
                            value={selectedQuality}
                            onChange={(e) => setSelectedQuality(e.target.value)}
                            className="bg-premium-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-premium-accent cursor-pointer"
                        >
                            {streamInfo.sources.map(source => (
                                <option key={source.quality} value={source.quality}>
                                    {source.quality.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
