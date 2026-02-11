import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { user_id, platform, receipt_data } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let tier: 'free' | 'premium' | 'lifetime' = 'free';

    if (platform === 'ios') {
      // Validate with Apple App Store
      // In production, use Apple's verifyReceipt endpoint
      // For now, this is a placeholder
      const appleResponse = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': receipt_data,
          password: Deno.env.get('APPLE_SHARED_SECRET'),
        }),
      });

      const appleResult = await appleResponse.json();
      if (appleResult.status === 0) {
        // Valid receipt - determine tier from latest_receipt_info
        const latestReceipt = appleResult.latest_receipt_info?.[0];
        if (latestReceipt?.product_id?.includes('lifetime')) {
          tier = 'lifetime';
        } else if (latestReceipt) {
          tier = 'premium';
        }
      }
    } else if (platform === 'android') {
      // Validate with Google Play
      // In production, use Google Play Developer API
      // Placeholder for now
      tier = 'premium';
    }

    await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user_id);

    return new Response(JSON.stringify({ tier }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
