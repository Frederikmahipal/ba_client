import React from 'react';
import { Track } from '../models/track';

interface TrackItemProps {
  track: Track;
  index?: number;
  isPlaying?: boolean;
  timestamp?: string;
  onClick?: () => void;
  onArtistSelect?: (artistId: string) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  isPlaying,
  timestamp,
  onClick,
  onArtistSelect
}) => {
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center space-x-4 p-2 hover:bg-base-300 rounded-lg cursor-pointer transition-colors
        ${isPlaying ? 'bg-primary bg-opacity-10' : ''}`}
      onClick={onClick}
    >
      {index && <div className="text-sm opacity-50 w-6">#{index}</div>}
      <img
        src={track.album.images[0].url}
        alt={track.name}
        className="w-12 h-12 rounded"
      />
      <div className="flex-1 min-w-0"> {/* min-w-0 prevents text overflow */}
        <div className="font-medium truncate">{track.name}</div>
        <div className="text-sm opacity-75 truncate">
          {track.artists.map((artist, i) => (
            <React.Fragment key={artist.id}>
              {i > 0 && ', '}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArtistSelect?.(artist.id);
                }}
                className="hover:text-primary hover:underline"
              >
                {artist.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {timestamp && (
          <div className="text-sm opacity-50 whitespace-nowrap">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        {!timestamp && track.duration_ms && (
          <div className="text-sm opacity-50 whitespace-nowrap">
            {formatDuration(track.duration_ms)}
          </div>
        )}
        {isPlaying && (
          <div className="w-4 h-4">
            <span className="loading loading-bars loading-xs"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackItem;