import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by login.html ONLY when Step 2 of signup (create-ta-profile) fails
// right after Step 1 (auth.signUp) already succeeded. Deletes the just-created
// auth user so the person can retry signup with the same email instead of
// getting stuck on "User already registered" forever.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { auth_user_id } = await req.json();
    if (!auth_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing auth_user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Safety check: only delete if this user has NO ta_profiles row —
    // never delete a real, fully-created account.
    const { data: profile } = await supabase
      .from("ta_profiles")
      .select("id")
      .eq("id", auth_user_id)
      .maybeSingle();

    if (profile) {
      return new Response(
        JSON.stringify({ error: "Refusing to delete — profile already exists." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase.auth.admin.deleteUser(auth_user_id);
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});