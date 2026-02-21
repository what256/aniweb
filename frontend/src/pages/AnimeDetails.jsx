import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Film } from 'lucide-react';

export default function AnimeDetails() {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnimeInfo = async () => {
            try {
                const res = await fetch(`/api/anime/info/${id}`);
                const data = await res.json();
                setAnime(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnimeInfo();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    if (!anime) return <div>Anime not found</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="relative h-[400px] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={anime.cover || anime.image}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-30 blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-premium-900/80 to-transparent" />
                </div>

                <div className="absolute bottom-0 w-full px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto pb-4">
                    <img
                        src={anime.image}
                        alt={anime.title.english || anime.title.romaji}
                        className="w-48 rounded-xl shadow-2xl border-4 border-premium-800 hidden md:block"
                    />
                    <div className="flex-1 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 line-clamp-2">
                            {anime.title.english || anime.title.romaji}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            {anime.releaseDate && (
                                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4" /> {anime.releaseDate}
                                </span>
                            )}
                            {anime.rating && (
                                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4" fill="currentColor" /> {anime.rating / 10}
                                </span>
                            )}
                            {anime.status && (
                                <span className="flex items-center gap-1 bg-premium-accent/20 text-premium-accent px-3 py-1 rounded-full">
                                    <Clock className="w-4 h-4" /> {anime.status}
                                </span>
                            )}
                            {anime.type && (
                                <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                                    <Film className="w-4 h-4" /> {anime.type}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 max-w-3xl line-clamp-3 md:line-clamp-none mt-4 text-sm md:text-base leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: anime.description }} />
                    </div>
                </div>
            </div>

            <div className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Play className="w-6 h-6 text-premium-accent" fill="currentColor" />
                    Episodes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {anime.episodes?.map((ep) => (
                        <Link
                            key={ep.id}
                            to={`/watch/${encodeURIComponent(ep.id)}?animeId=${anime.id}`}
                            className="glass-panel p-4 rounded-xl hover:bg-white/5 hover:ring-2 hover:ring-premium-accent transition-all duration-300 group flex items-center gap-4"
                        >
                            <div className="bg-premium-800 rounded-lg p-3 text-premium-accent group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5" fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Episode {ep.number}</div>
                                <div className="font-medium line-clamp-1">{ep.title || `Episode ${ep.number}`}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
