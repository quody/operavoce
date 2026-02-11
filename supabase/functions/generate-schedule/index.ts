import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { user_program_id, practice_days_per_week, preferred_time } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user program details
    const { data: userProgram } = await supabase
      .from('user_programs')
      .select('*, programs(duration_weeks)')
      .eq('id', user_program_id)
      .single();

    if (!userProgram) {
      return new Response(JSON.stringify({ error: 'User program not found' }), { status: 404 });
    }

    // Get all lessons for this program
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, module_id, sort_order, modules!inner(program_id, sort_order)')
      .eq('modules.program_id', userProgram.program_id)
      .order('modules.sort_order')
      .order('sort_order');

    if (!lessons || lessons.length === 0) {
      return new Response(JSON.stringify({ error: 'No lessons found' }), { status: 404 });
    }

    // Generate schedule: distribute lessons across practice days
    const daysOfWeek = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    const practiceDays = daysOfWeek.slice(0, practice_days_per_week || 3);

    const startDate = new Date(userProgram.start_date);
    const sessions: any[] = [];
    let lessonIndex = 0;
    let currentDate = new Date(startDate);

    while (lessonIndex < lessons.length) {
      const dayOfWeek = currentDate.getDay();

      if (practiceDays.includes(dayOfWeek)) {
        // Assign 1-3 lessons per session depending on lesson count
        const lessonsPerSession = Math.min(2, lessons.length - lessonIndex);
        const sessionLessonIds = [];

        for (let i = 0; i < lessonsPerSession; i++) {
          sessionLessonIds.push(lessons[lessonIndex + i].id);
        }

        sessions.push({
          user_id: userProgram.user_id,
          scheduled_date: currentDate.toISOString().split('T')[0],
          scheduled_time: preferred_time || '18:00',
          user_program_id: user_program_id,
          linked_lesson_ids: sessionLessonIds,
        });

        lessonIndex += lessonsPerSession;
      }

      currentDate.setDate(currentDate.getDate() + 1);

      // Safety: don't generate more than 365 days out
      if (sessions.length > 365) break;
    }

    // Insert sessions
    const { error } = await supabase.from('sessions').insert(sessions);
    if (error) throw error;

    // Update target end date
    if (sessions.length > 0) {
      const lastDate = sessions[sessions.length - 1].scheduled_date;
      await supabase
        .from('user_programs')
        .update({ target_end_date: lastDate })
        .eq('id', user_program_id);
    }

    return new Response(JSON.stringify({ sessions_created: sessions.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
