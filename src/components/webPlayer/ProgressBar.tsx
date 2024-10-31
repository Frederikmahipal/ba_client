import React from 'react';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ position, duration, onSeek }) => (
  <div className="w-1/3 flex items-center space-x-2">
    <span className="text-xs">{formatTime(position)}</span>
    <input
      type="range"
      min={0}
      max={duration}
      value={position}
      className="range range-xs range-primary flex-grow"
      onChange={(e) => onSeek(parseInt(e.target.value))}
    />
    <span className="text-xs">{formatTime(duration)}</span>
  </div>
);

const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default ProgressBar;