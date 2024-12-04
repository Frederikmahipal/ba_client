import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { usePlayback } from '../utils/playback';

interface ArtistViewProps {
  artistId: string;
  onArtistSelect?: (artistId: string) => void;
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
}

interface Track {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  track_number: number;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
}

interface AlbumDetails extends Album {
  tracks: {
    items: Track[];
  };
}

const fetchArtistDetails = async (artistId: string) => {
  const [artistResponse, albumsResponse, topTracksResponse] = await Promise.all([
    api.get(`/api/spotify/artist/${artistId}`),
    api.get(`/api/spotify/artist/${artistId}/albums`),
    api.get(`/api/spotify/artist/${artistId}/top-tracks`),
  ]);

  return {
    artist: artistResponse.data,
    albums: albumsResponse.data,
    topTracks: topTracksResponse.data || [],
  };
};

const ArtistView: React.FC<ArtistViewProps> = ({ artistId, onArtistSelect }) => {
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const { handlePlayTrack } = usePlayback();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistDetails', artistId],
    queryFn: () => fetchArtistDetails(artistId),
  });

  const { data: albumDetails, isLoading: isLoadingAlbumDetails } = useQuery({
    queryKey: ['albumDetails', expandedAlbumId],
    queryFn: async () => {
      if (!expandedAlbumId) return null;
      const response = await api.get(`/api/spotify/album/${expandedAlbumId}`);
      return response.data as AlbumDetails;
    },
    enabled: !!expandedAlbumId,
  });

  const handleAlbumClick = (albumId: string) => {
    setExpandedAlbumId(expandedAlbumId === albumId ? null : albumId);
  };

  const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation();
    onArtistSelect?.(artistId);
  };

  const handleTrackClick = (track: Track) => {
    handlePlayTrack(track.uri, {
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists,
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images
      }
    });
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading artist details</div>;
  }

  const { artist, albums, topTracks } = data!;

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{artist.name}</h1>
        
        {/* Top Tracks Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Popular Tracks</h2>
          <div className="space-y-2">
            {topTracks.map((track: Track) => (
              <div
                key={track.id}
                className="flex items-center p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                <div className="flex-1">
                  <div className="font-medium">{track.name}</div>
                  <div className="text-sm opacity-75">
                    {track.artists.map((artist, i) => (
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
                <div className="text-sm opacity-50">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Albums Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Albums</h2>
          <div className="space-y-4">
            {albums.length > 0 ? (
              albums.map((album: Album) => (
                <div 
                  key={album.id} 
                  className="bg-base-200 rounded-lg overflow-hidden shadow-lg"
                >
                  <div 
                    className="cursor-pointer hover:bg-base-300 transition-colors"
                    onClick={() => handleAlbumClick(album.id)}
                  >
                    <div className="flex items-center p-4">
                      <img 
                        src={album.images[0]?.url} 
                        alt={album.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-lg">{album.name}</p>
                        <p className="text-sm opacity-75">
                          {new Date(album.release_date).getFullYear()}
                        </p>
                      </div>
                      <svg 
                        className={`w-6 h-6 transform transition-transform ${
                          expandedAlbumId === album.id ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </div>
                  </div>

                  {expandedAlbumId === album.id && (
                    <div className="border-t border-base-300">
                      {isLoadingAlbumDetails ? (
                        <div className="p-4 text-center">
                          <span className="loading loading-spinner loading-md"></span>
                        </div>
                      ) : albumDetails ? (
                        <div className="p-4 space-y-2">
                          {albumDetails.tracks.items.map((track) => (
                            <div
                              key={track.id}
                              className="flex items-center p-2 hover:bg-base-300 rounded cursor-pointer"
                              onClick={() => handleTrackClick(track)}
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
                                        onClick={(e) => handleArtistClick(e, artist.id)}
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
                      ) : (
                        <div className="p-4 text-center text-error">
                          Failed to load album tracks
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No albums available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistView;