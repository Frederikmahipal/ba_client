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
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;