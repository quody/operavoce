import { supabase } from '@/lib/supabase';
import { Program, Module, Lesson, LessonContent, ExperienceLevel, LessonType } from '@/types/database';
import { ProgramWithModules, ModuleWithLessons } from '@/types/domain';

// ---------------------------------------------------------------------------
// Read helpers – always pull from Supabase so every user sees the same data
// ---------------------------------------------------------------------------

export async function getSupabasePrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}

export async function getSupabaseProgramWithModules(
  programId: string,
): Promise<ProgramWithModules | null> {
  const { data: program, error: pErr } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  if (pErr || !program) return null;

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('program_id', programId)
    .order('sort_order');

  const modulesWithLessons: ModuleWithLessons[] = [];
  for (const mod of modules ?? []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', mod.id)
      .order('sort_order');

    modulesWithLessons.push({
      ...mod,
      lessons: (lessons ?? []).map((l: any) => ({
        ...l,
        content: typeof l.content === 'string' ? JSON.parse(l.content) : l.content,
      })),
    });
  }

  return { ...program, modules: modulesWithLessons };
}

export async function getSupabaseLesson(lessonId: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content,
  } as Lesson;
}

// ---------------------------------------------------------------------------
// Write helpers – upsert full program tree to Supabase
// ---------------------------------------------------------------------------

export interface ProgramDraft {
  id?: string;
  title: string;
  description: string;
  level: ExperienceLevel;
  duration_weeks: number | null;
  is_free: boolean;
  modules: ModuleDraft[];
}

export interface ModuleDraft {
  id?: string;
  title: string;
  lessons: LessonDraft[];
}

export interface LessonDraft {
  id?: string;
  title: string;
  type: LessonType;
  content: LessonContent;
  duration_estimate_min: number | null;
}

/**
 * Saves a full program (with nested modules and lessons) to Supabase.
 * Works without authentication thanks to the open RLS policies.
 */
export async function saveProgram(draft: ProgramDraft): Promise<string> {
  // 1. Upsert the program row
  const programRow = {
    ...(draft.id ? { id: draft.id } : {}),
    title: draft.title,
    description: draft.description,
    level: draft.level,
    duration_weeks: draft.duration_weeks,
    is_free: draft.is_free,
    sort_order: 0,
  };

  const { data: program, error: pErr } = await supabase
    .from('programs')
    .upsert(programRow, { onConflict: 'id' })
    .select()
    .single();

  if (pErr || !program) throw pErr ?? new Error('Failed to save program');
  const programId: string = program.id;

  // 2. Upsert modules and lessons
  for (let mi = 0; mi < draft.modules.length; mi++) {
    const mod = draft.modules[mi];

    const moduleRow = {
      ...(mod.id ? { id: mod.id } : {}),
      program_id: programId,
      title: mod.title,
      sort_order: mi,
    };

    const { data: savedModule, error: mErr } = await supabase
      .from('modules')
      .upsert(moduleRow, { onConflict: 'id' })
      .select()
      .single();

    if (mErr || !savedModule) throw mErr ?? new Error('Failed to save module');

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];

      const lessonRow = {
        ...(lesson.id ? { id: lesson.id } : {}),
        module_id: savedModule.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        duration_estimate_min: lesson.duration_estimate_min,
        sort_order: li,
      };

      const { error: lErr } = await supabase
        .from('lessons')
        .upsert(lessonRow, { onConflict: 'id' })
        .select()
        .single();

      if (lErr) throw lErr;
    }
  }

  return programId;
}

export async function deleteProgram(programId: string): Promise<void> {
  const { error } = await supabase.from('programs').delete().eq('id', programId);
  if (error) throw error;
}
