import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Creates a ta_profiles row + their first class right after signup — no
// teacher approval required.
// 
// SECURITY: Requires JWT authentication. The authenticated user's ID from
// the verified JWT is used as the ta_profiles.id. Clients cannot supply
// arbitrary auth_user_id values.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Require and verify JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract and verify JWT
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request body (auth_user_id removed - we use JWT user.id)
    const body = await req.json();
    const { ta_name, ta_email, course, sir_name } = body;

    if (!ta_name || !ta_email || !course) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Use authenticated user ID (cannot be spoofed)
    const auth_user_id = user.id;

    // 4. Validate email matches authenticated user
    if (ta_email !== user.email) {
      return new Response(
        JSON.stringify({ error: "Email must match authenticated account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check if profile already exists (prevent duplicate creation)
    const { data: existingProfile } = await supabase
      .from("ta_profiles")
      .select("id")
      .eq("id", auth_user_id)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Profile already exists" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Create TA profile (INSERT not UPSERT)
    const { error: profileErr } = await supabase
      .from("ta_profiles")
      .insert({ id: auth_user_id, ta_name, email: ta_email });

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: profileErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Create first class using verified user ID
    const { data: tokenData, error: tokenErr } = await supabase.rpc("generate_class_token");
    if (tokenErr || !tokenData) {
      throw tokenErr || new Error("Failed to generate class link token.");
    }

    const { data: classData, error: classErr } = await supabase
      .from("classes")
      .insert({
        ta_id: auth_user_id,  // ← Uses verified JWT user.id
        name: course,
        sir_name: sir_name || null,
        class_link_token: tokenData as string,
      })
      .select()
      .single();

    if (classErr) {
      return new Response(
        JSON.stringify({ error: classErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, class_id: classData.id, class_link_token: tokenData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});