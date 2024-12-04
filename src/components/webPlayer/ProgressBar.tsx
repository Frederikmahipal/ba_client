import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
  isPaused?: boolean;  // Add this prop to know when playback is paused
}

const ProgressBar: React.FC<ProgressBarProps> = ({ position, duration, onSeek, isPaused }) => {
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setCurrentPosition(position); // Reset current position when prop changes
  }, [position]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!isPaused && duration > 0) {
      intervalId = setInterval(() => {
        setCurrentPosition(prev => {
          if (prev >= duration) {
            clearInterval(intervalId);
            return duration;
          }
          return prev + 1000; // Increment by 1 second (1000ms)
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPaused, duration, position]);

  const handleChange = (value: number) => {
    setCurrentPosition(value);
    onSeek(value);
  };

  return (
    <div className="w-1/3 flex items-center space-x-2">
      <span className="text-xs">{formatTime(currentPosition)}</span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentPosition}
        className="range range-xs range-primary flex-grow"
        onChange={(e) => handleChange(parseInt(e.target.value))}
      />
      <span className="text-xs">{formatTime(duration)}</span>
    </div>
  );
};

const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default ProgressBar;