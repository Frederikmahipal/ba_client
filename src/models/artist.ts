export interface Artist {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height?: number;
      width?: number;
    }>;
    followers: {
      total: number;
      href: string | null;
    };
    genres?: string[];
    href: string;
    uri: string;
    type: 'artist';
  }

export interface FollowedArtist {
    spotifyArtistId: string;
    name: string;
    imageUrl: string;
    followedAt: string;
  }
  
 export interface ArtistUpdate {
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