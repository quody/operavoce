import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface TimePickerProps {
  value: string; // "HH:MM" format
  onChange: (time: string) => void;
}

// Hours 6 AM through 12 AM (midnight)
const HOURS: { value: number; label: string }[] = [];
for (let h = 6; h <= 23; h++) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  HOURS.push({ value: h, label: `${display} ${ampm}` });
}
HOURS.push({ value: 0, label: '12 AM' });

// Minutes every 5 minutes
const MINUTES: { value: number; label: string }[] = [];
for (let m = 0; m < 60; m += 5) {
  MINUTES.push({ value: m, label: m.toString().padStart(2, '0') });
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  // Round minute to nearest 5
  const roundedMin = Math.round(m / 5) * 5;
  return { hour: h, minute: roundedMin >= 60 ? 55 : roundedMin };
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { hour, minute } = parseTime(value);

  const handleHourChange = (h: number) => {
    onChange(formatTime(h, minute));
  };

  const handleMinuteChange = (m: number) => {
    onChange(formatTime(hour, m));
  };

  return (
    <View className="flex-row items-center bg-white border border-surface-200 rounded-2xl overflow-hidden">
      <View className="flex-1">
        <Picker
          selectedValue={hour}
          onValueChange={handleHourChange}
          style={Platform.OS === 'android' ? { height: 50 } : undefined}
          itemStyle={{ fontSize: 18 }}
        >
          {HOURS.map(({ value: v, label }) => (
            <Picker.Item key={v} value={v} label={label} />
          ))}
        </Picker>
      </View>

      <Text className="text-xl font-bold text-stone-400 px-1">:</Text>

      <View className="flex-1">
        <Picker
          selectedValue={minute}
          onValueChange={handleMinuteChange}
          style={Platform.OS === 'android' ? { height: 50 } : undefined}
          itemStyle={{ fontSize: 18 }}
        >
          {MINUTES.map(({ value: v, label }) => (
            <Picker.Item key={v} value={v} label={label} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
