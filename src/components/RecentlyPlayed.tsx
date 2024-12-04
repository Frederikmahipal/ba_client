import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayback } from '../utils/playback';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Track {
  id: string;
  name: string;
  uri: string;
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

const RecentlyPlayed: React.FC<{ onArtistSelect?: (artistId: string) => void }> = ({ onArtistSelect }) => {
  const { user } = useAuth();
  const { handlePlayTrack } = usePlayback();

  // Query for recently played tracks
  const { data: recentTracks, isLoading } = useQuery({
    queryKey: ['recentlyPlayed'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/recently-played', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      
      const tracks = response.data.items as PlayedTrack[];
      
      // Keep only the first occurrence of each track
      const uniqueTracks = tracks.reduce((acc: PlayedTrack[], current) => {
        const exists = acc.some(item => item.track.id === current.track.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueTracks;
    },
    enabled: !!user?.accessToken,
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
      <div className="space-y-2">
        {recentTracks?.map((item: PlayedTrack) => (
          <div
            key={item.track.id}
            className={`flex items-center space-x-4 p-2 hover:bg-base-300 rounded-lg cursor-pointer
              ${item.isCurrentlyPlaying ? 'bg-primary bg-opacity-20' : ''}`}
            onClick={() => handlePlayTrack(item.track.uri, item.track)}
          >
            <img
              src={item.track.album.images[0]?.url}
              alt={item.track.album.name}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {item.track.name}
                {item.isCurrentlyPlaying && (
                  <span className="text-primary text-sm">
                    Playing now
                  </span>
                )}
              </div>
              <div className="text-sm opacity-75">
                {item.track.artists.map((artist, i) => (
                  <React.Fragment key={artist.id}>
                    {i > 0 && ', '}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArtistSelect?.(artist.id);
                      }}
                      className="hover:text-primary hover:underline"
                    >
                      {artist.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="text-sm opacity-50">
              {item.isCurrentlyPlaying 
                ? 'Now playing'
                : new Date(item.played_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayed;