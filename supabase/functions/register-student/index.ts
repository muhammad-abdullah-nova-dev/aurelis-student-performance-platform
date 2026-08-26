import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { class_id, ta_id, name, roll_no, email } = await req.json();

    if (!class_id || !ta_id || !name || !roll_no) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if roll number already exists in this class
    const { data: existing } = await supabase
      .from("students")
      .select("id, status")
      .eq("class_id", class_id)
      .eq("roll_no", roll_no)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: "Already registered",
          status: existing.status 
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new student
    const { data, error } = await supabase
      .from("students")
      .insert({
        ta_id,
        class_id,
        name: name.trim(),
        roll_no: roll_no.trim(),
        email: email ? email.trim() : null,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Student registration error:", error);
      return new Response(
        JSON.stringify({ error: "Registration failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, student: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
