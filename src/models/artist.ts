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