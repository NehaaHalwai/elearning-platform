import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Slider,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Speed,
} from '@mui/icons-material';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onProgressUpdate,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgressUpdate?.(progress);

      if (video.currentTime >= video.duration) {
        onComplete?.();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onProgressUpdate, onComplete]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const handleTimeChange = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    video.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    resetControlsTimeout();
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
    } else {
      video.volume = 0;
    }
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    resetControlsTimeout();
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: '1000px',
        mx: 'auto',
        position: 'relative',
        '&:hover': {
          '& .controls': {
            opacity: 1,
          },
        },
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', display: 'block' }}
        onClick={handlePlayPause}
      />

      <Box
        className="controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <Typography variant="subtitle1" color="white" gutterBottom>
          {title}
        </Typography>

        <Slider
          value={currentTime}
          max={duration}
          onChange={handleTimeChange}
          sx={{
            color: 'white',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              backgroundColor: '#fff',
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit',
              },
              '&:before': {
                display: 'none',
              },
            },
            '& .MuiSlider-track': {
              height: 4,
            },
            '& .MuiSlider-rail': {
              height: 4,
              opacity: 0.5,
            },
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mt: 1 }}
        >
          <IconButton onClick={handlePlayPause} color="inherit">
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <Typography variant="body2" color="white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <IconButton onClick={handleMute} color="inherit">
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <Slider
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              sx={{
                width: 100,
                color: 'white',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#fff',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                  '&:before': {
                    display: 'none',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.5,
                },
              }}
            />

            <Button
              startIcon={<Speed />}
              color="inherit"
              onClick={(e) => {
                const speeds = [0.5, 1, 1.25, 1.5, 2];
                const currentIndex = speeds.indexOf(playbackSpeed);
                const nextIndex = (currentIndex + 1) % speeds.length;
                handleSpeedChange(speeds[nextIndex]);
              }}
            >
              {playbackSpeed}x
            </Button>

            <IconButton onClick={handleFullscreen} color="inherit">
              <Fullscreen />
            </IconButton>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default VideoPlayer; 