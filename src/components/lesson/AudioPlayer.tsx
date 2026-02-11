import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  url: string;
  title?: string;
}

export function AudioPlayer({ url, title }: AudioPlayerProps) {
  const { play, pause, resume, seekTo, setSpeed, isPlaying, position, duration, isLoaded } = useAudioPlayer();
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const formatMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!isLoaded) {
      await play(url);
    } else if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const handleSpeedChange = async () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    await setSpeed(nextSpeed);
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {title && <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>}

      {/* Progress bar */}
      <View className="h-2 bg-gray-200 rounded-full mb-3">
        <View
          className="h-2 bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">{formatMs(position)}</Text>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => seekTo(Math.max(0, position - 10000))}
            className="p-2"
          >
            <Text className="text-primary-500 font-semibold">-10s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">{isPlaying ? '||' : '>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => seekTo(Math.min(duration, position + 10000))}
            className="p-2"
          >
            <Text className="text-primary-500 font-semibold">+10s</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSpeedChange} className="p-2">
          <Text className="text-primary-500 font-semibold text-xs">{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
