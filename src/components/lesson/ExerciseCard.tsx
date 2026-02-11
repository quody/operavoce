import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ExerciseConfig } from '@/types/database';

interface ExerciseCardProps {
  title: string;
  config: ExerciseConfig;
  onComplete: () => void;
}

export function ExerciseCard({ title, config, onComplete }: ExerciseCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(config.duration_seconds ?? 0);
  const [currentRep, setCurrentRep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (config.reps && currentRep < config.reps) {
              setCurrentRep((r) => r + 1);
              return config.duration_seconds ?? 0;
            }
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeRemaining, currentRep, config]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(config.duration_seconds ?? 0);
    setCurrentRep(1);
    setIsComplete(false);
  };

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
      <Text className="text-base text-gray-600 mb-6">{config.instructions}</Text>

      {config.duration_seconds ? (
        <View className="items-center mb-6">
          <Text className="text-5xl font-bold text-primary-500 mb-2">
            {formatTime(timeRemaining)}
          </Text>
          {config.reps && (
            <Text className="text-lg text-gray-500">
              Rep {currentRep} of {config.reps}
            </Text>
          )}
          {config.bpm && (
            <Text className="text-sm text-gray-400 mt-1">
              Tempo: {config.bpm} BPM
            </Text>
          )}
        </View>
      ) : null}

      <View className="flex-row gap-3 justify-center">
        {!isComplete ? (
          <>
            <TouchableOpacity
              onPress={handleStartPause}
              className={`px-8 py-3 rounded-xl ${isRunning ? 'bg-accent-500' : 'bg-primary-500'}`}
            >
              <Text className="text-white font-semibold text-lg">
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset} className="px-6 py-3 rounded-xl border-2 border-gray-300">
              <Text className="text-gray-600 font-semibold text-lg">Reset</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onComplete} className="px-8 py-3 rounded-xl bg-green-500">
            <Text className="text-white font-semibold text-lg">Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
