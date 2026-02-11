import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { record } = await req.json();
    const userId = record.id;
    const email = record.email;
    const fullName = record.raw_user_meta_data?.full_name ?? '';
    const avatarUrl = record.raw_user_meta_data?.avatar_url ?? '';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Create profile
    await supabase.from('profiles').upsert({
      id: userId,
      display_name: fullName,
      avatar_url: avatarUrl,
    });

    // Create default notification preferences
    await supabase.from('notification_preferences').upsert({
      user_id: userId,
    });

    // Find the free beginner program and auto-enroll
    const { data: freeProgram } = await supabase
      .from('programs')
      .select('id')
      .eq('is_free', true)
      .order('sort_order')
      .limit(1)
      .single();

    if (freeProgram) {
      const { data: firstModule } = await supabase
        .from('modules')
        .select('id')
        .eq('program_id', freeProgram.id)
        .order('sort_order')
        .limit(1)
        .single();

      let firstLessonId = null;
      if (firstModule) {
        const { data: firstLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('module_id', firstModule.id)
          .order('sort_order')
          .limit(1)
          .single();
        firstLessonId = firstLesson?.id ?? null;
      }

      await supabase.from('user_programs').upsert({
        user_id: userId,
        program_id: freeProgram.id,
        current_module_id: firstModule?.id ?? null,
        current_lesson_id: firstLessonId,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
