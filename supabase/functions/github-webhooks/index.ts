
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify the webhook signature from GitHub
  const signature = req.headers.get('x-hub-signature-256');
  const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
  
  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    const body = await req.text();
    const event = req.headers.get('x-github-event');
    const payload = JSON.parse(body);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process different webhook events
    if (event === 'issues') {
      const { action, issue, repository } = payload;
      
      // Find users who are tracking this repository
      const { data: trackers, error: trackersError } = await supabase
        .from('github_repos')
        .select('user_id')
        .eq('repo_owner', repository.owner.login)
        .eq('repo_name', repository.name)
        .eq('track_issues', true);
      
      if (trackersError) {
        console.error('Error fetching repository trackers:', trackersError);
        return new Response(
          JSON.stringify({ error: 'Failed to process webhook' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (trackers && trackers.length > 0) {
        // Process based on the action
        if (action === 'opened') {
          // A new issue was opened, create a task for each tracking user
          for (const tracker of trackers) {
            await supabase
              .from('tasks')
              .insert({
                user_id: tracker.user_id,
                title: `GitHub Issue: ${issue.title}`,
                completed: false,
                category: 'bug',
                priority: 'medium',
                github_issue_url: issue.html_url,
              });
          }
        } else if (action === 'closed') {
          // An issue was closed, mark related tasks as completed
          for (const tracker of trackers) {
            await supabase
              .from('tasks')
              .update({ completed: true })
              .eq('user_id', tracker.user_id)
              .eq('github_issue_url', issue.html_url);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
