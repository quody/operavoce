import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Session } from '@/types/database';

const CALENDAR_TITLE = 'OperaVoce';

async function getOrCreateCalendar(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === CALENDAR_TITLE);
  if (existing) return existing.id;

  const defaultCalendarSource = Platform.OS === 'ios'
    ? calendars.find((c) => c.source?.name === 'iCloud')?.source
    : { isLocalAccount: true, name: CALENDAR_TITLE, type: Calendar.CalendarType.LOCAL as any };

  if (!defaultCalendarSource) return null;

  const calendarId = await Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: '#4a3f8f',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: (defaultCalendarSource as any).id,
    source: defaultCalendarSource as any,
    name: CALENDAR_TITLE,
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return calendarId;
}

export async function syncSessionToDeviceCalendar(session: {
  scheduledDate: string;
  scheduledTime?: string;
  title: string;
  estimatedDurationMin: number;
  goals?: string[];
}): Promise<string | null> {
  const calendarId = await getOrCreateCalendar();
  if (!calendarId) return null;

  const startDate = session.scheduledTime
    ? new Date(`${session.scheduledDate}T${session.scheduledTime}`)
    : new Date(`${session.scheduledDate}T09:00:00`);

  const endDate = new Date(startDate.getTime() + session.estimatedDurationMin * 60000);

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: `OperaVoce: ${session.title}`,
    startDate,
    endDate,
    notes: session.goals?.join('\n') ?? '',
    alarms: [{ relativeOffset: -15 }],
  });

  return eventId;
}

export async function removeSessionFromDeviceCalendar(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (error) {
    console.warn('Failed to remove calendar event:', error);
  }
}
