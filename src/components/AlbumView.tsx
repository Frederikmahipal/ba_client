import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayback } from '../utils/playback';
import api from '../services/api';
import { Track } from '../models/track';

interface AlbumViewProps {
  albumId: string;
  onArtistSelect: (artistId: string) => void;
  onClose?: () => void;
}

interface Album {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  release_date: string;
  images: Array<{ url: string }>;
  tracks: {
    items: Track[];
  };
}

const AlbumView: React.FC<AlbumViewProps> = ({ albumId, onArtistSelect, onClose }) => {
  const { handlePlayTrack } = usePlayback();

  const { data: album, isLoading, isError } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      const response = await api.get(`/api/spotify/album/${albumId}`);
      return response.data as Album;
    }
  });

  const handleTrackClick = (track: Track, index: number) => {
    if (!album) return;
    
    handlePlayTrack(track.uri, {
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images
      }
    }, {
      type: 'album',
      id: albumId,
      uri: `spotify:album:${albumId}`,
      position: index
    });
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading album</div>;
  if (!album) return null;

  return (
    <div className="relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}

      {/* Album Header */}
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-primary/10 to-base-300">
        <img 
          src={album.images[0]?.url} 
          alt={album.name} 
          className="w-52 h-52 shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{album.name}</h1>
          <div className="flex items-center gap-2">
            {album.artists.map((artist, index) => (
              <React.Fragment key={artist.id}>
                {index > 0 && ", "}
                <button
                  onClick={() => onArtistSelect(artist.id)}
                  className="hover:text-primary hover:underline"
                >
                  {artist.name}
                </button>
              </React.Fragment>
            ))}
            <span className="mx-2">•</span>
            <span>{new Date(album.release_date).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="p-6">
        <div className="space-y-2">
          {album.tracks.items.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center p-2 hover:bg-base-300 rounded cursor-pointer transition-colors"
              onClick={() => handleTrackClick(track, index)}
            >
              <span className="w-8 text-sm opacity-50">
                {track.track_number}
              </span>
              <div className="flex-1">
                <div className="font-medium">{track.name}</div>
                <div className="text-sm opacity-75">
                  {track.artists.map((artist, i) => (
                    <React.Fragment key={artist.id}>
                      {i > 0 && ', '}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArtistSelect(artist.id);
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
                {formatDuration(track.duration_ms)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumView; 