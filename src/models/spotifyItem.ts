export interface SpotifyItem {
    id: string;
    name: string;
    type: 'artist' | 'album' | 'track';
    artists?: Array<{ id: string; name: string }>;
    images?: Array<{ url: string }>;
    album?: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
    };
    track_number?: number;
  }

  export interface SpotifySearchResponse {
    artists?: { items: any[] };
    albums?: { items: any[] };
    tracks?: { items: any[] };
  }

  