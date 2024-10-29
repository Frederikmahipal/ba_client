import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

interface Track {
  track: {
    id: string;
    uri: string; // for webplayer
    name: string;
    artists: Array<{ 
      id: string;
      name: string 
    }>;
    album: {
      images: Array<{ url: string }>;
    };
    duration_ms: number;
  };
}

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

interface PlaylistDetails {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    items: Track[];
    total: number;
  };
  owner: {
    display_name: string;
  };
}

interface PlaylistsProps {
  onArtistSelect?: (artistId: string) => void;
}

const Playlists: React.FC<PlaylistsProps> = ({ onArtistSelect }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      if (!user?.accessToken) {
        throw new Error('No access token available');
      }

      try {
        const response = await fetch('http://localhost:4000/api/spotify/playlists?limit=50', {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch playlists');
        }

        const data = await response.json();
        return data.items as Playlist[];
      } catch (err) {
        console.error('Playlist fetch error:', err);
        throw new Error('Failed to load playlists. Please try again later.');
      }
    },
    enabled: !!user?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: playlistDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['playlist', selectedPlaylist?.id],
    queryFn: async () => {
      if (!selectedPlaylist?.id || !user?.accessToken) return null;
      
      const response = await fetch(`http://localhost:4000/api/spotify/playlist/${selectedPlaylist.id}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist details');
      }
      
      return response.json() as Promise<PlaylistDetails>;
    },
    enabled: !!selectedPlaylist?.id && !!user?.accessToken,
  });

  const handlePlayTrack = async (trackUri: string) => {
    if (!user?.accessToken) return;
  
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
  
      // Then start playback
      const response = await fetch('http://localhost:4000/api/spotify/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          trackUri
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start playback');
      }
  
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation();
    onArtistSelect?.(artistId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error flex flex-col items-center justify-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-center">{error instanceof Error ? error.message : 'Error loading playlists'}</p>
      </div>
    );
  }

  if (selectedPlaylist) {
    return (
      <div className="p-4">
        <button 
          onClick={() => setSelectedPlaylist(null)} 
          className="mb-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back to Playlists
        </button>
        
        {isLoadingDetails ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : playlistDetails ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              {playlistDetails.images?.[0] && (
                <img 
                  src={playlistDetails.images[0].url} 
                  alt={playlistDetails.name}
                  className="w-32 h-32 object-cover rounded-lg shadow-lg"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{playlistDetails.name}</h2>
                <p className="text-sm opacity-75">
                  Created by {playlistDetails.owner.display_name} • {playlistDetails.tracks.total} tracks
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {playlistDetails.tracks.items.map((item, index) => (
                <div 
                  key={item.track.id || index}
                  className="flex items-center p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                  onClick={() => handlePlayTrack(item.track.uri)}
                >
                  {item.track.album.images?.[0] && (
                    <img 
                      src={item.track.album.images[0].url}
                      alt={item.track.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium">{item.track.name}</div>
                    <div className="text-sm opacity-75">
                      {item.track.artists.map((artist, i) => (
                        <React.Fragment key={artist.id}>
                          {i > 0 && ', '}
                          <button
                            onClick={(e) => handleArtistClick(e, artist.id)}
                            className="hover:text-primary hover:underline"
                          >
                            {artist.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto text-sm opacity-75">
                    {formatDuration(item.track.duration_ms)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Failed to load playlist details</p>
        )}
      </div>
    );
  }

  if (!playlists?.length) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        <p className="text-gray-500">No playlists found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
      <div className="space-y-2">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id}
            className="flex items-center p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <div className="w-10 h-10 mr-3">
              {playlist.images && playlist.images.length > 0 ? (
                <img 
                  src={playlist.images[0].url} 
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-base-300 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{playlist.name}</h3>
              <p className="text-sm opacity-70">{playlist.tracks.total} tracks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default Playlists;