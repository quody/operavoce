import { Platform } from 'react-native';

export async function logPracticeToHealth(durationMinutes: number, date: Date): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      // react-native-health is an optional dependency
      const AppleHealthKit = require('react-native-health').default;
      AppleHealthKit.saveMindfulSession(
        {
          startDate: date.toISOString(),
          endDate: new Date(date.getTime() + durationMinutes * 60000).toISOString(),
        },
        (err: any) => {
          if (err) console.warn('HealthKit error:', err);
        }
      );
    } else if (Platform.OS === 'android') {
      const { insertRecords } = require('react-native-health-connect');
      await insertRecords([{
        recordType: 'MindfulnessSession',
        startTime: date.toISOString(),
        endTime: new Date(date.getTime() + durationMinutes * 60000).toISOString(),
        title: 'OperaVoce Practice',
      }]);
    }
  } catch (error) {
    console.warn('Health integration error:', error);
  }
}
