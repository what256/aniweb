import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, Star, Calendar } from 'lucide-react';

export default function Home() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search');

    const [animeList, setAnimeList] = useState([]);
    const [recentList, setRecentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnime = async () => {
            setLoading(true);
            try {
                if (query) {
                    const res = await fetch(`http://localhost:5000/api/anime/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setAnimeList(data.results || []);
                    setRecentList([]);
                } else {
                    const [trendingRes, recentRes] = await Promise.all([
                        fetch('http://localhost:5000/api/anime/trending'),
                        fetch('http://localhost:5000/api/anime/recent')
                    ]);
                    const trendingData = await trendingRes.json();
                    const recentData = await recentRes.json();
                    setAnimeList(trendingData.results || []);
                    setRecentList(recentData.results || []);
                }
            } catch (err) {
                console.error('Failed to fetch anime', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnime();
    }, [query]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    const AnimeGrid = ({ items }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((anime) => (
                <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    className="group relative rounded-xl overflow-hidden glass-panel hover:ring-2 hover:ring-premium-accent transition-all duration-300"
                >
                    <div className="aspect-[2/3] w-full overflow-hidden relative">
                        {anime.episodeNumber && (
                            <div className="absolute top-2 right-2 bg-premium-accent text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-lg">
                                EP {anime.episodeNumber}
                            </div>
                        )}
                        <img
                            src={anime.image}
                            alt={anime.title.english || anime.title.romaji}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-premium-accent text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg shadow-premium-accent/50">
                                <Play fill="currentColor" className="w-6 h-6 ml-1" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                            {anime.title.english || anime.title.romaji}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            {anime.releaseDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {anime.releaseDate}
                                </span>
                            )}
                            {anime.rating && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-3 h-3" fill="currentColor" />
                                    {anime.rating / 10}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            {!query && recentList.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-premium-accent to-purple-400">
                            Recently Updated
                        </h2>
                    </div>
                    <AnimeGrid items={recentList.slice(0, 5)} />
                </section>
            )}

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {query ? `Search Results for "${query}"` : 'Trending Anime'}
                    </h1>
                </div>
                <AnimeGrid items={animeList} />
                {animeList.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12">
                        No anime found. Try a different search.
                    </div>
                )}
            </section>
        </div>
    );
}
