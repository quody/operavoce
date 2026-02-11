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
    <View className="bg-white rounded-3xl p-6 border border-surface-200">
      <Text className="text-xl font-bold text-stone-900 mb-2">{title}</Text>
      <Text className="text-base text-stone-600 mb-6 leading-6">{config.instructions}</Text>

      {config.duration_seconds ? (
        <View className="items-center mb-8">
          <Text className="text-5xl font-bold text-primary-600 mb-2">
            {formatTime(timeRemaining)}
          </Text>
          {config.reps && (
            <Text className="text-lg text-stone-500">
              Rep {currentRep} of {config.reps}
            </Text>
          )}
          {config.bpm && (
            <Text className="text-sm text-stone-400 mt-1">
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
              className={`px-8 py-3.5 rounded-2xl ${isRunning ? 'bg-accent-500' : 'bg-primary-600'}`}
            >
              <Text className="text-white font-semibold text-lg">
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset} className="px-6 py-3.5 rounded-2xl border-2 border-surface-300">
              <Text className="text-stone-600 font-semibold text-lg">Reset</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onComplete} className="px-8 py-3.5 rounded-2xl bg-success-500">
            <Text className="text-white font-semibold text-lg">Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
