'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function YouTubeDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    let script;
    if (!window.YT) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API is ready");
        window.YT_API_READY = true;
      };
      
      document.body.appendChild(script);
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
      delete window.onYouTubeIframeAPIReady;
      delete window.youtubePlayer;
    };
  }, []);
  
  useEffect(() => {
    if (!videoUrl) return;
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    let timeoutId = null;

    if (player) {
      try {
        player.cueVideoById(videoId);
        return;
      } catch (error) {
        console.error("Error loading video:", error);
      }
    }

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) {
        timeoutId = setTimeout(initializePlayer, 100);
        return;
      }

      try {
        console.log("Creating new YouTube player...");
        if (player) {
          player.destroy();
          setPlayer(null);
        }
        const newPlayer = new window.YT.Player("youtube-player", {
          videoId: videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
          },
          events: {
            onReady: (event) => {
              console.log("Player ready with video");
              setPlayer(event.target);
            },
            onError: (error) => {
              console.error("YouTube player error:", error);
              setError("Error loading video");
            }
          }
        });
      } catch (error) {
        console.error("Error creating YouTube player:", error);
        timeoutId = setTimeout(initializePlayer, 100);
      }
    };

    initializePlayer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [videoUrl]);

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    setError(null);
    setDownloadUrl(null);
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const response = await axios.post('https://all-media-api.p.rapidapi.com/v1/social/youtube/detail', {
        url: videoUrl
      }, {
        headers: {
          'x-rapidapi-key': 'bb18653d4dmsh9763ddd8e0a6f76p1896cejsnb2c4604c6ecc',
          'x-rapidapi-host': 'all-media-api.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.streamingData && response.data.streamingData.formats) {
        const format = response.data.streamingData.formats[0];
        setDownloadUrl(format.url);
      } else {
        setError("No download URL found");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Error getting download link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async (url) => {
    try {
      setLoading(true);
      console.log('Iniciando la descarga del video...');
      
      const response = await fetch('http://localhost:3000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `youtube_video_${extractVideoId(videoUrl)}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Descarga completada');
      setLoading(false);
    } catch (error) {
      console.error('Error durante la descarga:', error);
      setError('Error durante la descarga del video');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center">
      <div className="container mx-auto px-4">
        <div className="relative px-4 py-10 bg-white shadow rounded-3xl sm:p-10">
          <div className="w-full">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">YouTube Video Downloader</h1>
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  <div className="lg:order-2">
                    <div 
                      className="rounded-lg overflow-hidden mb-4 bg-gray-100"
                      style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        height: 0,
                      }}
                    >
                      <div 
                        id="youtube-player"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-6 lg:order-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter YouTube URL here"
                        value={videoUrl}
                        onChange={handleUrlChange}
                        className="w-full px-4 py-2 text-lg border rounded"
                        aria-label="YouTube URL"
                      />
                    </div>

                    <button
                      onClick={handleDownload}
                      disabled={loading || !videoUrl}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-live="polite"
                    >
                      {loading ? 'Getting download link...' : 'Download Video'}
                    </button>

                    {error && (
                      <div className="text-red-500 text-sm mt-2" role="alert">
                        {error}
                      </div>
                    )}

                    {downloadUrl && (
                      <button
                        onClick={() => downloadVideo(downloadUrl)}
                        className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        disabled={loading}
                      >
                        {loading ? 'Downloading...' : 'Click to Download'}
                      </button>
                    )}
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
