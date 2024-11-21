import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PlaylistsView from './PlaylistView'; // Import the new component

interface Category {
  id: string;
  name: string;
  icons: Array<{ url: string }>;
}

export interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
}

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('http://localhost:4000/api/spotify/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

const fetchCategoryPlaylists = async (categoryId: string): Promise<Playlist[]> => {
  const response = await fetch(`http://localhost:4000/api/spotify/categories/${categoryId}/playlists`);
  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }
  return response.json();
};

const Browse: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categories, error, isLoading } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: playlists, error: playlistsError, isLoading: playlistsLoading } = useQuery<Playlist[], Error>({
    queryKey: ['categoryPlaylists', selectedCategory],
    queryFn: () => fetchCategoryPlaylists(selectedCategory!),
    enabled: !!selectedCategory,
  });

  const handlePlaylistClick = (playlistId: string) => {
    console.log(`Playlist clicked: ${playlistId}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-error">Error: {error.message}</div>;
  }

  const uniqueCategories = Array.from(new Map(categories?.map(category => [category.id, category])).values());

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Browse Categories</h2>

      {selectedCategory ? (
        <PlaylistsView
          playlists={playlists}
          loading={playlistsLoading}
          error={playlistsError}
          onPlaylistClick={handlePlaylistClick}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uniqueCategories.map((category) => (
            <div
              key={category.id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <figure>
                <img src={category.icons[0]?.url} alt={category.name} className="w-full h-40 object-cover" />
              </figure>
              <div className="card-body">
                <h4 className="card-title">{category.name}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;