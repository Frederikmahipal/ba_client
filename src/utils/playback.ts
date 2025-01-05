import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Track, PlaybackContext } from '../models/track';
import api from '../services/api';

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

  const handlePlayTrack = async (trackUri: string, track: Track, context?: PlaybackContext) => {
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

      await api.put('/api/spotify/player/activate-device', 
        { deviceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      let playbackBody;
      if (context && context.type !== 'artist') {
        playbackBody = {
          context_uri: context.uri,
          offset: context.offset ? { uri: context.offset.uri } : { position: context.position },
          position_ms: 0
        };

        queryClient.setQueryData(['currentlyPlaying'], (old: any) => ({
          ...old,
          context: {
            ...context,
            position: context.position
          }
        }));
      } else {
        playbackBody = {
          uris: [trackUri],
          position_ms: 0
        };
      }

      await api.put('/api/spotify/player/play', 
        { ...playbackBody, deviceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

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

      queryClient.setQueryData(['queue'], null);
      await new Promise(resolve => setTimeout(resolve, 300));

      await queryClient.fetchQuery({ 
        queryKey: ['queue'],
        queryFn: async () => {
          const { data } = await api.get('/api/spotify/player/queue', {
            headers: { Authorization: `Bearer ${user.accessToken}` }
          });
          return data;
        },
        staleTime: 0
      });

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

      await api.put(`/api/spotify/player/${endpoint}`, 
        { deviceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

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
      if (!deviceId) return;

      await api.post('/api/spotify/player/next', 
        { deviceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const skipToPrevious = async () => {
    if (!user?.accessToken) return;

    try {
      const deviceId = queryClient.getQueryData(['spotifyDeviceId']);
      if (!deviceId) return;

      await api.post('/api/spotify/player/previous', 
        { deviceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
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