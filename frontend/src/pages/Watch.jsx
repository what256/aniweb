import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

export default function Watch() {
    const { episodeId } = useParams();
    const [searchParams] = useSearchParams();
    const animeId = searchParams.get('animeId');

    const [streamInfo, setStreamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('default');

    useEffect(() => {
        const fetchStream = async () => {
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

            } catch (err) {
                console.error(err);
                setError('Failed to load video stream.');
            } finally {
                setLoading(false);
            }
        };
        fetchStream();
    }, [episodeId]);

    const currentSource = streamInfo?.sources?.find(s => s.quality === selectedQuality)?.url;

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
                    <VideoPlayer url={currentSource} />
                )}
            </div>

            {!loading && !error && streamInfo && (
                <div className="glass-panel p-6 rounded-2xl flex flex-wrap gap-6 items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Currently Watching
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Episode ID: {episodeId}
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
