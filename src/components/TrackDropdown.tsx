import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Track } from '../models/track';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface TrackDropdownProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onArtistSelect?: (artistId: string) => void;
}

const TrackDropdown: React.FC<TrackDropdownProps> = ({
  track,
  isOpen,
  onClose,
  onArtistSelect,
}) => {
  const { user } = useAuth();
  const [showPlaylists, setShowPlaylists] = useState(false);

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/playlists', {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      return response.data.items;
    },
    enabled: isOpen && !!user?.accessToken
  });

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await api.post(`/api/spotify/playlists/${playlistId}/tracks`, {
        tracks: [track.uri]
      }, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 mt-2 w-48 bg-base-200 rounded-lg shadow-xl z-[100]"
      onClick={(e) => e.stopPropagation()}
    >
      {!showPlaylists ? (
        <ul className="py-2">
          <li>
            <button
              className="px-4 py-2 hover:bg-base-300 w-full text-left"
              onClick={() => onArtistSelect?.(track.artists[0].id)}
            >
              Go to Artist
            </button>
          </li>
          <li>
            <button
              className="px-4 py-2 hover:bg-base-300 w-full text-left"
              onClick={() => setShowPlaylists(true)}
            >
              Add to Playlist
            </button>
          </li>
        </ul>
      ) : (
        <div>
          <div className="px-4 py-2 border-b border-base-300 flex items-center gap-2">
            <button 
              className="hover:bg-base-300 p-1 rounded"
              onClick={() => setShowPlaylists(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span>Select Playlist</span>
          </div>
          <ul className="py-2 max-h-[60vh] overflow-y-auto">
            {playlists?.map(playlist => (
              <li key={playlist.id}>
                <button
                  className="px-4 py-2 hover:bg-base-300 w-full text-left flex items-center gap-2"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  {playlist.images?.[0] && (
                    <img 
                      src={playlist.images[0].url} 
                      alt="" 
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="truncate">{playlist.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrackDropdown; 