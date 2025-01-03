import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Artist } from '../models/artist';
import { User } from '../models/user';

interface FeedProps {
  onArtistSelect: (artistId: string) => void;
  onAlbumSelect: (albumId: string) => void;
}

interface FollowedArtist {
  spotifyArtistId: string;
  name: string;
  imageUrl: string;
  followedAt: string;
}

interface ArtistUpdate {
  artistId: string;
  artistName: string;
  artistImage: string;
  updates: {
    newReleases: Array<{
      id: string;
      name: string;
      release_date: string;
      images: Array<{ url: string }>;
    }>;
  };
}

interface FeedData {
  followedUsers: User[];
  followedArtists: FollowedArtist[];
}

const Feed: React.FC<FeedProps> = ({ onArtistSelect, onAlbumSelect }) => {
  const { data: feed, isLoading: feedLoading } = useQuery<FeedData>({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await api.get('/api/users/feed');
      return response.data;
    }
  });

  const { data: recommendedArtists, isLoading: recommendationsLoading } = useQuery<Artist[]>({
    queryKey: ['recommendedArtists'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/recommendations/artists');
      return response.data;
    },
    enabled: Boolean(feed?.followedArtists?.length)
  });

  const { data: artistUpdates } = useQuery<ArtistUpdate[]>({
    queryKey: ['artistUpdates'],
    queryFn: async () => {
      const response = await api.get('/api/spotify/artist-updates');
      return response.data;
    },
    enabled: Boolean(feed?.followedArtists?.length)
  });

  if (feedLoading || recommendationsLoading) {
    return <div>Loading...</div>;
  }

  const followedArtists = feed?.followedArtists ?? [];

  return (
    <div className="p-4">
      

      {artistUpdates && artistUpdates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl mb-4">New Releases from Your Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artistUpdates.map((update) => (
              <div key={update.artistId} className="bg-base-200 rounded-lg p-4">
                <div 
                  className="flex items-center gap-4 mb-4 cursor-pointer"
                  onClick={() => onArtistSelect(update.artistId)}
                >
                  <img 
                    src={update.artistImage} 
                    alt={update.artistName}
                    className="w-16 h-16 rounded-full" 
                  />
                  <h3 className="text-lg font-medium">{update.artistName}</h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">New Releases</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {update.updates.newReleases.map((release) => (
                      <div 
                        key={release.id}
                        className="cursor-pointer group"
                        onClick={() => onAlbumSelect(release.id)}
                      >
                        <img 
                          src={release.images[0]?.url} 
                          alt={release.name}
                          className="w-full aspect-square object-cover rounded-lg group-hover:opacity-80" 
                        />
                        <p className="text-sm mt-1 truncate">{release.name}</p>
                        <p className="text-xs opacity-70">
                          {new Date(release.release_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl mb-4">Artists You Follow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedArtists.map((artist) => (
            <div 
              key={artist.spotifyArtistId}
              className="bg-base-200 p-4 rounded-lg hover:bg-base-300 cursor-pointer"
              onClick={() => onArtistSelect(artist.spotifyArtistId)}
            >
              <img 
                src={artist.imageUrl}
                alt={artist.name} 
                className="w-16 h-16 rounded-full"
              />
              <h3 className="font-medium mt-2">{artist.name}</h3>
              <p className="text-sm opacity-70">
                Following since {new Date(artist.followedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {recommendedArtists && recommendedArtists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl mb-4">Recommended Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedArtists.map((artist) => (
              <div 
                key={artist.id}
                className="bg-base-200 p-4 rounded-lg hover:bg-base-300 cursor-pointer group"
                onClick={() => onArtistSelect(artist.id)}
              >
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={artist.images[0]?.url}
                    alt={artist.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-medium text-lg">{artist.name}</h3>
                <p className="text-sm opacity-70">
                  {artist.followers.total.toLocaleString()} followers
                </p>
                {artist.genres?.slice(0, 2).map((genre) => (
                  <span 
                    key={genre}
                    className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-2 mt-2"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
  );
};

export default Feed; 