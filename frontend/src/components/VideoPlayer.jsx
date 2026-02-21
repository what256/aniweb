import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Volume2, VolumeX, Maximize, Play, Pause, Settings } from 'lucide-react';

export default function VideoPlayer({ url, poster, onEnded, onProgress, initialTimestamp }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hasSeekedInit = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    let controlsTimeout = null;

    useEffect(() => {
        if (!videoRef.current || !url) return;

        let hls;
        if (Hls.isSupported()) {
            hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
            });
            hls.loadSource(url);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (initialTimestamp && !hasSeekedInit.current && videoRef.current) {
                    videoRef.current.currentTime = initialTimestamp;
                    hasSeekedInit.current = true;
                }
            });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = url;
            const handleLoaded = () => {
                if (initialTimestamp && !hasSeekedInit.current && videoRef.current) {
                    videoRef.current.currentTime = initialTimestamp;
                    hasSeekedInit.current = true;
                }
            };
            videoRef.current.addEventListener('loadedmetadata', handleLoaded);
            return () => {
                if (videoRef.current) videoRef.current.removeEventListener('loadedmetadata', handleLoaded);
            };
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [url, initialTimestamp]);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(currentProgress);
        if (onProgress) {
            onProgress(videoRef.current.currentTime, videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full cursor-pointer"
                poster={poster}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onEnded}
            />

            {/* Custom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <div
                    className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress relative"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-premium-accent rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-premium-accent transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-premium-accent transition-colors">
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-white hover:text-premium-accent transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} className="text-white hover:text-premium-accent transition-colors">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
