import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { usePlayback } from '../utils/playback';
import TrackItem from './TrackItem';

interface Track {
  id: string;
  uri: string;
  name: string;
  artists: Array<{ 
    id: string;
    name: string 
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
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
    items: Array<{ track: Track }>;
    total: number;
    next: string | null;
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
  const { handlePlayTrack } = usePlayback();
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
      
      const initialData = await response.json() as PlaylistDetails;
      let allTracks = [...initialData.tracks.items];
      let nextUrl = initialData.tracks.next;

      while (nextUrl) {
        const moreTracksResponse = await fetch(nextUrl, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });

        if (!moreTracksResponse.ok) {
          throw new Error('Failed to fetch additional tracks');
        }

        const moreTracksData = await moreTracksResponse.json();
        allTracks = [...allTracks, ...moreTracksData.items];
        nextUrl = moreTracksData.next;
      }

      return {
        ...initialData,
        tracks: {
          ...initialData.tracks,
          items: allTracks
        }
      };
    },
    enabled: !!selectedPlaylist?.id && !!user?.accessToken,
  });

  const handleTrackClick = (trackItem: { track: Track }, index: number) => {
    if (!selectedPlaylist) return;
    
    const { track } = trackItem;
    const completeTrack = {
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists,
      album: track.album,
      duration_ms: track.duration_ms
    };

    handlePlayTrack(track.uri, completeTrack, {
      type: 'playlist',
      id: selectedPlaylist.id,
      uri: `spotify:playlist:${selectedPlaylist.id}`,
      position: index
    });
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
        <p className="mb-4">Failed to load playlists</p>
        <button 
          className="btn btn-error"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (playlistDetails) {
    return (
      <div className="p-4">
        <button 
          onClick={() => setSelectedPlaylist(null)}
          className="btn btn-ghost mb-4"
        >
          Back to Playlists
        </button>
        
        {isLoadingDetails ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
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
                <TrackItem
                  key={`${item.track.id}-${index}`}
                  track={item.track}
                  index={index + 1}
                  onClick={() => handleTrackClick(item, index)}
                  onArtistSelect={onArtistSelect}
                  albumImages={item.track.album.images}
                />
              ))}
            </div>
          </>
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
        {playlists?.map((playlist) => {
          if (!playlist) return null;

          return (
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
                <p className="text-sm opacity-70">
                  {playlist.tracks?.total || 0} tracks
                </p>
              </div>
            </div>
          );
        })}
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