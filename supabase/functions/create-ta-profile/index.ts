import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Creates a ta_profiles row + their first class right after signup — no
// teacher approval required.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { ta_name, ta_email, course, sir_name, auth_user_id } = body;

    if (!ta_name || !ta_email || !course || !auth_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1) Create/update the TA's identity profile (no course/link info here anymore —
    //    that now lives per-class).
    const { error: profileErr } = await supabase
      .from("ta_profiles")
      .upsert({ id: auth_user_id, ta_name, email: ta_email }, { onConflict: "id" });

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: profileErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Create their first class using the course/sir name from the signup form.
    const { data: tokenData, error: tokenErr } = await supabase.rpc("generate_class_token");
    if (tokenErr || !tokenData) {
      throw tokenErr || new Error("Failed to generate class link token.");
    }

    const { data: classData, error: classErr } = await supabase
      .from("classes")
      .insert({
        ta_id: auth_user_id,
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