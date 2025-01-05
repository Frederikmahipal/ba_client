import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import PlayerControls from './PlayerControls';
import TrackInfo from './TrackInfo';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { WebPlaybackTrack, PlayerState } from '../../models/player';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const SpotifyPlayer: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState<WebPlaybackTrack | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    paused: true,  // Initialize as paused
    position: 0,
    duration: 0,
    track_window: {
      current_track: {  // Provide a minimal WebPlaybackTrack structure
        name: '',
        artists: [],
        album: {
          images: []
        }
      }
    }
  });

  useQuery({
    queryKey: ['spotifyPlayer'],
    queryFn: async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          if (window.Spotify) {
            resolve();
            return;
          }

          window.onSpotifyWebPlaybackSDKReady = () => {
            console.log("Web Playback SDK is ready");
            resolve();
          };

          const script = document.createElement("script");
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          script.onerror = reject;
          document.body.appendChild(script);
        });

        const newPlayer = new window.Spotify.Player({
          name: 'Web Player',
          getOAuthToken: (cb: (token: string) => void) => { cb(user?.accessToken || ''); },
          volume: 0.5
        });

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

        newPlayer.addListener('ready', async ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          queryClient.setQueryData(['spotifyDeviceId'], device_id);
          
          if (!user?.accessToken) {
            console.error('No access token available');
            return;
          }

          try {
            // Add initial delay to ensure player is ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if we've recently tried to activate (to avoid rate limit)
            const lastAttempt = queryClient.getQueryData(['deviceActivationAttempt']) as number | undefined;
            const now = Date.now();
            if (lastAttempt && (now - lastAttempt) < 60000) { // 1 minute cooldown
              return;
            }
            
            queryClient.setQueryData(['deviceActivationAttempt'], now);

            const response = await fetch('http://localhost:4000/api/spotify/player/activate-device', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${user.accessToken}`,
                'Content-Type': 'application/json',
                'credentials': 'include'
              },
              credentials: 'include',
              body: JSON.stringify({
                deviceId: device_id
              })
            });

            if (response.status === 429) {
              // Rate limit hit - silently handle it
              console.log('Rate limit reached for device activation');
              return;
            }

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            setActive(true);
          } catch (error) {
            // Only log non-rate-limit errors
            if (error instanceof Error && !error.message.includes('429')) {
              console.error('Error activating device:', error);
            }
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

        const connected = await newPlayer.connect();
        
        if (connected) {
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
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 p-4">
        <div className="text-center">
          Instance not active. Transfer your playback using your Spotify app
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <div className="px-4 py-2">
        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <div className="w-[30%]">
            <TrackInfo currentTrack={current_track} />
          </div>
          <div className="flex flex-col items-center w-[40%]">
            <PlayerControls
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isPaused={playerState?.paused || false}
            />
            <ProgressBar
              position={playerState?.position || 0}
              duration={playerState?.duration || 0}
              onSeek={(position) => player?.seek(position)}
              isPaused={playerState?.paused || false}
            />
          </div>
          <div className="w-[30%] flex justify-end">
            <VolumeControl player={player} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Progress Bar at the top */}
          <div className="mb-1">
            <ProgressBar
              position={playerState?.position || 0}
              duration={playerState?.duration || 0}
              onSeek={(position) => player?.seek(position)}
              isPaused={playerState?.paused || false}
            />
          </div>
          
          {/* Controls and Track Info in one row */}
          <div className="flex items-center justify-between">
            {/* Track Info - Compact */}
            <div className="flex items-center flex-1 min-w-0">
              {current_track?.album?.images[0]?.url && (
                <img
                  src={current_track.album.images[0].url}
                  alt={current_track.name}
                  className="w-8 h-8 rounded-lg mr-2"
                />
              )}
              <div className="truncate">
                <div className="font-medium text-sm text-white truncate">
                  {current_track?.name}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {current_track?.artists.map(artist => artist.name).join(', ')}
                </div>
              </div>
            </div>

            {/* Controls - Compact */}
            <div className="flex items-center gap-1 ml-1">
              <button 
                className="text-[#b3b3b3] hover:text-white transition-colors p-1"
                onClick={handlePrevious}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
                </svg>
              </button>
              <button 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:scale-105 transition-transform"
                onClick={handlePlayPause}
              >
                {playerState?.paused ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
                    <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
                    <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" />
                  </svg>
                )}
              </button>
              <button 
                className="text-[#b3b3b3] hover:text-white transition-colors p-1"
                onClick={handleNext}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;