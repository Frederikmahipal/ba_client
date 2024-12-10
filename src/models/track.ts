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
  duration_ms: number;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
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
  uri: string;
  position?: number;
  offset?: {
    uri: string;
  };
}