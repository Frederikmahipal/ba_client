// src/components/PlaylistsView.tsx
import React from 'react';
import { Playlist } from './Browse'; // Adjust the import based on your file structure

interface PlaylistsViewProps {
  playlists: Playlist[] | undefined;
  loading: boolean;
  error: Error | null;
  onPlaylistClick: (playlistId: string) => void;
}

const PlaylistsView: React.FC<PlaylistsViewProps> = ({ playlists, loading, error, onPlaylistClick }) => {
  if (loading) {
    return <div>Loading playlists...</div>;
  }

  if (error) {
    return <div className="text-error">Error: {error.message}</div>;
  }

  // Filter out duplicate playlists based on ID
  const uniquePlaylists = playlists ? Array.from(new Map(playlists.map(playlist => [playlist.id, playlist])).values()) : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {uniquePlaylists.map((playlist) => (
        <div
          key={playlist.id} // Ensure unique key
          className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onPlaylistClick(playlist.id)}
        >
          <figure>
            <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full h-40 object-cover" />
          </figure>
          <div className="card-body">
            <h4 className="card-title">{playlist.name}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistsView;