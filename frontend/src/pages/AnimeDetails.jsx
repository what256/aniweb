import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Film, Heart, Share2, Plus } from 'lucide-react';

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
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    if (!anime) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <Film className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-white mb-2">Anime Not Found</h2>
            <p>The requested anime could not be loaded or does not exist.</p>
            <Link to="/" className="mt-6 px-6 py-2 bg-premium-accent text-white rounded-full hover:bg-premium-accentHover transition-colors">
                Return Home
            </Link>
        </div>
    );

    const firstEpisode = anime.episodes?.[0];

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            {/* Massive Cinematic Backdrop */}
            <div className="absolute top-0 left-0 right-0 h-[60vh] overflow-hidden -z-10 bg-premium-900 pointer-events-none">
                <img
                    src={anime.cover || anime.image}
                    alt="Backdrop"
                    className="w-full h-full object-cover opacity-20 blur-md scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-premium-900 via-premium-900/40 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-premium-900 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-32 flex flex-col md:flex-row gap-10">

                {/* Left Side: Poster & Quick Actions */}
                <div className="md:w-1/3 lg:w-1/4 shrink-0 flex flex-col gap-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                        <img
                            src={anime.image}
                            alt={anime.title.english || anime.title.romaji}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-black/60 hover:bg-premium-accent backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 bg-black/60 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {firstEpisode ? (
                        <Link
                            to={`/watch/${encodeURIComponent(firstEpisode.id)}?animeId=${anime.id}`}
                            className="w-full py-4 bg-premium-accent hover:bg-premium-accentHover text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-1"
                        >
                            <Play fill="currentColor" className="w-5 h-5" /> Start Watching
                        </Link>
                    ) : (
                        <button disabled className="w-full py-4 bg-white/5 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                            No Episodes Available
                        </button>
                    )}

                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5">
                        <Plus className="w-5 h-5" /> Add to List
                    </button>
                </div>

                {/* Right Side: Details & Episodes */}
                <div className="flex-1 pt-4">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 hover:text-premium-accent transition-colors">
                            {anime.title.english || anime.title.romaji}
                        </h1>
                        <h2 className="text-xl text-gray-400 font-medium italic mb-6">
                            {anime.title.romaji !== anime.title.english ? anime.title.romaji : 'Japanese Title Unavailable'}
                        </h2>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-300 font-medium mb-8">
                            {anime.rating && (
                                <span className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg shadow-sm">
                                    <Star className="w-4 h-4" fill="currentColor" /> {(anime.rating / 10).toFixed(1)} Score
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                <span className="bg-premium-accent text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mr-1">HD</span>
                                1080p
                            </span>
                            {anime.type && (
                                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg capitalize">
                                    <Film className="w-4 h-4 text-gray-400" /> {anime.type}
                                </span>
                            )}
                            {anime.status && (
                                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    <span className={anime.status.toLowerCase().includes('ongoing') ? 'text-emerald-400' : ''}>{anime.status}</span>
                                </span>
                            )}
                            {anime.releaseDate && (
                                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-400" /> {anime.releaseDate}
                                </span>
                            )}
                        </div>

                        <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-premium-accent"></div>
                            <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
                            <p className="text-gray-300 text-base md:text-lg leading-relaxed content-text"
                                dangerouslySetInnerHTML={{ __html: anime.description || "No description available for this title." }} />
                        </div>
                    </div>

                    {/* Episodes Section */}
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-premium-accent/20 rounded-lg">
                                    <Play className="w-6 h-6 text-premium-accent" fill="currentColor" />
                                </div>
                                Episodes
                                <span className="text-lg text-gray-500 font-normal ml-2">({anime.episodes?.length || 0})</span>
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5">
                                    Sort
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {anime.episodes?.map((ep) => (
                                <Link
                                    key={ep.id}
                                    to={`/watch/${encodeURIComponent(ep.id)}?animeId=${anime.id}`}
                                    className="group bg-premium-800/50 hover:bg-premium-800 border border-white/5 hover:border-premium-accent/50 p-4 rounded-xl transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-premium-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="relative z-10 w-12 h-12 shrink-0 bg-premium-900 rounded-lg flex flex-col items-center justify-center border border-white/10 group-hover:border-premium-accent transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">EP</span>
                                        <span className="font-bold text-premium-accent leading-none">{ep.number}</span>
                                    </div>

                                    <div className="relative z-10 flex-1 min-w-0">
                                        <h4 className="font-semibold text-white truncate group-hover:text-premium-accent transition-colors">
                                            {ep.title || `Episode ${ep.number}`}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {anime.title.english || anime.title.romaji}
                                        </p>
                                    </div>

                                    <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-premium-accent transition-all transform group-hover:translate-x-0 translate-x-4">
                                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                                    </div>
                                </Link>
                            ))}
                            {(!anime.episodes || anime.episodes.length === 0) && (
                                <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                    No episodes have been indexed yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
