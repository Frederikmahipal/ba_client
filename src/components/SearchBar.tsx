// components/SearchBar.tsx
import React, { useState } from 'react';
import { useSpotifySearch } from '../hooks/useSpotifySearch';

interface SpotifyItem {
  id: string;
  name: string;
  type: 'artist' | 'album' | 'track';
  artists?: Array<{ name: string }>;
}

interface SearchBarProps {
  onArtistSelect: (artistId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onArtistSelect }) => {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError } = useSpotifySearch(query);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleItemClick = (item: SpotifyItem) => {
    if (item.type === 'artist') {
      onArtistSelect(item.id);
    }
    // Clear the search query after selection
    setQuery('');
  };

  const renderResults = () => {
    if (!data) return null;

    const allItems: SpotifyItem[] = [
      ...(data.artists?.items || []),
      ...(data.albums?.items || []),
      ...(data.tracks?.items || [])
    ];

    return (
      <ul className="menu p-2 bg-base-100 rounded-box shadow-lg">
        {allItems.map((item) => (
          <li key={item.id}>
            <a onClick={() => handleItemClick(item)} className="text-sm">
              {item.name}
              {item.type === 'track' && item.artists && ` - ${item.artists[0].name}`}
              <span className="text-xs ml-2 opacity-60">({item.type})</span>
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search Spotify..."
        className="input input-bordered w-full"
      />
      
      {isLoading && <p className="mt-2">Loading...</p>}
      {isError && <p className="mt-2 text-error">Error occurred while searching</p>}
      {data && query && (
        <div className="absolute z-10 w-full mt-1">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchBar;