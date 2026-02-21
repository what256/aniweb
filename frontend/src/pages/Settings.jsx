import { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle2, Clock, Library, Trash2 } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        provider: 'gogoanime',
        defaultQuality: 'auto',
        preferredSub: 'english',
        autoPlayNextEpisode: true,
        autoSkipIntro: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const activeProfileId = localStorage.getItem('activeProfileId');
    const [stats, setStats] = useState({ totalTime: 0, seriesStarted: 0 });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load settings', err);
                setLoading(false);
            });

        if (activeProfileId) {
            fetch(`/api/history/${activeProfileId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.history) {
                        const totalSeconds = data.history.reduce((acc, curr) => acc + (curr.timestamp || 0), 0);
                        setStats({ totalTime: totalSeconds, seriesStarted: data.history.length });
                    }
                })
                .catch(err => console.error("Failed to fetch history stats", err));
        }
    }, [activeProfileId]);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setMessage({ text: 'Settings saved successfully!', type: 'success' });
            } else {
                setMessage({ text: 'Failed to save settings.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred while saving.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-12">
            <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Performance & Settings
            </h1>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-premium-accent">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Time Watched</p>
                        <h3 className="text-4xl font-black text-white">{formatTime(stats.totalTime)}</h3>
                    </div>
                    <Clock className="w-12 h-12 text-premium-accent/20" />
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-purple-500">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Series Started</p>
                        <h3 className="text-4xl font-black text-white">{stats.seriesStarted}</h3>
                    </div>
                    <Library className="w-12 h-12 text-purple-500/20" />
                </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl space-y-6">
                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Primary Provider</label>
                        <select
                            name="provider"
                            value={settings.provider}
                            onChange={handleChange}
                            className="w-full bg-premium-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-premium-accent transition-all"
                        >
                            <option value="gogoanime">Gogoanime (Recommended)</option>
                            <option value="zoro">Zoro</option>
                            <option value="enime">Enime</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">The backend provider used to scrape raw video streams.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Default Video Quality</label>
                        <select
                            name="defaultQuality"
                            value={settings.defaultQuality}
                            onChange={handleChange}
                            className="w-full bg-premium-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-premium-accent transition-all"
                        >
                            <option value="auto">Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="360p">360p</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Audio/Sub</label>
                        <select
                            name="preferredSub"
                            value={settings.preferredSub}
                            onChange={handleChange}
                            className="w-full bg-premium-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-premium-accent transition-all"
                        >
                            <option value="english">English (Subbed)</option>
                            <option value="dub">English (Dubbed)</option>
                        </select>
                    </div>

                    <div className="pt-4 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="autoPlayNextEpisode"
                                    checked={settings.autoPlayNextEpisode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-premium-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-premium-accent"></div>
                            </div>
                            <span className="text-sm font-medium text-white">Auto-Play Next Episode</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="autoSkipIntro"
                                    checked={settings.autoSkipIntro}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-premium-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-premium-accent"></div>
                            </div>
                            <span className="text-sm font-medium text-white">Auto-Skip Opening/Intro (Experimental)</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-premium-accent hover:bg-premium-accentHover disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-premium-accent/25"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
