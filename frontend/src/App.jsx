import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, MonitorPlay, Settings as SettingsIcon, Menu, X, Heart, Users } from 'lucide-react';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';
import Watch from './pages/Watch';
import Settings from './pages/Settings';
import SelectProfile from './pages/SelectProfile';

function Navbar({ onSwitchProfile }) {
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query)}`);
            setMobileMenuOpen(false);
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-premium-900/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/50' : 'bg-transparent border-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <MonitorPlay className="w-8 h-8 text-premium-accent group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black tracking-wider text-white">
                                ANI<span className="text-premium-accent">WEB</span>
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                            <Link to="/" className="hover:text-white transition-colors uppercase tracking-wider">Home</Link>
                            <Link to="/?search=action" className="hover:text-white transition-colors uppercase tracking-wider">Action</Link>
                            <Link to="/?search=isekai" className="hover:text-white transition-colors uppercase tracking-wider">Isekai</Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
                        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                            <input
                                type="text"
                                placeholder="Search anime..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-white/5 text-white rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-premium-accent transition-all placeholder:text-gray-500 border border-white/10 hover:border-white/20"
                            />
                            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                        </form>
                        <button onClick={onSwitchProfile} title="Switch Profile" className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <Users className="w-6 h-6" />
                        </button>
                        <Link to="/settings" title="Settings" className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white group">
                            <SettingsIcon className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white">
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-premium-900 border-b border-white/10 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search anime..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-premium-accent border border-white/10"
                        />
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    </form>
                    <div className="flex flex-col gap-2">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-white rounded-lg hover:bg-white/5">Home</Link>
                        <button onClick={() => { setMobileMenuOpen(false); onSwitchProfile(); }} className="px-4 py-3 text-left text-white rounded-lg hover:bg-white/5 flex items-center justify-between">
                            Switch Profile <Users className="w-5 h-5" />
                        </button>
                        <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-white rounded-lg hover:bg-white/5 flex items-center justify-between">
                            Settings <SettingsIcon className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

function Footer() {
    return (
        <footer className="border-t border-white/5 bg-premium-900/50 py-12 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
                <Link to="/" className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <MonitorPlay className="w-6 h-6 text-premium-accent" />
                    <span className="text-xl font-black tracking-wider text-white">
                        ANI<span className="text-premium-accent">WEB</span>
                    </span>
                </Link>
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium tracking-wide flex-wrap justify-center">
                    <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <a href="#" className="hover:text-white transition-colors">Categories</a>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <a href="#" className="hover:text-white transition-colors">Our Blog</a>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <a href="#" className="hover:text-white transition-colors">Contacts</a>
                </div>
                <p className="text-sm text-gray-600 mt-4 flex items-center justify-center gap-1">
                    Copyright ©{new Date().getFullYear()} All rights reserved | Made with <Heart className="w-3 h-3 text-red-500 mx-1" fill="currentColor" /> for Anime Fans
                </p>
            </div>
        </footer>
    );
}

function App() {
    const [activeProfileId, setActiveProfileId] = useState(localStorage.getItem('activeProfileId'));

    const handleSelectProfile = (id) => {
        setActiveProfileId(id);
    };

    const handleSwitchProfile = () => {
        localStorage.removeItem('activeProfileId');
        setActiveProfileId(null);
    };

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col font-sans bg-premium-900 text-white selection:bg-premium-accent selection:text-white">
                {!activeProfileId ? (
                    <SelectProfile onSelectProfile={handleSelectProfile} />
                ) : (
                    <>
                        <Navbar onSwitchProfile={handleSwitchProfile} />
                        <main className="flex-1 w-full pt-20 flex flex-col">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/anime/:id" element={<AnimeDetails />} />
                                <Route path="/watch/:episodeId" element={<Watch />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="*" element={<Home />} />
                            </Routes>
                        </main>
                        <Footer />
                    </>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
