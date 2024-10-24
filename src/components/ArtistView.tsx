import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface ArtistViewProps {
  artistId: string;
}

interface Artist {
  name: string;
  images: { url: string }[];
  genres: string[];
  followers: { total: number };
  popularity: number;
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
}

const fetchArtistDetails = async (artistId: string) => {
  const [artistResponse, albumsResponse] = await Promise.all([
    api.get(`/api/spotify/artist/${artistId}`),
    api.get(`/api/spotify/artist/${artistId}/albums`)
  ]);
  return {
    artist: artistResponse.data,
    albums: albumsResponse.data
  };
};

const ArtistView: React.FC<ArtistViewProps> = ({ artistId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistDetails', artistId],
    queryFn: () => fetchArtistDetails(artistId),
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  if (isError) {
    return <div className="text-center text-error">Error loading artist details</div>;
  }

  const { artist, albums } = data!;

  return (
    <div className="p-4 overflow-y-auto max-h-full">
      <div className="flex flex-col md:flex-row items-center mb-8">
        <img
          src={artist.images[0]?.url}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover mr-0 md:mr-8 mb-4 md:mb-0"
        />
        <div>
          <h2 className="text-3xl font-bold">{artist.name}</h2>
          {artist.genres.length > 0 && (
            <p className="text-lg mt-2">Genres: {artist.genres.join(', ')}</p>
          )}
          <p className="text-lg mt-2">Followers: {artist.followers.total.toLocaleString()}</p>
          <p className="text-lg mt-2">Popularity: {artist.popularity}</p>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4">Albums & Singles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map((album: Album) => (
            <div key={album.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <img src={album.images[0]?.url} alt={album.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <p className="font-bold text-sm mb-1 truncate">{album.name}</p>
                <p className="text-xs text-gray-400">{new Date(album.release_date).getFullYear()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistView;