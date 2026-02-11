import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrograms, getProgramWithModules, getLesson, seedDefaultPrograms, fetchAndCachePrograms } from '@/services/programService';
import { enrollInProgram, getUserPrograms, updateProgramProgress } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';

export function usePrograms() {
  const { state } = useAuthStore();

  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      await seedDefaultPrograms();
      if (state === 'authenticated') {
        await fetchAndCachePrograms();
      }
      return getPrograms();
    },
  });
}

export function useProgramDetail(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: () => getProgramWithModules(programId),
    enabled: !!programId,
  });
}

export function useLessonDetail(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId),
    enabled: !!lessonId,
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
    mutationFn: (programId: string) => enrollInProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrograms'] });
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
