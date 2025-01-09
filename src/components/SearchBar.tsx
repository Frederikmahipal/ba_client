import React, { useState } from 'react';
import { useSpotifySearch } from '../hooks/useSpotifySearch';
import { SpotifyItem } from '../models/spotifyItem';


interface SearchBarProps {
  onArtistSelect: (artistId: string) => void;
  onAlbumSelect: (albumId: string) => void;
}

type FilterType = 'all' | 'artist' | 'album' | 'track';

const SearchBar: React.FC<SearchBarProps> = ({ 
  onArtistSelect, 
  onAlbumSelect 
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data, isLoading, isError } = useSpotifySearch(query);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleItemClick = (item: SpotifyItem) => {
    if (item.type === 'artist') {
      onArtistSelect(item.id);
    } else if (item.type === 'album') {
      onAlbumSelect(item.id);
    } else if (item.type === 'track' && item.album?.id) {
      onAlbumSelect(item.album.id);
    }
    setQuery('');
  };

  const filterItems = (items: SpotifyItem[]) => {
    if (activeFilter === 'all') return items;
    return items.filter(item => item.type === activeFilter);
  };

  const renderResults = () => {
    if (!data) return null;

    const allItems: SpotifyItem[] = [
      ...(data.artists?.items || []),
      ...(data.albums?.items || []),
      ...(data.tracks?.items || [])
    ];

    const filteredItems = filterItems(allItems);

    return (
      <div className="menu p-2 bg-base-200 rounded-box shadow-lg max-h-96 overflow-y-auto overflow-x-hidden">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="flex items-center p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors w-full"
          >
            <div className="w-10 h-10 flex-shrink-0 mr-3">
              {(item.type === 'track' ? item.album?.images?.[0]?.url : item.images?.[0]?.url) ? (
                <img
                  src={item.type === 'track' ? item.album?.images[0].url : item.images![0].url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-base-300 rounded flex items-center justify-center">
                  <i className="fas fa-music text-base-content/50"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.name}</div>
              <div className="text-xs opacity-60 truncate">
                {item.type === 'track' && item.artists && (
                  <>
                    {item.artists[0].name}
                    <span className="mx-1">•</span>
                    {item.album?.name}
                  </>
                )}
                {item.type !== 'track' && (
                  <span className="capitalize">{item.type}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search Spotify..."
        className="input input-bordered w-full bg-base-200"
      />
      
      {/* Only show dropdown content when there's a query */}
      {query && (
        <div className="absolute z-[100] w-full mt-1">
          {/* Filters */}
          <div className="bg-base-200 rounded-t-box p-2 border-b border-base-300">
            <div className="flex gap-2 justify-center">
              {(['all', 'artist', 'album', 'track'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`btn btn-xs ${
                    activeFilter === filter ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-base-200 p-4 rounded-b-box shadow-lg text-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          
          {/* Error State */}
          {isError && (
            <div className="bg-base-200 p-4 rounded-b-box shadow-lg text-error text-center">
              Error occurred while searching
            </div>
          )}
          
          {/* Results */}
          {data && renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchBar;