import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
  isPaused?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ position, duration, onSeek, isPaused }) => {
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setCurrentPosition(position);
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
          return prev + 1000;
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
    <div className="flex items-center space-x-2 w-full px-2 lg:px-4">
      <span className="text-xs text-white min-w-[40px] text-right">
        {formatTime(currentPosition)}
      </span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentPosition}
        className="flex-grow h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        onChange={(e) => handleChange(parseInt(e.target.value))}
      />
      <span className="text-xs text-white min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
};

const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default ProgressBar;