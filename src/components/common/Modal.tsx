import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, Text } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="w-10 h-1 bg-surface-300 rounded-full self-center mb-5" />
          <View className="flex-row justify-between items-center mb-4">
            {title && <Text className="text-xl font-bold text-stone-900">{title}</Text>}
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-stone-400 text-base font-medium">Close</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
}
