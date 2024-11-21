import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import PlayerControls from './PlayerControls';
import TrackInfo from './TrackInfo';
import ProgressBar from './ProgressBar';

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

  const fetchCurrentPlayback = async (accessToken: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.status === 200) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching current playback:', error);
      return null;
    }
  };

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
          
          try {
            // Add initial delay to ensure player is ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // First fetch current playback state
            const currentPlayback = await fetchCurrentPlayback(user?.accessToken || '');
            
            if (!currentPlayback || !currentPlayback.item) {
              // If there's no current playback, try to get recently played tracks
              const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                headers: {
                  'Authorization': `Bearer ${user?.accessToken}`,
                },
              });
              
              if (recentResponse.ok) {
                const recentTracks = await recentResponse.json();
                if (recentTracks.items?.length > 0) {
                  // First, transfer to our device
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
        
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Then start playing the most recently played track
                  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${user?.accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      uris: [recentTracks.items[0].track.uri],
                      position_ms: 0
                    }),
                  });
                }
              }
            } else {
              // Transfer playback to our device
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
        
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Start playing with the exact position
              await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${user?.accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uris: [currentPlayback.item.uri],
                  position_ms: currentPlayback.progress_ms || 0
                })
              });
        
              // Set the correct play state
              if (!currentPlayback.is_playing) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await player?.pause();
              }
            }
            
            setActive(true);
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
    <div className="fixed bottom-0 left-0 right-0 bg-secondary">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <TrackInfo currentTrack={current_track} />
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
  isPaused={playerState?.paused || false}  // Add this prop
/>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;