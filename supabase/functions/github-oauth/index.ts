
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
    const { code, action, redirectUri } = requestBody;
    
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
      receivedRedirectUri: redirectUri,
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
    
    // For the exchange action, we can use user authorization optionally - not required
    // This allows non-authenticated users to connect with GitHub
    let user = null;

    // Only try to get the user if we have an auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData?.user) {
        user = userData.user;
        console.log('User authenticated:', user.id);
      } else {
        // Log the error but don't fail - we'll create an anonymous session
        console.log('Auth error but proceeding:', userError);
      }
    } else {
      console.log('No Authorization header provided - proceeding with anonymous access');
    }

    if (action === 'exchange') {
      console.log(`Exchanging GitHub code for token using redirect URI: ${redirectUri}`);
      
      if (!redirectUri) {
        console.error('Missing redirectUri in exchange request');
        return new Response(
          JSON.stringify({ error: 'Missing redirectUri parameter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
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
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();
      console.log("GitHub token exchange response:", {
        success: !tokenData.error,
        error: tokenData.error,
        error_description: tokenData.error_description,
      });
      
      if (tokenData.error) {
        console.error('GitHub token exchange error:', tokenData.error, tokenData.error_description);
        return new Response(
          JSON.stringify({ 
            error: tokenData.error_description || 'Failed to exchange GitHub code',
            details: tokenData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { access_token, refresh_token } = tokenData;
      
      if (!access_token) {
        console.error('No access token received from GitHub');
        return new Response(
          JSON.stringify({ error: 'No access token received from GitHub' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Get GitHub user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const githubUser = await userResponse.json();
      console.log("GitHub user info:", { login: githubUser.login, id: githubUser.id });
      
      if (!githubUser.login) {
        console.error('Invalid GitHub user response:', githubUser);
        return new Response(
          JSON.stringify({ error: 'Failed to get GitHub user info', details: githubUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // If we have a user, store the connection
      let connectionId = null;
      if (user) {
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
        
        connectionId = connectionData?.[0]?.id;
      } else {
        console.log("No authenticated user - not storing connection");
        // For anonymous users, we don't store the connection but return the data
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          github_username: githubUser.login,
          connection_id: connectionId,
          access_token // Include the token in the response
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else if (action === 'repositories') {
      // For subsequent actions, we still need a user or access token
      if (!user && !requestBody.access_token) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      let accessToken = requestBody.access_token;
      
      // If we have a user but no token provided, get from database
      if (!accessToken && user) {
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
        
        accessToken = connection.access_token;
      }

      // Fetch the user's repositories from GitHub
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${accessToken}`,
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
      // For these actions, we need a user
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
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
      // For these actions, we need a user
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
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
