import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Track, PlaybackContext } from '../models/track';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useDropdownStore } from '../store/dropdownStore';
import { usePlayback } from '../utils/playback';
import TrackDropdown from './TrackDropdown';

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface TrackItemProps {
  track: Track;
  index?: number;
  isPlaying?: boolean;
  timestamp?: string;
  onClick?: () => void;
  onArtistSelect?: (artistId: string) => void;
  onAlbumSelect?: (albumId: string) => void;
  albumImages?: { url: string }[];
  showOptions?: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  isPlaying,
  timestamp,
  onClick,
  onArtistSelect,
  onAlbumSelect,
  albumImages,
  showOptions = true
}) => {
  const { user } = useAuth();
  const { handlePlayTrack } = usePlayback();
  const { activeDropdownId, setActiveDropdownId } = useDropdownStore();
  const queryClient = useQueryClient();

  const isDropdownOpen = activeDropdownId === track.id;

  // Fetch playlists only when needed
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
    enabled: isDropdownOpen && !!user?.accessToken
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
      setActiveDropdownId(null);
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const imageUrl = albumImages?.[0]?.url || track.album?.images?.[0]?.url;

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick();
      return;
    }

    // Get the current context for the track
    let context: PlaybackContext;

    if (track.album?.id) {
      // If track has album info, use album context
      context = {
        type: 'album',
        uri: `spotify:album:${track.album.id}`,
        id: track.album.id,
        position: index ? index - 1 : 0,
        offset: { uri: track.uri }
      };
    } else if (albumImages && track.album_id) {
      // If we have albumImages prop and album_id (in expanded album view)
      context = {
        type: 'album',
        uri: `spotify:album:${track.album_id}`,
        id: track.album_id,
        position: index ? index - 1 : 0,
        offset: { uri: track.uri }
      };
    } else {
      // Fallback to just playing the track without context
      context = {
        type: 'artist',
        uri: `spotify:artist:${track.artists[0].id}`,
        id: track.artists[0].id,
        position: 0
      };
    }

    handlePlayTrack(track.uri, track, context);
  };

  return (
    <div
      className={`group flex items-center space-x-4 p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors
        ${isPlaying ? 'bg-primary bg-opacity-10' : ''}`}
      onClick={(e) => {
        handlePlay(e);
      }}
    >
      <div className="w-8 text-center">
        {index && (
          <span className="text-sm opacity-50 group-hover:hidden">
            #{index}
          </span>
        )}
        <button 
          className="hidden group-hover:block"
          onClick={(e) => {
            e.stopPropagation();
            handlePlay(e);
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </button>
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={track.name}
          className="w-12 h-12 rounded"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{track.name}</div>
        <div className="text-sm opacity-75 truncate">
          {track.artists.map((artist, i) => (
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

      <div className="flex items-center space-x-4">
        {timestamp && (
          <div className="text-sm opacity-50 whitespace-nowrap">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        {!timestamp && track.duration_ms && (
          <div className="text-sm opacity-50 whitespace-nowrap">
            {formatDuration(track.duration_ms)}
          </div>
        )}
        {isPlaying && (
          <div className="w-4 h-4">
            <span className="loading loading-bars loading-xs"></span>
          </div>
        )}

        {showOptions && (
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdownId(activeDropdownId === track.id ? null : track.id);
              }}
              className="btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            <TrackDropdown
              track={track}
              isOpen={activeDropdownId === track.id}
              onClose={() => setActiveDropdownId(null)}
              onArtistSelect={onArtistSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackItem;