import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useJournalEntries } from '@/hooks/useProgress';
import { formatDate, formatDuration } from '@/utils/datetime';
import { RATING_LABELS } from '@/lib/constants';
import { JournalEntry } from '@/types/domain';

export default function JournalScreen() {
  const router = useRouter();
  const { data: entries = [], isLoading } = useJournalEntries();

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-base font-semibold text-stone-900">{formatDate(item.date)}</Text>
          {item.program_title && (
            <Text className="text-sm text-stone-500 mt-0.5">{item.program_title}</Text>
          )}
        </View>
        {item.self_rating && (
          <View className="flex-row items-center gap-1">
            <Text className="text-accent-500 text-sm">
              {'\u2605'.repeat(item.self_rating)}
            </Text>
            <Text className="text-xs text-stone-400">
              {RATING_LABELS[item.self_rating - 1]}
            </Text>
          </View>
        )}
      </View>

      {item.duration_min && (
        <Text className="text-xs text-stone-400 mb-2">
          Duration: {formatDuration(item.duration_min)}
        </Text>
      )}

      {item.journal_note && (
        <Text className="text-sm text-stone-700 leading-5 mt-1">{item.journal_note}</Text>
      )}
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-surface-200">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 p-1">
          <Text className="text-primary-600 text-lg">{'\u2039'}</Text>
          <Text className="text-primary-600">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-900 ml-3">Practice Journal</Text>
      </View>

      {entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-surface-100 items-center justify-center mb-4">
            <Text className="text-stone-400 text-2xl">{'\u270E'}</Text>
          </View>
          <Text className="text-stone-500 text-base font-medium mb-1">No journal entries yet</Text>
          <Text className="text-stone-400 text-sm text-center">
            Complete practice sessions to start building your journal
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.session_id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
