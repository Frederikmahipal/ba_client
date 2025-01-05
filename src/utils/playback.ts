import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Track, PlaybackContext } from '../models/track';



interface PlayerState {
  is_playing: boolean;
  item?: Track;
  progress_ms?: number;
  repeat_state?: 'off' | 'track' | 'context';
  shuffle_state?: boolean;
}

export const usePlayback = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const handlePlayTrack = async (
    trackUri: string, 
    track: Track, 
    context?: PlaybackContext
  ) => {
    if (!user?.accessToken) return;
    if (!track || !track.id) {
      console.error('Invalid track data provided:', track);
      return;
    }

    try {
      const deviceId = queryClient.getQueryData(['spotifyDeviceId']);
      if (!deviceId) {
        console.error('No active device found');
        return;
      }

      // First ensure our device is active
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        })
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Prepare playback body based on context
      let playbackBody;
      if (context && context.type !== 'artist') {
        // For album/playlist context
        playbackBody = {
          context_uri: context.uri,
          offset: context.offset ? { uri: context.offset.uri } : { position: context.position },
          position_ms: 0
        };

        // Store the position in the context for future reference
        queryClient.setQueryData(['currentlyPlaying'], (old: any) => ({
          ...old,
          context: {
            ...context,
            position: context.position
          }
        }));
      } else {
        // For single tracks or artist context
        playbackBody = {
          uris: [trackUri],
          position_ms: 0
        };
      }

      // Start playback
      const response = await fetch('http://localhost:4000/api/spotify/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...playbackBody,
          deviceId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start playback');
      }

      // Update local state with context
      queryClient.setQueryData(['currentlyPlaying'], {
        item: track,
        is_playing: true,
        progress_ms: 0,
        context: context ? {
          type: context.type,
          uri: context.uri,
          id: context.id
        } : undefined
      });

      // Clear the existing queue data immediately
      queryClient.setQueryData(['queue'], null);

      // Wait a bit for Spotify to update its state
      await new Promise(resolve => setTimeout(resolve, 300));

      // Force a fresh queue fetch
      await queryClient.fetchQuery({ 
        queryKey: ['queue'],
        queryFn: async () => {
          const response = await fetch('http://localhost:4000/api/spotify/player/queue', {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`
            }
          });
          return response.json();
        },
        staleTime: 0
      });

      // Update recently played after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['recentlyPlayed'] });
      }, 1000);

    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  };

  const togglePlayPause = async () => {
    if (!user?.accessToken) return;

    try {
      const deviceId = queryClient.getQueryData(['spotifyDeviceId']);
      if (!deviceId) {
        console.error('No active device found');
        return;
      }

      const playerState = queryClient.getQueryData(['playerState']) as PlayerState;
      const endpoint = playerState?.is_playing ? 'pause' : 'play';

      const response = await fetch(`http://localhost:4000/api/spotify/player/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${endpoint}`);
      }

      queryClient.setQueryData(['playerState'], (old: PlayerState = { is_playing: false }) => ({
        ...old,
        is_playing: !old.is_playing
      }));

    } catch (error) {
      console.error(`Error toggling play/pause:`, error);
    }
  };

  const skipToNext = async () => {
    if (!user?.accessToken) return;

    try {
      const deviceId = queryClient.getQueryData(['spotifyDeviceId']);
      if (!deviceId) {
        console.error('No active device found');
        return;
      }

      const response = await fetch('http://localhost:4000/api/spotify/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to skip to next track');
      }

    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const skipToPrevious = async () => {
    if (!user?.accessToken) return;

    try {
      const deviceId = queryClient.getQueryData(['spotifyDeviceId']);
      if (!deviceId) {
        console.error('No active device found');
        return;
      }

      const response = await fetch('http://localhost:4000/api/spotify/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to skip to previous track');
      }

    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  return { 
    handlePlayTrack,
    togglePlayPause,
    skipToNext,
    skipToPrevious
  };
};