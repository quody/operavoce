import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all completed session dates
    const { data: sessions } = await supabase
      .from('sessions')
      .select('scheduled_date')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false });

    if (!sessions || sessions.length === 0) {
      await supabase.from('profiles').update({ streak_current: 0 }).eq('id', user_id);
      return new Response(JSON.stringify({ streak_current: 0, streak_longest: 0 }));
    }

    const uniqueDates = [...new Set(sessions.map((s: any) => s.scheduled_date))].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const expected = new Date(new Date(uniqueDates[i - 1]).getTime() - 86400000)
          .toISOString().split('T')[0];
        if (uniqueDates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expected = new Date(new Date(uniqueDates[i - 1]).getTime() - 86400000)
        .toISOString().split('T')[0];
      if (uniqueDates[i] === expected) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Calculate total practice minutes
    const { data: totalData } = await supabase
      .from('sessions')
      .select('actual_duration_min')
      .eq('user_id', user_id)
      .eq('status', 'completed');

    const totalMinutes = totalData?.reduce((sum: number, s: any) => sum + (s.actual_duration_min || 0), 0) ?? 0;

    // Update profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_longest')
      .eq('id', user_id)
      .single();

    const newLongest = Math.max(longestStreak, profile?.streak_longest ?? 0);

    await supabase.from('profiles').update({
      streak_current: currentStreak,
      streak_longest: newLongest,
      total_practice_minutes: totalMinutes,
    }).eq('id', user_id);

    // Check for milestone
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    const isMilestone = milestones.includes(currentStreak);

    return new Response(JSON.stringify({
      streak_current: currentStreak,
      streak_longest: newLongest,
      total_practice_minutes: totalMinutes,
      is_milestone: isMilestone,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
