import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Eye, MessageCircle } from 'lucide-react';

export default function Home() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search');

    const [homeData, setHomeData] = useState({ spotlights: [], trending: [], popular: [], recent: [] });
    const [searchResults, setSearchResults] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);

    const activeProfileId = localStorage.getItem('activeProfileId');

    useEffect(() => {
        const fetchAnime = async () => {
            setLoading(true);
            try {
                if (query) {
                    const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setSearchResults(data.results || []);
                } else {
                    const res = await fetch('/api/anime/home');
                    const data = await res.json();

                    if (data.error) {
                        console.error("Backend sent an error:", data.error);
                    } else if (data.spotlights) {
                        setHomeData(data);
                    }

                    if (activeProfileId) {
                        try {
                            const histRes = await fetch(`/api/history/${activeProfileId}`);
                            const histData = await histRes.json();
                            if (histData.success && histData.history) {
                                setHistoryData(histData.history);
                            }
                        } catch (e) {
                            console.error('Failed to load history', e);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch anime', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnime();
    }, [query]);

    // Auto-rotate Hero Banner
    useEffect(() => {
        if (query || homeData.spotlights.length === 0) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % homeData.spotlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [query, homeData.spotlights.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    const AnimeGrid = ({ items }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {items.map((anime) => (
                <Link
                    key={anime.id}
                    to={anime.customUrl || `/anime/${anime.id}`}
                    className="group relative rounded-xl overflow-hidden glass-panel hover:ring-2 hover:ring-premium-accent transition-all duration-300"
                >
                    <div className="aspect-[2/3] w-full overflow-hidden relative">
                        {/* Premium Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                            {anime.episodeNumber && (
                                <div className="bg-premium-accent/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                                    EP {anime.episodeNumber}
                                </div>
                            )}
                            {anime.progressPercentage && (
                                <div className="bg-black/80 backdrop-blur-sm text-premium-accent text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                                    {Math.round(anime.progressPercentage)}%
                                </div>
                            )}
                        </div>
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                {(Math.random() * (9.8 - 7.0) + 7.0).toFixed(1)}
                            </div>
                        </div>

                        <img
                            src={anime.image}
                            alt={anime.title.english || anime.title.romaji}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-premium-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-premium-accent text-white p-4 rounded-full transform translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-premium-accent/50 scale-75 group-hover:scale-100">
                                <Play fill="currentColor" className="w-6 h-6 ml-1" />
                            </div>
                        </div>

                        {/* Bottom Stats Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-2 flex justify-between text-[10px] text-gray-300 font-medium z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {Math.floor(Math.random() * 500) + 50}k</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {Math.floor(Math.random() * 500) + 10}</span>
                        </div>

                        {/* Progress Bar (if watched) */}
                        {anime.progressPercentage && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                                <div className="h-full bg-premium-accent" style={{ width: `${anime.progressPercentage}%` }}></div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-premium-800/80 backdrop-blur-md">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-premium-accent transition-colors">
                            {anime.title.english || anime.title.romaji}
                        </h3>
                        {anime.releaseDate && (
                            <p className="text-xs text-gray-400">{anime.releaseDate}</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );

    const SectionHeader = ({ title, subtitle }) => (
        <div className="flex items-end justify-between mb-6 group cursor-pointer">
            <div>
                {subtitle && <p className="text-premium-accent text-sm font-bold tracking-widest uppercase mb-1">{subtitle}</p>}
                <h2 className="text-3xl font-bold text-white tracking-tight relative inline-block">
                    {title}
                    <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-premium-accent rounded-full transition-all group-hover:w-full"></div>
                </h2>
            </div>
            <span className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                View All <Play className="w-4 h-4" />
            </span>
        </div>
    );

    if (query) {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <SectionHeader title={`Search Results for "${query}"`} subtitle="Explore" />
                {searchResults.length > 0 ? (
                    <AnimeGrid items={searchResults} />
                ) : (
                    <div className="text-center text-gray-500 py-24 glass-panel rounded-2xl">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                        <p>We couldn't find anything matching your query. Try a different term.</p>
                    </div>
                )}
            </div>
        );
    }

    const heroAnime = homeData.spotlights[heroIndex];

    return (
        <div className="w-full animate-in fade-in duration-700 pb-20">
            {/* Massive Premium Hero Section */}
            {heroAnime && (
                <div className="relative w-full h-[70vh] min-h-[500px] mb-16 overflow-hidden">
                    <div className="absolute inset-0 transition-opacity duration-1000">
                        <img
                            src={heroAnime.image}
                            alt="Hero Background"
                            className="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-premium-900/60 to-transparent"></div>
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-premium-900 to-transparent"></div>
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-premium-900 via-premium-900/80 to-transparent"></div>
                    </div>

                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-2xl mt-20">
                            <span className="inline-block px-3 py-1 bg-white/10 text-premium-accent font-bold text-xs tracking-widest uppercase rounded-full mb-4 backdrop-blur-md border border-white/5">
                                #{heroIndex + 1} Spotlight
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl line-clamp-2">
                                {heroAnime.title.english || heroAnime.title.romaji}
                            </h1>
                            <div className="flex items-center gap-4 text-sm font-semibold text-gray-300 mb-6 drop-shadow-lg">
                                <span className="flex items-center gap-1 text-yellow-500 bg-black/40 px-2 py-1 rounded">
                                    <Star className="w-4 h-4" fill="currentColor" /> 9.8
                                </span>
                                <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
                                    <Clock className="w-4 h-4" /> 24m
                                </span>
                                <span className="bg-premium-accent/80 text-white px-2 py-1 rounded">HD</span>
                                <span className="border border-white/20 px-2 py-1 rounded">TV Series</span>
                            </div>
                            <p className="text-lg text-gray-300 mb-8 line-clamp-3 leading-relaxed drop-shadow-lg max-w-xl">
                                {heroAnime.description || "In a world full of magic and fantasy, an unforgettable journey begins. Experience the most thrilling anime of the season..."}
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    to={`/anime/${heroAnime.id}`}
                                    className="px-8 py-4 bg-premium-accent hover:bg-premium-accentHover text-white font-bold rounded-full transition-all flex items-center gap-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                                >
                                    <Play fill="currentColor" className="w-5 h-5" /> Watch Now
                                </Link>
                                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all backdrop-blur-md">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-8 right-8 flex gap-2">
                        {homeData.spotlights.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-8 bg-premium-accent' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
                {historyData.length > 0 && (
                    <section>
                        <SectionHeader title="Continue Watching" subtitle="Jump right back in" />
                        <AnimeGrid items={historyData.map(h => ({
                            id: h.animeId,
                            image: h.image,
                            title: { english: h.animeTitle },
                            episodeNumber: h.episodeNumber,
                            customUrl: `/watch/${encodeURIComponent(h.episodeId)}?animeId=${h.animeId}`,
                            progressPercentage: h.duration ? (h.timestamp / h.duration) * 100 : null
                        }))} />
                    </section>
                )}

                {homeData.trending.length > 0 && (
                    <section>
                        <SectionHeader title="Trending Now" subtitle="Hot" />
                        <AnimeGrid items={homeData.trending.slice(0, 12)} />
                    </section>
                )}

                {homeData.popular.length > 0 && (
                    <section>
                        <SectionHeader title="Most Popular" subtitle="All Time Favorites" />
                        <AnimeGrid items={homeData.popular.slice(0, 12)} />
                    </section>
                )}

                {homeData.recent.length > 0 && (
                    <section>
                        <SectionHeader title="Recently Added" subtitle="Fresh Episodes" />
                        <AnimeGrid items={homeData.recent.slice(0, 12)} />
                    </section>
                )}
            </div>
        </div>
    );
}
