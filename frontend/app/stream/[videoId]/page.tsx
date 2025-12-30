'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import HLS from 'hls.js';

export default function VideoPlayer() {
  const params = useParams();
  const videoId = params.videoId as string;
  const playerRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HLS | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<{ height: number; bitrate: number; index: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (playerRef.current) {
      if (HLS.isSupported()) {
        const HLSInstance = new HLS({
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
          enableWorker: true,
          debug: false,
        });

        hlsRef.current = HLSInstance;

        HLSInstance.loadSource(`http://localhost:3001/outputs/${videoId}/master.m3u8`);
        HLSInstance.attachMedia(playerRef.current);

        HLSInstance.on(HLS.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          const levels = HLSInstance.levels.map((level, index) => ({
            height: level.height,
            bitrate: level.bitrate,
            index,
          }));
          setQualityLevels(levels);
        });

        HLSInstance.on(HLS.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentQuality(data.level);
        });

        HLSInstance.on(HLS.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('Failed to load video stream');
            setIsLoading(false);
          }
        });
      } else if (playerRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        playerRef.current.src = `http://localhost:3001/outputs/${videoId}/master.m3u8`;
        setIsLoading(false);
      } else {
        setError('HLS is not supported in your browser');
        setIsLoading(false);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoId]);

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  const formatBitrate = (bitrate: number) => {
    return `${(bitrate / 1000000).toFixed(2)} Mbps`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Adaptive Video Player
              </h1>
              <p className="text-gray-400">Streaming with HLS technology</p>
            </div>
            <a
              href="/upload"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Upload New Video
            </a>
          </div>
        </div>

        {/* Main Video Container */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading video...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center px-6">
                  <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-xl font-semibold mb-2">Error</p>
                  <p className="text-gray-400">{error}</p>
                </div>
              </div>
            )}

            <video
              ref={playerRef}
              controls
              className="w-full h-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          {/* Video Info and Controls */}
          <div className="p-6 space-y-6">
            {/* Video Details */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Video ID</h2>
                <p className="text-gray-400 font-mono text-sm">{videoId}</p>
              </div>
              <div className="flex items-center space-x-4">
                {isPlaying && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-500 bg-opacity-20 rounded-lg border border-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Playing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Selector */}
            {qualityLevels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Quality Settings
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      currentQuality === -1
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Auto
                  </button>
                  {qualityLevels.map((level) => (
                    <button
                      key={level.index}
                      onClick={() => handleQualityChange(level.index)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        currentQuality === level.index
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-sm">{level.height}p</div>
                      <div className="text-xs opacity-75">{formatBitrate(level.bitrate)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stream Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Technology</p>
                    <p className="text-white font-semibold">HLS Streaming</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Adaptive</p>
                    <p className="text-white font-semibold">Enabled</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Quality Levels</p>
                    <p className="text-white font-semibold">{qualityLevels.length} Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}