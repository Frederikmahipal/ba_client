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

interface FeedData {
  followedUsers: User[];
  followedArtists: FollowedArtist[];
}

const Feed: React.FC<FeedProps> = ({ onArtistSelect }) => {
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

  if (feedLoading || recommendationsLoading) {
    return <div>Loading...</div>;
  }

  const followedArtists = feed?.followedArtists ?? [];
  const followedUsers = feed?.followedUsers ?? [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

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

      <div>
        <h2 className="text-xl mb-4">People You Follow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedUsers.map(user => (
            <div 
              key={user.spotifyId} 
              className="bg-base-200 p-4 rounded-lg hover:bg-base-300 cursor-pointer"
              onClick={() => user.spotifyId && onArtistSelect(user.spotifyId)}
            >
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="w-16 h-16 rounded-full"
              />
              <h3 className="font-medium mt-2">{user.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed; 