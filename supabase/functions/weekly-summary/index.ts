import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // Get users with weekly summary enabled
    const { data: users } = await supabase
      .from('notification_preferences')
      .select('user_id, expo_push_token')
      .eq('weekly_summary_enabled', true)
      .not('expo_push_token', 'is', null);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    const messages = [];

    for (const user of users) {
      const { data: weekSessions } = await supabase
        .from('sessions')
        .select('actual_duration_min, self_rating')
        .eq('user_id', user.user_id)
        .eq('status', 'completed')
        .gte('scheduled_date', weekAgo);

      const sessionCount = weekSessions?.length ?? 0;
      const totalMinutes = weekSessions?.reduce((sum: number, s: any) => sum + (s.actual_duration_min || 0), 0) ?? 0;
      const avgRating = sessionCount > 0
        ? (weekSessions!.reduce((sum: number, s: any) => sum + (s.self_rating || 0), 0) / sessionCount).toFixed(1)
        : '0';

      messages.push({
        to: user.expo_push_token,
        sound: 'default',
        title: 'Your Weekly Summary',
        body: `This week: ${sessionCount} sessions, ${totalMinutes} minutes practiced, avg rating ${avgRating}/5`,
        data: { screen: '/(tabs)/progress' },
      });
    }

    if (messages.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    }

    return new Response(JSON.stringify({ sent: messages.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
