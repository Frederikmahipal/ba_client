import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; 

interface SpotifySearchResponse {
  artists?: { items: any[] };
  albums?: { items: any[] };
  tracks?: { items: any[] };
}

const searchSpotify = async (query: string): Promise<SpotifySearchResponse | null> => {
  if (!query) return null;
  const response = await api.get(`/api/spotify/search?q=${query}&type=artist,album,track`);
  return response.data;
};

export const useSpotifySearch = (query: string) => {
  return useQuery({
    queryKey: ['spotifySearch', query],
    queryFn: () => searchSpotify(query),
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};