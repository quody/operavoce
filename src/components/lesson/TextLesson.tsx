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
          <Text key={index} className="text-2xl font-bold text-gray-900 mb-3 mt-4">
            {line.slice(2)}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} className="text-xl font-semibold text-gray-800 mb-2 mt-3">
            {line.slice(3)}
          </Text>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <View key={index} className="flex-row mb-1 pl-4">
            <Text className="text-gray-600 mr-2">&#8226;</Text>
            <Text className="text-base text-gray-700 flex-1 leading-6">{line.slice(2)}</Text>
          </View>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\.\s(.+)/);
        if (num) {
          return (
            <View key={index} className="flex-row mb-1 pl-4">
              <Text className="text-gray-600 mr-2">{num[1]}.</Text>
              <Text className="text-base text-gray-700 flex-1 leading-6">{num[2]}</Text>
            </View>
          );
        }
      }
      if (line.trim() === '') {
        return <View key={index} className="h-2" />;
      }
      return (
        <Text key={index} className="text-base text-gray-700 leading-6 mb-1">
          {line}
        </Text>
      );
    });
  };

  return (
    <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
      {content.body && renderMarkdown(content.body)}
      <View className="h-8" />
    </ScrollView>
  );
}
