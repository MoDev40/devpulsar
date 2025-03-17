import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Log the request for debugging
  console.log(`Received ${req.method} request to github-oauth function:`, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    const { code, action } = requestBody;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const githubClientId = Deno.env.get('GITHUB_CLIENT_ID') || '';
    const githubClientSecret = Deno.env.get('GITHUB_CLIENT_SECRET') || '';
    
    // Log environment variables (without sensitive values)
    console.log("Environment variables check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasGithubClientId: !!githubClientId,
      hasGithubClientSecret: !!githubClientSecret,
    });
    
    if (!supabaseUrl || !supabaseServiceKey || !githubClientId || !githubClientSecret) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', missing: {
          supabaseUrl: !supabaseUrl,
          supabaseServiceKey: !supabaseServiceKey,
          githubClientId: !githubClientId,
          githubClientSecret: !githubClientSecret
        }}),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    if (action === 'exchange') {
      console.log(`Exchanging GitHub code for token: ${code.substring(0, 5)}...`);
      
      // Exchange the GitHub code for an access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: githubClientId,
          client_secret: githubClientSecret,
          code: code
        })
      });

      const tokenData = await tokenResponse.json();
      console.log("GitHub token exchange response:", {
        success: !tokenData.error,
        error: tokenData.error,
        error_description: tokenData.error_description,
      });
      
      if (tokenData.error) {
        console.error('GitHub token exchange error:', tokenData.error);
        return new Response(
          JSON.stringify({ error: tokenData.error_description || 'Failed to exchange GitHub code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { access_token, refresh_token } = tokenData;
      
      // Get GitHub user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const githubUser = await userResponse.json();
      console.log("GitHub user info:", { login: githubUser.login, id: githubUser.id });
      
      // Store or update the GitHub connection in our database
      const { data: connectionData, error: connectionError } = await supabase
        .from('github_connections')
        .upsert({
          user_id: user.id,
          access_token,
          refresh_token: refresh_token || null,
          github_username: githubUser.login,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select('id');
      
      if (connectionError) {
        console.error('Error storing GitHub connection:', connectionError);
        return new Response(
          JSON.stringify({ error: 'Failed to store GitHub connection', details: connectionError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          github_username: githubUser.login,
          connection_id: connectionData?.[0]?.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'repositories') {
      // Get the user's GitHub access token from our database
      const { data: connection, error: connectionError } = await supabase
        .from('github_connections')
        .select('access_token')
        .eq('user_id', user.id)
        .single();
      
      if (connectionError || !connection) {
        console.error('Error getting GitHub connection:', connectionError);
        return new Response(
          JSON.stringify({ error: 'GitHub connection not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Fetch the user's repositories from GitHub
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${connection.access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const repos = await reposResponse.json();
      
      if (!Array.isArray(repos)) {
        console.error('Error fetching GitHub repositories:', repos);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch GitHub repositories' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Format the repositories for our frontend
      const formattedRepos = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        html_url: repo.html_url,
        description: repo.description,
        is_private: repo.private
      }));

      return new Response(
        JSON.stringify({ repositories: formattedRepos }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'track') {
      const { repo_id, repo_owner, repo_name, track_issues, track_pull_requests } = await req.json();
      
      // Store the repo tracking preferences
      const { data: repoData, error: repoError } = await supabase
        .from('github_repos')
        .upsert({
          user_id: user.id,
          repo_id,
          repo_owner,
          repo_name,
          track_issues,
          track_pull_requests,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, repo_id'
        })
        .select('id');
      
      if (repoError) {
        console.error('Error storing GitHub repo tracking:', repoError);
        return new Response(
          JSON.stringify({ error: 'Failed to store repository tracking settings' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, id: repoData?.[0]?.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'issues') {
      const { repo_owner, repo_name } = await req.json();
      
      // Get the user's GitHub access token from our database
      const { data: connection, error: connectionError } = await supabase
        .from('github_connections')
        .select('access_token')
        .eq('user_id', user.id)
        .single();
      
      if (connectionError || !connection) {
        console.error('Error getting GitHub connection:', connectionError);
        return new Response(
          JSON.stringify({ error: 'GitHub connection not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Fetch issues from the repository
      const issuesResponse = await fetch(`https://api.github.com/repos/${repo_owner}/${repo_name}/issues?state=open&sort=updated&per_page=100`, {
        headers: {
          'Authorization': `token ${connection.access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const issues = await issuesResponse.json();
      
      if (!Array.isArray(issues)) {
        console.error('Error fetching GitHub issues:', issues);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch GitHub issues' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Format the issues for our frontend
      const formattedIssues = issues
        .filter(issue => !issue.pull_request) // Filter out pull requests
        .map(issue => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          html_url: issue.html_url,
          state: issue.state,
          created_at: issue.created_at,
          updated_at: issue.updated_at
        }));

      return new Response(
        JSON.stringify({ issues: formattedIssues }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
