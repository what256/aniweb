import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function SelectProfile({ onSelectProfile }) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [pinEntry, setPinEntry] = useState('');
    const [pinError, setPinError] = useState('');

    useEffect(() => {
        fetch('/api/profiles')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProfiles(data.profiles);
                } else {
                    setError('Failed to load profiles');
                }
            })
            .catch(err => setError('Error syncing with backend.'))
            .finally(() => setLoading(false));
    }, []);

    const handleProfileClick = (profile) => {
        if (profile.hasPin) {
            setSelectedProfile(profile);
            setPinEntry('');
            setPinError('');
        } else {
            loginProfile(profile.id, null);
        }
    };

    const loginProfile = async (id, pin) => {
        try {
            const res = await fetch('/api/profiles/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, pin })
            });
            const data = await res.json();
            if (data.success) {
                // Success
                localStorage.setItem('activeProfileId', data.token);
                onSelectProfile(id); // Inform App.jsx
            } else {
                setPinError(data.error || 'Authentication failed');
            }
        } catch (e) {
            setPinError('Connection error');
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        loginProfile(selectedProfile.id, pinEntry);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-premium-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-premium-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-premium-900 flex items-center justify-center text-red-500 font-bold">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-premium-900 flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
            {!selectedProfile ? (
                <>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">Who's watching?</h1>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-4xl">
                        {profiles.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => handleProfileClick(profile)}
                                className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
                            >
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-transparent group-hover:border-white transition-colors duration-300">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="w-full h-full object-cover bg-premium-800"
                                    />
                                    {profile.hasPin && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex justify-center">
                                            <Lock className="w-4 h-4 text-white/70" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-gray-400 group-hover:text-white font-medium text-lg transition-colors">
                                    {profile.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button className="mt-16 px-6 py-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white uppercase tracking-widest text-sm font-semibold transition-colors">
                        Manage Profiles
                    </button>
                </>
            ) : (
                <div className="w-full max-w-md bg-premium-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <button
                        onClick={() => setSelectedProfile(null)}
                        className="self-start text-gray-400 hover:text-white mb-6 text-sm flex items-center gap-2 transition-colors"
                    >
                        &larr; Back
                    </button>

                    <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-24 h-24 rounded-xl shadow-lg bg-premium-700 mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {selectedProfile.name}</h2>
                    <p className="text-gray-400 mb-8 text-center">Please enter your PIN to access this profile.</p>

                    <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
                        <input
                            type="password"
                            placeholder="PIN code"
                            maxLength={4}
                            value={pinEntry}
                            onChange={(e) => setPinEntry(e.target.value)}
                            className="w-full bg-premium-900 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-premium-accent transition-colors"
                            autoFocus
                        />
                        {pinError && <p className="text-red-400 text-sm text-center">{pinError}</p>}
                        <button type="submit" disabled={pinEntry.length < 4} className="w-full mt-4 py-3 bg-premium-accent hover:bg-premium-accentHover disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                            Enter
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
