import { Track } from './track';

export interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

export interface PlaylistDetails {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    items: Array<{ track: Track }>;
    total: number;
    next: string | null;
  };
  owner: {
    display_name: string;
  };
} 