import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function handles two cases:
// 1. Initial join page load: receives { token } → returns TA & class info
// 2. Student checking marks: receives { class_token, roll_no } → returns student marks
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { token, class_token, roll_no } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // CASE 1: Initial page load - fetch TA and class info by token
    if (token && !class_token && !roll_no) {
      const { data: cls, error: clsErr } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          sir_name,
          class_link_token,
          ta_profiles!classes_ta_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq("class_link_token", token)
        .single();

      if (clsErr || !cls) {
        return new Response(
          JSON.stringify({ error: "Invalid class link" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return TA and class info for join page
      return new Response(
        JSON.stringify({
          class_id: cls.id,
          course: cls.name,
          sir_name: cls.sir_name,
          ta_name: cls.ta_profiles.name,
          avatar_url: cls.ta_profiles.avatar_url || null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CASE 2: Student checking their marks
    if (!class_token || !roll_no) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: cls, error: clsErr } = await supabase
      .from("classes")
      .select("id, marks_visible")
      .eq("class_link_token", class_token)
      .single();

    if (clsErr || !cls) {
      return new Response(
        JSON.stringify({ error: "Invalid class link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: student, error: stuErr } = await supabase
      .from("students")
      .select("id, name, status")
      .eq("class_id", cls.id)
      .eq("roll_no", roll_no)
      .single();

    if (stuErr || !student) {
      return new Response(
        JSON.stringify({ error: "No registration found for this roll number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (student.status !== "approved") {
      return new Response(
        JSON.stringify({ status: student.status, name: student.name }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cls.marks_visible) {
      return new Response(
        JSON.stringify({ status: "approved", name: student.name, marks_visible: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: marks } = await supabase
      .from("marks")
      .select("marks, total, category_id, mark_categories(name)")
      .eq("student_id", student.id);

    // For each category the student has a mark in, work out the class's
    // highest / lowest / average — never exposing any other student's name.
    const formatted = [];
    for (const m of marks || []) {
      const { data: categoryMarks } = await supabase
        .from("marks")
        .select("marks, student_id")
        .eq("category_id", m.category_id);

      const studentIds = [...new Set((categoryMarks || []).map((r: any) => r.student_id))];
      const { data: approvedStudents } = studentIds.length
        ? await supabase.from("students").select("id").in("id", studentIds).eq("status", "approved")
        : { data: [] };
      const approvedIds = new Set((approvedStudents || []).map((s: any) => s.id));

      const values = (categoryMarks || [])
        .filter((r: any) => approvedIds.has(r.student_id))
        .map((r: any) => r.marks)
        .filter((v: any) => v !== null && v !== undefined);

      const highest = values.length ? Math.max(...values) : null;
      const lowest  = values.length ? Math.min(...values) : null;
      const average = values.length ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10) / 10 : null;

      const { data: queries } = await supabase
        .from("mark_queries")
        .select("id, message, photo_urls, resolved, created_at")
        .eq("student_id", student.id)
        .eq("category_id", m.category_id)
        .order("created_at", { ascending: true });

      formatted.push({
        category_id: m.category_id,
        name:    m.mark_categories?.name || "Untitled",
        marks:   m.marks,
        total:   m.total,
        highest, lowest, average,
        queries: queries || [],
      });
    }

    return new Response(
      JSON.stringify({ status: "approved", name: student.name, student_id: student.id, marks_visible: true, marks: formatted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});