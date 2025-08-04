"use client";
import React, { useState, useEffect } from 'react';
import Player from './player';
import { songs } from './songs';

const Main = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isRandom, setIsRandom] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [hoveredSongIndex, setHoveredSongIndex] = useState(null);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    if (isRandom) playRandom();
    else setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const playPrevious = () => {
    if (isRandom) playRandom();
    else setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const playRandom = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === currentSongIndex && songs.length > 1);
    setCurrentSongIndex(newIndex);
  };

  const handleSongEnd = () => playNext();
  const handleClosePlayer = () => {
    setShowPlayer(false);
    setIsPlaying(false);
  };

  const activeVideo =
    hoveredSongIndex !== null
      ? songs[hoveredSongIndex]?.video
      : isPlaying
      ? songs[currentSongIndex]?.video
      : null;

  return (
    <div className='relative'>
      {/* Background Video */}
      {activeVideo && (
        <video
          key={activeVideo}
          src={activeVideo}
          autoPlay
          muted
          loop
          className="fixed top-0 left-0 w-full h-full object-cover z-[-1] transition-opacity duration-500"
        />
      )}

      <div className='container mx-auto px-4 max-w-md relative z-10'>
        {/* Song List View */}
        {!showPlayer && (
          <>
            <h2 className='mt-10 md:mt-20 text-center font-bold text-2xl text-white'>
              Streamify.
            </h2>

            <div className='mt-10 space-y-3'>
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`bg-white/30 backdrop-blur-lg border border-white/10 rounded-md shadow-lg gap-3 flex py-3 px-5 cursor-pointer hover:bg-white/40 transition-all`}
                  onClick={() => {
                    setCurrentSongIndex(index);
                    setShowPlayer(true);
                  }}
                  onMouseEnter={() => setHoveredSongIndex(index)}
                  onMouseLeave={() => setHoveredSongIndex(null)}
                >
                  <div className='w-13'>
                    <img
                      className='rounded-md w-12 h-12 object-cover'
                      src={song.cover}
                      alt="album cover"
                    />
                  </div>
                  <div className='flex flex-col justify-center flex-1'>
                    <h3 className='text-base font-bold text-white'>{song.title}</h3>
                    <p className='text-xs text-gray-300'>{song.artist}</p>
                  </div>
                  {currentSongIndex === index && isPlaying && (
                    <div className='flex items-center'>
                      <div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse mr-1'></div>
                      <div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse mr-1'></div>
                      <div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse'></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Player View */}
        {showPlayer && (
          <Player
            songs={songs}
            currentSongIndex={currentSongIndex}
            isPlaying={isPlaying}
            isRandom={isRandom}
            currentTime={currentTime}
            duration={duration}
            onDurationChange={(dur) => setDuration(dur)}
            volume={volume}
            onPlayPause={togglePlay}
            onNext={playNext}
            onPrevious={playPrevious}
            onRandomToggle={() => setIsRandom(!isRandom)}
            onTimeChange={setCurrentTime}
            onVolumeChange={setVolume}
            onClosePlayer={handleClosePlayer}
            onSongEnd={handleSongEnd}
          />
        )}
      </div>
    </div>
  );
};

export default Main;
