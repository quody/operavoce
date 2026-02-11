import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LessonContent } from '@/types/database';

interface TextLessonProps {
  title: string;
  content: LessonContent;
}

export function TextLesson({ title, content }: TextLessonProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} className="text-2xl font-bold text-stone-900 mb-3 mt-4">
            {line.slice(2)}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} className="text-xl font-semibold text-stone-800 mb-2 mt-3">
            {line.slice(3)}
          </Text>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <View key={index} className="flex-row mb-1.5 pl-4">
            <Text className="text-primary-400 mr-3">{'\u2022'}</Text>
            <Text className="text-base text-stone-700 flex-1 leading-6">{line.slice(2)}</Text>
          </View>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\.\s(.+)/);
        if (num) {
          return (
            <View key={index} className="flex-row mb-1.5 pl-4">
              <Text className="text-primary-500 mr-3 font-medium">{num[1]}.</Text>
              <Text className="text-base text-stone-700 flex-1 leading-6">{num[2]}</Text>
            </View>
          );
        }
      }
      if (line.trim() === '') {
        return <View key={index} className="h-3" />;
      }
      return (
        <Text key={index} className="text-base text-stone-700 leading-7 mb-1">
          {line}
        </Text>
      );
    });
  };

  return (
    <ScrollView className="flex-1 px-6 py-5" showsVerticalScrollIndicator={false}>
      {content.body && renderMarkdown(content.body)}
      <View className="h-8" />
    </ScrollView>
  );
}
