import { getDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Program, Module, Lesson } from '@/types/database';
import { ProgramWithModules, ModuleWithLessons } from '@/types/domain';
import { getAuthMode } from './authService';

export async function fetchAndCachePrograms(): Promise<void> {
  const mode = await getAuthMode();
  if (mode !== 'authenticated') return;

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('sort_order');

  if (!programs) return;

  const db = await getDatabase();
  for (const program of programs) {
    await db.runAsync(
      `INSERT OR REPLACE INTO programs (id, title, description, level, duration_weeks, thumbnail_url, is_free, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [program.id, program.title, program.description, program.level,
       program.duration_weeks, program.thumbnail_url, program.is_free ? 1 : 0,
       program.sort_order, program.created_at]
    );
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .order('sort_order');

  if (modules) {
    for (const mod of modules) {
      await db.runAsync(
        `INSERT OR REPLACE INTO modules (id, program_id, title, sort_order)
         VALUES (?, ?, ?, ?)`,
        [mod.id, mod.program_id, mod.title, mod.sort_order]
      );
    }
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .order('sort_order');

  if (lessons) {
    for (const lesson of lessons) {
      await db.runAsync(
        `INSERT OR REPLACE INTO lessons (id, module_id, title, type, content, audio_url, video_url, duration_estimate_min, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lesson.id, lesson.module_id, lesson.title, lesson.type,
         JSON.stringify(lesson.content), lesson.audio_url, lesson.video_url,
         lesson.duration_estimate_min, lesson.sort_order]
      );
    }
  }
}

export async function getPrograms(): Promise<Program[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Program & { is_free: number }>(
    'SELECT * FROM programs ORDER BY sort_order'
  );
  return rows.map((r) => ({ ...r, is_free: Boolean(r.is_free) }));
}

export async function getProgramWithModules(programId: string): Promise<ProgramWithModules | null> {
  const db = await getDatabase();
  const program = await db.getFirstAsync<Program & { is_free: number }>(
    'SELECT * FROM programs WHERE id = ?',
    [programId]
  );
  if (!program) return null;

  const modules = await db.getAllAsync<Module>(
    'SELECT * FROM modules WHERE program_id = ? ORDER BY sort_order',
    [programId]
  );

  const modulesWithLessons: ModuleWithLessons[] = [];
  for (const mod of modules) {
    const lessons = await db.getAllAsync<Lesson & { content: string }>(
      'SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order',
      [mod.id]
    );
    modulesWithLessons.push({
      ...mod,
      lessons: lessons.map((l) => ({
        ...l,
        content: typeof l.content === 'string' ? JSON.parse(l.content) : l.content,
      })),
    });
  }

  return {
    ...program,
    is_free: Boolean(program.is_free),
    modules: modulesWithLessons,
  };
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const db = await getDatabase();
  const lesson = await db.getFirstAsync<Lesson & { content: string }>(
    'SELECT * FROM lessons WHERE id = ?',
    [lessonId]
  );
  if (!lesson) return null;
  return {
    ...lesson,
    content: typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content,
  };
}

export async function seedDefaultPrograms(): Promise<void> {
  const db = await getDatabase();
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM programs');
  if (count && count.count > 0) return;

  const programs = [
    { id: 'prog-1', title: 'Absolute Beginner: Your First Notes', description: 'A 4-week journey from posture to breathing, pitch, and simple phrases. Perfect for those taking their first steps into opera.', level: 'beginner', duration_weeks: 4, is_free: 1, sort_order: 0 },
    { id: 'prog-2', title: 'Breath & Support Masterclass', description: 'A 3-week deep dive into appoggio technique — the foundation of operatic singing. Master diaphragmatic breathing and sustained support.', level: 'intermediate', duration_weeks: 3, is_free: 0, sort_order: 1 },
    { id: 'prog-3', title: 'Italian Diction for Singers', description: '4 weeks of IPA, vowel purity, and consonant placement. Sing Italian with clarity and authenticity.', level: 'intermediate', duration_weeks: 4, is_free: 0, sort_order: 2 },
    { id: 'prog-4', title: 'Vocal Agility & Coloratura', description: '6 weeks of scales, trills, and melismatic passages. Develop flexibility and precision in your vocal technique.', level: 'advanced', duration_weeks: 6, is_free: 0, sort_order: 3 },
    { id: 'prog-5', title: 'Aria Workshop: First Arias', description: 'Learn and polish 3 beginner-friendly arias over 6 weeks. Apply your technique to real repertoire.', level: 'intermediate', duration_weeks: 6, is_free: 0, sort_order: 4 },
    { id: 'prog-6', title: 'Performance Confidence', description: '3 weeks on stage presence, nerves management, and mock-performance exercises. Step onto the stage with confidence.', level: 'beginner', duration_weeks: 3, is_free: 0, sort_order: 5 },
  ];

  for (const p of programs) {
    await db.runAsync(
      `INSERT OR REPLACE INTO programs (id, title, description, level, duration_weeks, is_free, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.title, p.description, p.level, p.duration_weeks, p.is_free, p.sort_order]
    );
  }

  // Seed modules and lessons for the beginner program
  const beginnerModules = [
    { id: 'mod-1-1', program_id: 'prog-1', title: 'Posture & Alignment', sort_order: 0 },
    { id: 'mod-1-2', program_id: 'prog-1', title: 'Breath Support', sort_order: 1 },
    { id: 'mod-1-3', program_id: 'prog-1', title: 'Finding Your Pitch', sort_order: 2 },
    { id: 'mod-1-4', program_id: 'prog-1', title: 'Simple Phrases', sort_order: 3 },
  ];

  for (const m of beginnerModules) {
    await db.runAsync(
      `INSERT OR REPLACE INTO modules (id, program_id, title, sort_order) VALUES (?, ?, ?, ?)`,
      [m.id, m.program_id, m.title, m.sort_order]
    );
  }

  const beginnerLessons = [
    { id: 'les-1-1-1', module_id: 'mod-1-1', title: 'The Singer\'s Stance', type: 'text', content: JSON.stringify({ body: '# The Singer\'s Stance\n\nProper posture is the foundation of great singing. Stand with feet shoulder-width apart, knees slightly bent, and shoulders relaxed.\n\n## Key Points\n- Keep your chin parallel to the floor\n- Imagine a string pulling you up from the crown of your head\n- Relax your jaw and facial muscles\n- Keep your chest comfortably high\n\nPractice standing in this position for 2 minutes, checking each point.' }), sort_order: 0, duration_estimate_min: 10 },
    { id: 'les-1-1-2', module_id: 'mod-1-1', title: 'Body Awareness Exercise', type: 'exercise', content: JSON.stringify({ body: 'Practice the singer\'s stance with body scanning.', exercise: { instructions: 'Stand in singer\'s stance. Starting from your feet, slowly scan upward, consciously relaxing each body part. Hold for the full duration.', duration_seconds: 120, reps: 3 } }), sort_order: 1, duration_estimate_min: 10 },
    { id: 'les-1-1-3', module_id: 'mod-1-1', title: 'Posture Self-Check', type: 'quiz', content: JSON.stringify({ quiz: { questions: [{ question: 'Where should your chin be positioned while singing?', options: ['Tilted up', 'Parallel to the floor', 'Tucked down', 'It doesn\'t matter'], correct_index: 1, explanation: 'Keeping your chin parallel to the floor helps maintain an open throat and proper airflow.' }, { question: 'What should you imagine to maintain good posture?', options: ['A weight on your head', 'A string pulling up from the crown of your head', 'Leaning against a wall', 'Balancing a book'], correct_index: 1, explanation: 'The string image helps you achieve natural upward alignment without tension.' }] } }), sort_order: 2, duration_estimate_min: 5 },
    { id: 'les-1-2-1', module_id: 'mod-1-2', title: 'Diaphragmatic Breathing', type: 'text', content: JSON.stringify({ body: '# Diaphragmatic Breathing\n\nThe diaphragm is a dome-shaped muscle at the base of your lungs. Learning to engage it is essential for opera singing.\n\n## How It Works\n1. Place one hand on your chest and one on your belly\n2. Breathe in slowly through your nose\n3. Your belly should expand outward while your chest stays relatively still\n4. Exhale slowly through pursed lips\n\n## Why It Matters\nDiaphragmatic breathing gives you the control and power needed for sustained phrases in opera.' }), sort_order: 0, duration_estimate_min: 10 },
    { id: 'les-1-2-2', module_id: 'mod-1-2', title: 'Sustained Tone Exercise', type: 'exercise', content: JSON.stringify({ body: 'Practice sustaining a single tone with proper breath support.', exercise: { instructions: 'Take a deep diaphragmatic breath. Sing a comfortable pitch on "Ah" and sustain it as long as you can with steady tone. Record your time and try to increase it.', duration_seconds: 15, reps: 5, use_metronome: false } }), sort_order: 1, duration_estimate_min: 15 },
    { id: 'les-1-2-3', module_id: 'mod-1-2', title: 'Breath Control Practice', type: 'exercise', content: JSON.stringify({ body: 'Build breath control with timed breathing exercises.', exercise: { instructions: 'Inhale for 4 counts, hold for 4 counts, exhale on a hiss for 8 counts. Gradually increase the exhale count.', duration_seconds: 180, reps: 4, bpm: 60, use_metronome: true } }), sort_order: 2, duration_estimate_min: 15 },
    { id: 'les-1-3-1', module_id: 'mod-1-3', title: 'Understanding Pitch', type: 'text', content: JSON.stringify({ body: '# Understanding Pitch\n\nPitch is the perceived frequency of a sound. In singing, matching pitch accurately is fundamental.\n\n## Finding Your Range\n- Start by humming comfortably\n- Gradually slide your pitch up and down\n- Notice where your voice feels most comfortable\n- This is your "sweet spot" — your natural speaking range\n\n## Pitch Matching\nListen to a reference note (piano, tuner, or recording) and try to match it by adjusting your voice. Start with notes in your comfortable range.' }), sort_order: 0, duration_estimate_min: 10 },
    { id: 'les-1-3-2', module_id: 'mod-1-3', title: 'Pitch Matching Exercise', type: 'exercise', content: JSON.stringify({ body: 'Practice matching pitches to develop your ear.', exercise: { instructions: 'Listen to the reference tone, then sing the same pitch on "La". Hold each note for 4 beats. Move through 5 different pitches in your comfortable range.', duration_seconds: 120, reps: 5, bpm: 72, use_metronome: true } }), sort_order: 1, duration_estimate_min: 15 },
    { id: 'les-1-4-1', module_id: 'mod-1-4', title: 'Your First Melody', type: 'text', content: JSON.stringify({ body: '# Your First Melody\n\nNow that you have posture, breath, and pitch basics, it\'s time to put them together.\n\n## Simple Scale Exercise\nSing up and down a 5-note scale (Do-Re-Mi-Fa-Sol-Fa-Mi-Re-Do) on "Ah"\n\n## Tips\n- Maintain your singer\'s stance\n- Use diaphragmatic breathing\n- Keep your throat open and relaxed\n- Move smoothly between notes\n- Start slowly and gradually increase speed' }), sort_order: 0, duration_estimate_min: 10 },
    { id: 'les-1-4-2', module_id: 'mod-1-4', title: 'Scale Practice', type: 'exercise', content: JSON.stringify({ body: 'Sing simple scales combining all techniques learned.', exercise: { instructions: 'Sing a 5-note ascending and descending scale on "Ah". Focus on smooth transitions, steady breath support, and consistent tone. Start at a comfortable pitch and move up by half steps.', duration_seconds: 180, reps: 6, bpm: 80, use_metronome: true } }), sort_order: 1, duration_estimate_min: 15 },
    { id: 'les-1-4-3', module_id: 'mod-1-4', title: 'Module Review', type: 'quiz', content: JSON.stringify({ quiz: { questions: [{ question: 'Which muscle is primarily responsible for breath support in opera singing?', options: ['Intercostal muscles', 'Diaphragm', 'Abdominal muscles', 'Throat muscles'], correct_index: 1, explanation: 'The diaphragm is the primary muscle used for breath support (appoggio) in operatic singing.' }, { question: 'What is the recommended breathing technique for singing?', options: ['Chest breathing', 'Shoulder breathing', 'Diaphragmatic breathing', 'Shallow breathing'], correct_index: 2, explanation: 'Diaphragmatic breathing provides the deep, controlled airflow needed for singing.' }, { question: 'When singing a scale, what should you focus on?', options: ['Singing as loudly as possible', 'Smooth transitions between notes', 'Moving through notes quickly', 'Only breathing at the start'], correct_index: 1, explanation: 'Smooth transitions (legato) between notes is a fundamental skill in opera singing.' }] } }), sort_order: 2, duration_estimate_min: 5 },
  ];

  for (const l of beginnerLessons) {
    await db.runAsync(
      `INSERT OR REPLACE INTO lessons (id, module_id, title, type, content, duration_estimate_min, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.module_id, l.title, l.type, l.content, l.duration_estimate_min, l.sort_order]
    );
  }
}
