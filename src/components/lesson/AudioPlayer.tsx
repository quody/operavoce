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
    <View className="bg-white rounded-2xl p-5 border border-surface-200">
      {title && <Text className="text-base font-semibold text-stone-900 mb-4">{title}</Text>}

      {/* Progress bar */}
      <View className="h-2 bg-surface-100 rounded-full mb-4 overflow-hidden">
        <View
          className="h-2 bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-stone-500 font-medium">{formatMs(position)}</Text>

        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => seekTo(Math.max(0, position - 10000))}
            className="p-2"
          >
            <Text className="text-primary-600 font-semibold text-sm">-10s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            className="w-12 h-12 rounded-full bg-primary-600 items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">{isPlaying ? '||' : '\u25B6'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => seekTo(Math.min(duration, position + 10000))}
            className="p-2"
          >
            <Text className="text-primary-600 font-semibold text-sm">+10s</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSpeedChange} className="p-2">
          <Text className="text-primary-600 font-semibold text-xs">{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
