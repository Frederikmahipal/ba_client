import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

const Playlists: React.FC = () => {
  const { user } = useAuth();

  const { data: playlists, isLoading, error } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      if (!user?.accessToken) {
        throw new Error('No access token available');
      }

      try {
        const response = await fetch('http://localhost:4000/api/spotify/me/playlists?limit=50', {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch playlists');
        }

        const data = await response.json();
        console.log('Playlists response:', data); // Debug log
        return data.items as Playlist[];
      } catch (err) {
        console.error('Playlist fetch error:', err);
        throw new Error('Failed to load playlists. Please try again later.');
      }
    },
    enabled: !!user?.accessToken,
    staleTime: 5 * 60 * 1000,
  });

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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-center">{error instanceof Error ? error.message : 'Error loading playlists'}</p>
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
        {playlists.map((playlist) => (
          <div 
            key={playlist.id}
            className="flex items-center p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors"
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
              <p className="text-sm opacity-70">{playlist.tracks.total} tracks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;