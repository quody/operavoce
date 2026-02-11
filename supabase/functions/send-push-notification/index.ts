import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all users with push tokens who have upcoming sessions within 30 minutes
    const now = new Date();
    const thirtyMinLater = new Date(now.getTime() + 30 * 60000);
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const laterTime = thirtyMinLater.toTimeString().slice(0, 5);

    const { data: upcomingSessions } = await supabase
      .from('sessions')
      .select(`
        id, scheduled_time, user_id,
        notification_preferences!inner(expo_push_token, daily_reminder_enabled)
      `)
      .eq('scheduled_date', today)
      .eq('status', 'upcoming')
      .gte('scheduled_time', currentTime)
      .lte('scheduled_time', laterTime);

    if (!upcomingSessions || upcomingSessions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    const messages = upcomingSessions
      .filter((s: any) => s.notification_preferences?.expo_push_token && s.notification_preferences?.daily_reminder_enabled)
      .map((s: any) => ({
        to: s.notification_preferences.expo_push_token,
        sound: 'default',
        title: 'Time to Practice!',
        body: 'Your practice session starts soon. Let\'s warm up!',
        data: { screen: `/(tabs)/calendar/session/${s.id}` },
      }));

    if (messages.length > 0) {
      // Send via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      return new Response(JSON.stringify({ sent: messages.length, result }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
