import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface Track {
  id: string;
  uri: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
}

interface PlayedTrack {
  track: Track;
  played_at: string;
  isCurrentlyPlaying?: boolean;
}

export const usePlayback = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateRecentlyPlayed = (track: Track) => {
    if (!track || !track.id) {
      console.error('Invalid track data:', track);
      return;
    }

    // Update currently playing
    queryClient.setQueryData(['currentlyPlaying'], track);
    
    // Update recently played list
    queryClient.setQueryData(['recentlyPlayed'], (old: PlayedTrack[] | undefined) => {
      if (!old) {
        // If no existing tracks, create new array with just this track
        return [{
          track,
          played_at: new Date().toISOString(),
          isCurrentlyPlaying: true
        }];
      }
      
      // Create new track entry
      const newTrack: PlayedTrack = {
        track,
        played_at: new Date().toISOString(),
        isCurrentlyPlaying: true
      };

      // Filter out undefined/null tracks and remove duplicates
      const validTracks = old.filter((t): t is PlayedTrack => 
        Boolean(t && t.track && t.track.id)
      );

      // Remove any existing "currently playing" flags
      const updatedTracks = validTracks.map(t => ({
        ...t,
        isCurrentlyPlaying: false
      }));

      // Remove the track if it already exists in the list
      const filteredTracks = updatedTracks.filter(t => t.track.id !== track.id);
      
      // Add the new track at the top
      return [newTrack, ...filteredTracks];
    });
  };

  const handlePlayTrack = async (trackUri: string, track: Track) => {
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

      console.log('Starting playback with device ID:', deviceId);

      // First, ensure our device is active
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

      // Small delay to ensure device is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Then start playback with position set to 0
      const response = await fetch('http://localhost:4000/api/spotify/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          trackUri,
          position_ms: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start playback');
      }

      // Update recently played after successful playback
      updateRecentlyPlayed(track);

    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return { handlePlayTrack };
};