// hooks/useSpotifySearch.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; // Import your api instance

const searchSpotify = async (query: string) => {
  if (!query) return null;
  const response = await api.get(`/api/spotify/search?q=${query}&type=artist,album,track`);
  return response.data;
};

export const useSpotifySearch = (query: string) => {
  return useQuery({
    queryKey: ['spotifySearch', query],
    queryFn: () => searchSpotify(query),
    enabled: query.length > 1, // Only search when query is longer than 1 character
  });
};