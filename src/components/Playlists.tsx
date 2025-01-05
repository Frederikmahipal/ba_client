import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedTracks, setLoadedTracks] = useState<Array<{ track: Track }>>([]);
  const [nextTracksUrl, setNextTracksUrl] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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
      
      const data = await response.json() as PlaylistDetails;
      setLoadedTracks(data.tracks.items);
      setNextTracksUrl(data.tracks.next);
      return data;
    },
    enabled: !!selectedPlaylist?.id && !!user?.accessToken,
    staleTime: 0,
    refetchOnWindowFocus: false,
    gcTime: 0
  });

  const loadMoreTracks = async () => {
    if (!nextTracksUrl || !user?.accessToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(nextTracksUrl, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch additional tracks');
      }

      const data = await response.json();
      setLoadedTracks(prev => [...prev, ...data.items]);
      setNextTracksUrl(data.next);
    } catch (error) {
      console.error('Error loading more tracks:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Add intersection observer for infinite scroll
  const trackListRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextTracksUrl) {
          loadMoreTracks();
        }
      },
      { threshold: 0.5 }
    );

    const currentTrackList = trackListRef.current;
    if (currentTrackList) {
      observer.observe(currentTrackList);
    }

    return () => {
      if (currentTrackList) {
        observer.unobserve(currentTrackList);
      }
    };
  }, [nextTracksUrl]);

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

  // Reset tracks when changing playlists
  useEffect(() => {
    if (selectedPlaylist?.id) {
      setLoadedTracks([]);
      setNextTracksUrl(null);
    }
  }, [selectedPlaylist?.id]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !user?.accessToken) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:4000/api/spotify/playlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
          'credentials': 'include'
        },
        credentials: 'include',
        body: JSON.stringify({ name: newPlaylistName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create playlist');
      }

      // Force refetch playlists
      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
      await queryClient.refetchQueries({ queryKey: ['playlists'] });
      
      setIsCreateModalOpen(false);
      setNewPlaylistName('');
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const createPlaylistModal = (
    <dialog 
      className={`modal ${isCreateModalOpen ? 'modal-open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCreateModalOpen(false);
        }
      }}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Playlist</h3>
        <input
          type="text"
          placeholder="Playlist name"
          className="input input-bordered w-full mb-4"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreatePlaylist();
            }
          }}
        />
        <div className="modal-action">
          <button 
            className="btn btn-ghost"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className={`btn btn-primary ${isCreating ? 'loading' : ''}`}
            onClick={handleCreatePlaylist}
            disabled={!newPlaylistName.trim() || isCreating}
          >
            Create
          </button>
        </div>
      </div>
    </dialog>
  );

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
              {loadedTracks.map((item, index) => (
                <TrackItem
                  key={`${item.track.id}-${index}`}
                  track={item.track}
                  index={index + 1}
                  onClick={() => handleTrackClick(item, index)}
                  onArtistSelect={onArtistSelect}
                  albumImages={item.track.album.images}
                />
              ))}
              
              {/* Loading indicator at bottom */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              )}
              
              {/* Intersection observer target */}
              <div ref={trackListRef} className="h-4" />
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Playlists</h2>
        <button
          className="btn btn-circle btn-ghost"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      {createPlaylistModal}
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


export default Playlists;