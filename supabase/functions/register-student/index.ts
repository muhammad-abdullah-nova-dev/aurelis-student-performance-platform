import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { class_id, ta_id, name, roll_no, email, password } = await req.json();

    if (!class_id || !ta_id || !name || !roll_no || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (name, roll_no, email, password required)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
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

    // Create auth user for student
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name.trim(),
        roll_no: roll_no.trim(),
        role: 'student'
      }
    });

    if (authError || !authData.user) {
      console.error("Auth user creation error:", authError);
      return new Response(
        JSON.stringify({ error: authError?.message || "Failed to create student account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new student linked to auth user
    const { data, error } = await supabase
      .from("students")
      .insert({
        auth_user_id: authData.user.id,
        ta_id,
        class_id,
        name: name.trim(),
        roll_no: roll_no.trim(),
        email: email.trim(),
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Student registration error:", error);
      // Cleanup: delete auth user if student insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Registration failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        student: data,
        message: "Account created! You can now login with your email and password."
      }),
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
