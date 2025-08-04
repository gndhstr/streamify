"use client";
import React, { useRef, useEffect, useState } from 'react';
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaRandom
} from 'react-icons/fa';

const Player = ({
  songs,
  currentSongIndex,
  isPlaying,
  isRandom,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onRandomToggle,
  onTimeChange,
  onVolumeChange,
  onClosePlayer,
  onSongEnd,
  onDurationChange,
}) => {
  const currentSong = songs[currentSongIndex];
  const audioRef = useRef(null);
  const lyricsRef = useRef(null);
  const [lyrics, setLyrics] = useState([]);

  // Theme color mapping
  const themeColors = {
    'pink-800': {
      card: 'bg-pink-800/10',
      lyrics: 'bg-pink-800/20',
      playBtn: 'bg-pink-900/50',
      progress: 'bg-pink-800',
    },
    'indigo-700': {
      card: 'bg-indigo-700/10',
      lyrics: 'bg-indigo-700/20',
      playBtn: 'bg-indigo-900/50',
      progress: 'bg-indigo-700',
    },
    'emerald-600': {
      card: 'bg-emerald-600/10',
      lyrics: 'bg-emerald-600/20',
      playBtn: 'bg-emerald-800/50',
      progress: 'bg-emerald-600',
    },
    'blue-700': {
      card: 'bg-blue-700/10',
      lyrics: 'bg-blue-700/20',
      playBtn: 'bg-blue-900/50',
      progress: 'bg-blue-700',
    },
    'black': {
        card: 'bg-black/10',
        lyrics: 'bg-black/20',
        playBtn: 'bg-black/50',
        progress: 'bg-black',
    }
  };

  const theme = themeColors[currentSong.themeColor] || themeColors['pink-800'];

  useEffect(() => {
    const loadLyrics = async () => {
      try {
        const res = await fetch(currentSong.lrcFile);
        const text = await res.text();
        const parsedLyrics = parseLRC(text);
        setLyrics(parsedLyrics);
      } catch (err) {
        console.error("Gagal mengambil lirik:", err);
        setLyrics([{ time: 0, text: "♪ No lyrics available ♪" }]);
      }
    };

    if (currentSong.lrcFile) {
      loadLyrics();
    } else {
      setLyrics([{ time: 0, text: "♪ No lyrics available ♪" }]);
    }
  }, [currentSong]);

  const currentLyricIndex = lyrics.findLastIndex(line => line.time <= currentTime);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;

    const handlePlay = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error("Playback error:", error);
        onPlayPause(false);
      }
    };

    handlePlay();

    if (Number.isFinite(currentTime)) {
      if (Math.abs(audio.currentTime - currentTime) > 1) {
        audio.currentTime = currentTime;
      }
    }
  }, [isPlaying, currentSongIndex, volume, currentTime, onPlayPause]);

  useEffect(() => {
    if (lyricsRef.current && currentLyricIndex >= 0) {
      const lyricElements = lyricsRef.current.children;
      if (lyricElements[currentLyricIndex]) {
        lyricElements[currentLyricIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex]);

  const CustomSlider = ({ value, max, onChange, className }) => {
    const progressPercentage = (value / max) * 100;
    return (
      <div className={`relative w-full h-1 bg-gray-600/50 rounded-full group cursor-pointer ${className}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
          onChange({ target: { value: percentage * max } });
        }}>
        <div
          className={`absolute top-0 left-0 h-full ${theme.progress} rounded-full transition-all duration-100`}
          style={{ width: `${progressPercentage}%` }}
        />
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={onChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className={`backdrop-blur-lg shadow-2xl rounded-xl border-0 overflow-hidden ${theme.card}`}>
          {/* Header Info */}
          <div className='p-5 flex gap-3'>
            <div>
              <img
                className='rounded-md w-15 h-15 object-cover'
                src={currentSong.cover}
                alt="album cover"
              />
            </div>
            <div className='flex flex-col justify-center flex-1'>
              <h3 className='text-base font-bold text-white'>{currentSong.title}</h3>
              <p className='text-xs text-gray-300'>{currentSong.artist}</p>
            </div>
            <button
              onClick={onRandomToggle}
              className={`p-2 rounded-full ${isRandom ? 'text-pink-500' : 'text-gray-400'}`}
            >
              <FaRandom />
            </button>
          </div>

          {/* Lyrics */}
          <div className={`mx-5 ${theme.lyrics} rounded-lg p-4 h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-700 scrollbar-track-transparent`}>
            <div ref={lyricsRef} className='space-y-3'>
              {lyrics.map((line, index) => (
                <p
                  key={index}
                  className={`transition-all duration-300 cursor-default ${
                    index === currentLyricIndex
                      ? 'text-white font-bold'
                      : 'text-gray-300 text-sm'
                  } ${index < currentLyricIndex ? 'opacity-60' : ''}`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>

          {/* Time Slider */}
          <div className='px-6 py-4'>
            <div className='flex justify-between text-xs text-gray-400 mb-2'>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <CustomSlider
              value={currentTime}
              max={duration || 100}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
            />
          </div>

          {/* Controls */}
          <div className='px-6 py-4 flex items-center justify-between'>
            <button onClick={onPrevious} className='text-white/50 hover:text-white p-2'>
              <FaStepBackward size={20} />
            </button>
            <button
              onClick={() => onPlayPause(!isPlaying)}
              className={`${theme.playBtn} w-12 h-12 text-white rounded-full flex items-center justify-center hover:scale-105`}
            >
              {isPlaying ? <FaPause className='w-5 h-5' /> : <FaPlay className='ml-1 w-5 h-5' />}
            </button>
            <button onClick={onNext} className='text-white/50 hover:text-white p-2'>
              <FaStepForward size={20} />
            </button>
          </div>

          {/* Volume */}
          <div className='px-6 py-3 flex items-center gap-3 border-t border-gray-700'>
            <FaVolumeUp className='text-gray-400' size={14} />
            <CustomSlider
              value={volume}
              max={100}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="flex-1"
            />
          </div>

          {/* Audio */}
          <audio
            preload="auto"
            ref={audioRef}
            src={currentSong.audio}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onTimeUpdate={(e) => onTimeChange(e.target.currentTime)}
            onEnded={onSongEnd}
            onLoadedMetadata={(e) => {
              onTimeChange(e.target.currentTime);
              if (typeof onDurationChange === 'function') {
                onDurationChange(e.target.duration);
              }
            }}
            onError={(e) => console.error("Audio error:", e.target.error)}
          />
        </div>

        {/* Close */}
        <div className='mt-1 underline w-full text-end'>
          <button
            onClick={onClosePlayer}
            className='text-white/50 text-sm cursor-pointer hover:text-white'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function parseLRC(lrcText) {
  const lines = lrcText.split(/\r?\n/);
  const result = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{1,2}):(\d{2})(\.\d{1,2})?\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseFloat(match[3] || 0);
      const time = minutes * 60 + seconds + milliseconds;
      const text = match[4].trim();
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export default Player;
