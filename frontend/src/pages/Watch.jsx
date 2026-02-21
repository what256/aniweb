import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, StepForward, StepBack, Info, Play, ListVideo, Monitor } from 'lucide-react';
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

    const activeProfileId = localStorage.getItem('activeProfileId');
    const [initialTimestamp, setInitialTimestamp] = useState(0);
    const lastSyncTime = useRef(0);

    // Auto-scroll to active episode in sidebar
    const activeEpisodeRef = useRef(null);

    useEffect(() => {
        // Fetch User Settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => console.error("Could not load settings"));

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/anime/watch/${encodeURIComponent(episodeId)}`);
                const data = await res.json();

                if (data.message || !data.sources || data.sources.length === 0) {
                    setError(data.message || 'No video sources found for this episode.');
                } else {
                    setStreamInfo(data);
                    // Find default or auto quality
                    const defaultSource = data.sources.find(s => s.quality === 'default' || s.quality === 'auto');
                    if (defaultSource) {
                        setSelectedQuality(defaultSource.quality);
                    } else {
                        setSelectedQuality(data.sources[0].quality);
                    }
                }

                // If we have animeId, fetch the full anime info to get episode list for Next/Prev
                if (animeId) {
                    try {
                        const infoRes = await fetch(`/api/anime/info/${encodeURIComponent(animeId)}`);
                        const infoData = await infoRes.json();
                        setAnimeInfo(infoData);
                    } catch (e) {
                        console.error("Failed to fetch anime info for navigation", e);
                    }
                }

                // Fetch profile history for this anime
                if (activeProfileId && animeId) {
                    try {
                        const histRes = await fetch(`/api/history/${activeProfileId}`);
                        const histData = await histRes.json();
                        if (histData.success) {
                            const thisAnimeHistory = histData.history.find(h => h.animeId === animeId);
                            if (thisAnimeHistory && thisAnimeHistory.episodeId === episodeId) {
                                setInitialTimestamp(thisAnimeHistory.timestamp);
                            } else {
                                setInitialTimestamp(0);
                            }
                        }
                    } catch (e) {
                        setInitialTimestamp(0);
                    }
                } else {
                    setInitialTimestamp(0);
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load video stream.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [episodeId, animeId]);

    useEffect(() => {
        if (activeEpisodeRef.current) {
            activeEpisodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [animeInfo, episodeId]);

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
            navigate(`/watch/${encodeURIComponent(nextEpisode.id)}?animeId=${animeId}`);
        }
    };

    const handleProgress = (currentTime, duration) => {
        const now = Date.now();
        if (now - lastSyncTime.current > 5000 && activeProfileId && animeInfo && currentEpisodeNum !== null) {
            lastSyncTime.current = now;
            fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: activeProfileId,
                    animeId: animeId,
                    animeTitle: animeInfo.title.english || animeInfo.title.romaji,
                    image: animeInfo.cover || animeInfo.image,
                    episodeId: episodeId,
                    episodeNumber: currentEpisodeNum,
                    timestamp: currentTime,
                    duration: duration
                })
            }).catch(e => console.error("History sync failed", e));
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-700">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    to={`/anime/${animeId}`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Details
                </Link>
                {animeInfo && (
                    <h2 className="text-xl font-bold text-white hidden md:block">
                        {animeInfo.title.english || animeInfo.title.romaji} <span className="text-premium-accent ml-2">| EP {currentEpisodeNum}</span>
                    </h2>
                )}
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Left Side: Cinematic Player Area */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-premium-900 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 relative">
                        {loading ? (
                            <div className="w-full aspect-video flex flex-col items-center justify-center bg-black/50 backdrop-blur-md">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-premium-accent mb-4"></div>
                                <div className="text-premium-accent text-sm tracking-widest uppercase font-bold animate-pulse">Decrypting Stream...</div>
                            </div>
                        ) : error ? (
                            <div className="w-full aspect-video flex items-center justify-center bg-black/50 backdrop-blur-md text-red-400 p-8 text-center text-lg font-medium">
                                <Monitor className="w-12 h-12 mb-4 opacity-50 block mx-auto" />
                                {error}
                            </div>
                        ) : (
                            <VideoPlayer
                                url={currentSource}
                                onEnded={handleVideoEnd}
                                poster={animeInfo?.cover}
                                onProgress={handleProgress}
                                initialTimestamp={initialTimestamp}
                            />
                        )}
                    </div>

                    {/* Server & Nav Controls */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between border-t-4 border-t-premium-accent">
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={() => prevEpisode && navigate(`/watch/${encodeURIComponent(prevEpisode.id)}?animeId=${animeId}`)}
                                disabled={!prevEpisode}
                                className="flex-1 md:flex-none px-6 py-3 bg-premium-800 hover:bg-premium-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
                            >
                                <StepBack className="w-5 h-5" /> Prev
                            </button>
                            <button
                                onClick={() => nextEpisode && navigate(`/watch/${encodeURIComponent(nextEpisode.id)}?animeId=${animeId}`)}
                                disabled={!nextEpisode}
                                className="flex-1 md:flex-none px-6 py-3 bg-premium-accent hover:bg-premium-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                            >
                                Next <StepForward className="w-5 h-5" />
                            </button>
                        </div>

                        {!loading && !error && streamInfo && (
                            <div className="flex items-center gap-4 w-full md:w-auto bg-premium-800 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-400 px-3">
                                    <Server className="w-4 h-4 text-emerald-400" />
                                    Server
                                </div>
                                <div className="w-px h-6 bg-white/10"></div>
                                <select
                                    value={selectedQuality}
                                    onChange={(e) => setSelectedQuality(e.target.value)}
                                    className="bg-transparent text-white font-bold px-3 py-2 pr-8 focus:outline-none cursor-pointer appearance-none"
                                >
                                    {streamInfo.sources.map(source => (
                                        <option key={source.quality} value={source.quality} className="bg-premium-800">
                                            {source.quality.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Sidebar Episode List */}
                {animeInfo && animeInfo.episodes && (
                    <div className="xl:w-96 flex flex-col gap-4">
                        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-premium-accent">
                            <ListVideo className="w-6 h-6 text-premium-accent" />
                            <div>
                                <h3 className="font-bold text-white leading-tight">Up Next</h3>
                                <p className="text-xs text-gray-400">{animeInfo.title.english || animeInfo.title.romaji}</p>
                            </div>
                        </div>

                        <div className="glass-panel rounded-xl overflow-hidden flex-1 flex flex-col max-h-[600px] xl:max-h-[800px]">
                            <div className="p-4 bg-premium-800/50 border-b border-white/5 flex justify-between items-center text-sm text-gray-400">
                                <span>{animeInfo.episodes.length} Episodes</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{animeInfo.type}</span>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                                {animeInfo.episodes.map((ep) => {
                                    const isActive = ep.id === episodeId;
                                    return (
                                        <Link
                                            key={ep.id}
                                            to={`/watch/${encodeURIComponent(ep.id)}?animeId=${animeId}`}
                                            ref={isActive ? activeEpisodeRef : null}
                                            className={`p-3 rounded-lg flex gap-3 transition-all ${isActive
                                                ? 'bg-premium-accent/20 border border-premium-accent/50 text-white'
                                                : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                                                }`}
                                        >
                                            <div className="relative shrink-0 w-24 h-16 bg-premium-900 rounded overflow-hidden">
                                                <img
                                                    src={animeInfo.image}
                                                    alt="Thumbnail"
                                                    className={`w-full h-full object-cover opacity-50 ${isActive ? 'scale-110 blur-sm' : ''}`}
                                                />
                                                {isActive && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-premium-accent/30 backdrop-blur-sm">
                                                        <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                                    </div>
                                                )}
                                                {!isActive && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                                                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-premium-accent text-white' : 'bg-white/10 text-gray-400'}`}>
                                                        EP {ep.number}
                                                    </span>
                                                </div>
                                                <p className={`text-sm truncate font-medium ${isActive ? 'text-premium-accent' : ''}`}>
                                                    {ep.title || `Episode ${ep.number}`}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
