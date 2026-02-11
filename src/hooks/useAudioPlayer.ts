import { Audio } from 'expo-av';
import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    return () => {
      sound.current?.unloadAsync();
    };
  }, []);

  const play = useCallback(async (url: string) => {
    if (sound.current) {
      await sound.current.unloadAsync();
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          setIsLoaded(true);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      }
    );
    sound.current = newSound;
  }, []);

  const pause = useCallback(async () => {
    await sound.current?.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    await sound.current?.playAsync();
  }, []);

  const seekTo = useCallback(async (ms: number) => {
    await sound.current?.setPositionAsync(ms);
  }, []);

  const setSpeed = useCallback(async (rate: number) => {
    await sound.current?.setRateAsync(rate, true);
  }, []);

  const stop = useCallback(async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      await sound.current.unloadAsync();
      sound.current = null;
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoaded(false);
    }
  }, []);

  return { play, pause, resume, seekTo, setSpeed, stop, isPlaying, position, duration, isLoaded };
}
