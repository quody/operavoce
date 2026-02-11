import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions, getSessionWithDetails, createSession, completeSession,
  skipSession, addSessionGoal, updateGoal, getTodaySession,
  getCompletedSessionDates, getSessionStats, updateSession,
} from '@/services/sessionService';

export function useSessions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sessions', startDate, endDate],
    queryFn: () => getSessions(startDate, endDate),
  });
}

export function useSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSessionWithDetails(sessionId),
    enabled: !!sessionId,
  });
}

export function useTodaySession() {
  return useQuery({
    queryKey: ['todaySession'],
    queryFn: getTodaySession,
  });
}

export function useCompletedDates() {
  return useQuery({
    queryKey: ['completedDates'],
    queryFn: getCompletedSessionDates,
  });
}

export function useSessionStats() {
  return useQuery({
    queryKey: ['sessionStats'],
    queryFn: getSessionStats,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['todaySession'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { sessionId: string; rating: number; note?: string; durationMin?: number }) =>
      completeSession(params.sessionId, params.rating, params.note, params.durationMin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['todaySession'] });
      queryClient.invalidateQueries({ queryKey: ['completedDates'] });
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
    },
  });
}

export function useSkipSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skipSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['todaySession'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { sessionId: string; updates: Record<string, unknown> }) =>
      updateSession(params.sessionId, params.updates as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['todaySession'] });
    },
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { sessionId: string; goal: { type: string; description: string; target_value?: string } }) =>
      addSessionGoal(params.sessionId, params.goal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { goalId: string; updates: { actual_value?: string; met?: boolean } }) =>
      updateGoal(params.goalId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
    },
  });
}
