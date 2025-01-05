import { Track } from './track';

export interface Album {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    release_date: string;
    images: Array<{ url: string }>;
    tracks: {
      items: Track[];
    };
  }