export interface CurrentlyPlaying {
  item: Track;
  is_playing: boolean;
  progress_ms: number;
  context?: {
    type: 'playlist' | 'album' | 'artist' | 'queue';
    uri: string;
    id: string;
    name?: string;
  };
}

export interface Track {
  id: string;
  uri: string;
  name: string;
  track_number?: number;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album?: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  album_id?: string;
  duration_ms: number;
}

export interface PlayedTrack {
  track: Track;
  played_at: string;
  isCurrentlyPlaying?: boolean;
  context?: {
    type: 'playlist' | 'album' | 'artist' | 'queue';
    uri: string;
    id: string;
  };
}

export interface PlaybackContext {
  type: 'album' | 'playlist' | 'artist' | 'queue';
  id: string;
  uri?: string | null;
  position?: number;
  offset?: {
    uri: string;
  };
  name?: string;
  uris?: string[];
}