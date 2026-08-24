import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Read-only, no-login dashboard for the actual teacher (Sir). Given a
// teacher_view_token, returns a per-quiz/assignment breakdown — average,
// highest, lowest, top 5, bottom 5, and the full class list for each one.
// Nothing here lets the teacher edit anything.
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cls, error: clsErr } = await supabase
      .from("classes")
      .select("id, name, sir_name, ta_profiles(ta_name)")
      .eq("teacher_view_token", token)
      .single();

    if (clsErr || !cls) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: students } = await supabase
      .from("students")
      .select("id, name, roll_no")
      .eq("class_id", cls.id)
      .eq("status", "approved");

    const studentById: Record<string, any> = {};
    (students || []).forEach((s: any) => { studentById[s.id] = s; });

    const { data: categories } = await supabase
      .from("mark_categories")
      .select("id, name, total")
      .eq("class_id", cls.id)
      .order("created_at", { ascending: true });

    const categoryIds = (categories || []).map((c: any) => c.id);
    const { data: allMarks } = categoryIds.length
      ? await supabase.from("marks").select("student_id, category_id, marks").in("category_id", categoryIds)
      : { data: [] };

    // ── Build a per-quiz/assignment breakdown ──
    const quizzes = (categories || []).map((cat: any) => {
      const entries = (allMarks || [])
        .filter((m: any) => m.category_id === cat.id && m.marks !== null && m.marks !== undefined && studentById[m.student_id])
        .map((m: any) => ({
          name: studentById[m.student_id].name,
          roll_no: studentById[m.student_id].roll_no,
          marks: m.marks,
        }))
        .sort((a: any, b: any) => b.marks - a.marks);

      const values = entries.map((e: any) => e.marks);
      const average = values.length ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10) / 10 : null;
      const highest = values.length ? Math.max(...values) : null;
      const lowest  = values.length ? Math.min(...values) : null;

      const aboveCount = average !== null ? entries.filter((e: any) => e.marks >= average).length : 0;
      const belowCount = average !== null ? entries.filter((e: any) => e.marks < average).length : 0;
      const abovePct = entries.length ? Math.round((aboveCount / entries.length) * 100) : 0;
      const belowPct = entries.length ? Math.round((belowCount / entries.length) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        total: cat.total,
        average, highest, lowest,
        above_avg_pct: abovePct,
        below_avg_pct: belowPct,
        graded_count: entries.length,
        top5: entries.slice(0, 5),
        bottom5: entries.slice(-5).reverse(),
        all: entries,
      };
    });

    // Overall summary (average % across everything, for the top banner)
    const perStudentPct: Record<string, number[]> = {};
    (allMarks || []).forEach((m: any) => {
      if (m.marks === null || m.marks === undefined) return;
      const cat = (categories || []).find((c: any) => c.id === m.category_id);
      if (!cat) return;
      if (!perStudentPct[m.student_id]) perStudentPct[m.student_id] = [];
      perStudentPct[m.student_id].push((m.marks / cat.total) * 100);
    });
    const overallAverages = Object.values(perStudentPct).map((arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
    const classAverage = overallAverages.length
      ? Math.round((overallAverages.reduce((a, b) => a + b, 0) / overallAverages.length) * 10) / 10
      : null;

    return new Response(
      JSON.stringify({
        class_name: cls.name,
        sir_name:   cls.sir_name,
        ta_name:    cls.ta_profiles?.ta_name,
        total_students: (students || []).length,
        graded_students: Object.keys(perStudentPct).length,
        class_average: classAverage,
        quizzes,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});