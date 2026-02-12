import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabasePrograms, getSupabaseProgramWithModules, getSupabaseLesson, saveProgram, deleteProgram, ProgramDraft } from '@/services/supabaseProgramService';
import { enrollInProgram, getUserPrograms, updateProgramProgress, EnrollSchedule } from '@/services/profileService';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => getSupabasePrograms(),
  });
}

export function useProgramDetail(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: () => getSupabaseProgramWithModules(programId),
    enabled: !!programId,
  });
}

export function useLessonDetail(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getSupabaseLesson(lessonId),
    enabled: !!lessonId,
  });
}

export function useSaveProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: ProgramDraft) => saveProgram(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => deleteProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUserPrograms() {
  return useQuery({
    queryKey: ['userPrograms'],
    queryFn: getUserPrograms,
  });
}

export function useEnrollProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { programId: string; schedule?: EnrollSchedule }) =>
      enrollInProgram(params.programId, params.schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrograms'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['todaySession'] });
    },
  });
}

export function useUpdateProgramProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userProgramId: string) => updateProgramProgress(userProgramId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrograms'] });
    },
  });
}
