import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, Play, MonitorPlay, Settings as SettingsIcon } from 'lucide-react';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';
import Watch from './pages/Watch';
import Settings from './pages/Settings';

function Navbar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <MonitorPlay className="w-8 h-8 text-premium-accent group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-premium-accent to-purple-500">
                        Aniweb
                    </span>
                </Link>
                <form onSubmit={handleSearch} className="relative w-full max-w-md hidden md:block">
                    <input
                        type="text"
                        placeholder="Search anime..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-premium-700/50 text-white rounded-full py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-premium-accent transition-all placeholder:text-gray-400"
                    />
                    <Search className="absolute left-4 top-2.5 w-5 h-5 text-gray-400" />
                </form>
                <Link to="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <SettingsIcon className="w-6 h-6" />
                </Link>
            </div>
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/anime/:id" element={<AnimeDetails />} />
                        <Route path="/watch/:episodeId" element={<Watch />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
