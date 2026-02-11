import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '@/lib/database';
import { getCurrentUserId } from '@/services/authService';
import { getSessionStats, getCompletedSessionDates } from '@/services/sessionService';
import { getProfile } from '@/services/profileService';
import { calculateStreak } from '@/utils/streakCalculator';
import { DashboardStats, JournalEntry } from '@/types/domain';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [profile, sessionStats, completedDates] = await Promise.all([
        getProfile(),
        getSessionStats(),
        getCompletedSessionDates(),
      ]);

      const streak = calculateStreak(completedDates);

      // Calculate weekly minutes
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const userId = await getCurrentUserId();
      const db = await getDatabase();
      const weeklyStats = await db.getFirstAsync<{ minutes: number }>(
        `SELECT COALESCE(SUM(actual_duration_min), 0) as minutes FROM sessions
         WHERE user_id = ? AND status = 'completed' AND scheduled_date >= ?`,
        [userId!, weekAgoStr]
      );

      const weeklySessions = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM sessions
         WHERE user_id = ? AND status = 'completed' AND scheduled_date >= ?`,
        [userId!, weekAgoStr]
      );

      return {
        streak_current: streak.current,
        streak_longest: Math.max(streak.longest, profile?.streak_longest ?? 0),
        total_practice_minutes: profile?.total_practice_minutes ?? sessionStats.total_minutes,
        weekly_practice_minutes: weeklyStats?.minutes ?? 0,
        sessions_this_week: weeklySessions?.count ?? 0,
        goal_hit_rate: sessionStats.goal_hit_rate,
        average_rating: sessionStats.avg_rating,
      };
    },
  });
}

export function useJournalEntries() {
  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [];

      const db = await getDatabase();
      const rows = await db.getAllAsync<{
        id: string;
        scheduled_date: string;
        actual_duration_min: number | null;
        self_rating: number | null;
        journal_note: string | null;
        linked_lesson_ids: string;
        program_title: string | null;
      }>(
        `SELECT s.id, s.scheduled_date, s.actual_duration_min, s.self_rating,
                s.journal_note, s.linked_lesson_ids,
                p.title as program_title
         FROM sessions s
         LEFT JOIN user_programs up ON s.user_program_id = up.id
         LEFT JOIN programs p ON up.program_id = p.id
         WHERE s.user_id = ? AND s.status = 'completed'
         ORDER BY s.scheduled_date DESC`,
        [userId]
      );

      return rows.map((row) => ({
        session_id: row.id,
        date: row.scheduled_date,
        program_title: row.program_title,
        exercises_completed: [],
        self_rating: row.self_rating,
        journal_note: row.journal_note,
        duration_min: row.actual_duration_min,
      }));
    },
  });
}
