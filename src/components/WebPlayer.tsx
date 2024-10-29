import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

//clean up this 

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface PlayerState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: {
        name: string;
        artists: Array<{ name: string }>;
        album: {
          images: Array<{ url: string }>;
        };
      };
    };
  }
  
  const SpotifyPlayer: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [player, setPlayer] = useState<Spotify.Player | null>(null);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState<any>(null);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  
    // Initialize the Spotify Web Playback SDK
    useQuery({
      queryKey: ['spotifyPlayer'],
      queryFn: async () => {
        try {
          // Wait for the SDK to load
          await new Promise<void>((resolve, reject) => {
            if (window.Spotify) {
              resolve();
              return;
            }
  
            window.onSpotifyWebPlaybackSDKReady = () => {
              console.log("The Web Playback SDK is ready");
              resolve();
            };
  
            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            script.onerror = reject;
            document.body.appendChild(script);
          });
  
          // Initialize the player
          const newPlayer = new window.Spotify.Player({
            name: 'Web Playback SDK',
            getOAuthToken: cb => { cb(user?.accessToken || ''); },
            volume: 0.5
          });
  
          // Error handling
          newPlayer.addListener('initialization_error', ({ message }) => {
            console.error('Failed to initialize', message);
          });
  
          newPlayer.addListener('authentication_error', ({ message }) => {
            console.error('Failed to authenticate', message);
          });
  
          newPlayer.addListener('account_error', ({ message }) => {
            console.error('Failed to validate Spotify account', message);
          });
  
          newPlayer.addListener('playback_error', ({ message }) => {
            console.error('Failed to perform playback', message);
          });
  
          // Device ready handler
          newPlayer.addListener('ready', async ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            queryClient.setQueryData(['spotifyDeviceId'], device_id);
            
            try {
              // Set this as the active device
              await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${user?.accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  device_ids: [device_id],
                  play: false,
                })
              });
              setActive(true);
              console.log('Device activated successfully');
            } catch (error) {
              console.error('Error activating device:', error);
            }
          });
  
          newPlayer.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
            setActive(false);
          });
  
          newPlayer.addListener('player_state_changed', (state) => {
            if (!state) {
              setActive(false);
              return;
            }
            setPlayerState(state);
            setTrack(state.track_window.current_track);
            setActive(true);
          });
  
          // Connect to the player
          const connected = await newPlayer.connect();
          
          if (connected) {
            console.log('Successfully connected to Spotify!');
            setPlayer(newPlayer);
          } else {
            throw new Error('Failed to connect to Spotify');
          }
  
          return newPlayer;
        } catch (error) {
          console.error('Error initializing Spotify player:', error);
          throw error;
        }
      },
      enabled: !!user?.accessToken,
      gcTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

  const handlePlayPause = () => {
    player?.togglePlay();
  };

  const handlePrevious = () => {
    player?.previousTrack();
  };

  const handleNext = () => {
    player?.nextTrack();
  };

  if (!is_active) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-base-200 p-4">
        <div className="text-center">
          Instance not active. Transfer your playback using your Spotify app
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Current Track Info */}
          <div className="flex items-center space-x-4">
            {current_track?.album.images[0]?.url && (
              <img 
                src={current_track.album.images[0].url}
                alt={current_track.name}
                className="w-12 h-12 rounded-lg"
              />
            )}
            <div>
              <div className="font-medium">{current_track?.name}</div>
              <div className="text-sm opacity-70">
                {current_track?.artists.map((artist: any) => artist.name).join(', ')}
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-4">
            <button 
              className="btn btn-circle btn-sm"
              onClick={handlePrevious}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            <button 
              className="btn btn-circle btn-sm"
              onClick={handlePlayPause}
            >
              {playerState?.paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button 
              className="btn btn-circle btn-sm"
              onClick={handleNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-1/3 flex items-center space-x-2">
            <span className="text-xs">
              {formatTime(playerState?.position || 0)}
            </span>
            <input 
              type="range"
              min={0}
              max={playerState?.duration || 0}
              value={playerState?.position || 0}
              className="range range-xs range-primary flex-grow"
              onChange={(e) => {
                player?.seek(parseInt(e.target.value));
              }}
            />
            <span className="text-xs">
              {formatTime(playerState?.duration || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default SpotifyPlayer;