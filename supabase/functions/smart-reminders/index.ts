import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

    // Find users who haven't practiced in 3+ days
    const { data: allUsers } = await supabase
      .from('notification_preferences')
      .select('user_id, expo_push_token, streak_reminder_enabled')
      .eq('streak_reminder_enabled', true)
      .not('expo_push_token', 'is', null);

    if (!allUsers || allUsers.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    const reEngagementMessages = [];

    for (const user of allUsers) {
      // Check last completed session
      const { data: lastSession } = await supabase
        .from('sessions')
        .select('scheduled_date')
        .eq('user_id', user.user_id)
        .eq('status', 'completed')
        .order('scheduled_date', { ascending: false })
        .limit(1)
        .single();

      if (!lastSession || lastSession.scheduled_date < threeDaysAgo) {
        reEngagementMessages.push({
          to: user.expo_push_token,
          sound: 'default',
          title: 'We miss you!',
          body: 'Just 5 minutes of practice can make a difference. Try a quick warm-up!',
          data: { screen: '/(tabs)' },
        });
      }
    }

    if (reEngagementMessages.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reEngagementMessages),
      });
    }

    return new Response(JSON.stringify({ sent: reEngagementMessages.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
