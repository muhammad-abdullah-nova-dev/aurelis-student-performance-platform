// ============================================================
//  AURELIS — Supabase Edge Function
//  File: supabase/functions/send-marks-email/index.ts
//
//  Deploy:
//  supabase functions deploy send-marks-email
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      student_name, student_email, ta_name, sir_name,
      course, category, marks, total, remarks, is_reminder
    } = await req.json();

    if (!student_email) {
      return new Response(JSON.stringify({ error: "No email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const percentage = marks !== null ? ((marks / total) * 100).toFixed(1) : null;
    const grade = percentage !== null ? getGrade(parseFloat(percentage)) : '—';

    // ── Email HTML ──
    const isReminder = is_reminder === true;
    const subject = isReminder
      ? `⚠️ Missing Marks: ${category} — ${course}`
      : `📊 Your ${category} Marks — ${course}`;

    const bodyHtml = isReminder ? reminderEmail(student_name, ta_name, sir_name, course, category, total)
                                : marksEmail(student_name, ta_name, sir_name, course, category, marks, total, percentage, grade, remarks);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    `Aurelis <noreply@your-domain.com>`,
        to:      [student_email],
        subject,
        html:    bodyHtml,
      }),
    });

    if (!resendRes.ok) throw new Error(await resendRes.text());

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// ── Grade helper ──
function getGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

// ── Marks Email Template ──
function marksEmail(name: string, ta: string, sir: string, course: string,
  category: string, marks: number, total: number, pct: string, grade: string, remarks: string) {
  const passColor  = '#2E6B45';
  const failColor  = '#C63D2F';
  const scoreColor = parseFloat(pct) >= 60 ? passColor : failColor;
  const gradeBg    = parseFloat(pct) >= 60 ? 'rgba(46,107,69,0.10)' : 'rgba(198,61,47,0.10)';
  const gradeBorder= parseFloat(pct) >= 60 ? 'rgba(46,107,69,0.30)' : 'rgba(198,61,47,0.30)';
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Marks — ${course}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;background:#F7F1E8;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  .wrap{max-width:600px;margin:40px auto;background:#FDFAF5;border-radius:14px;overflow:hidden;border:1px solid #DDD4C0;box-shadow:0 8px 32px rgba(30,26,23,0.12), 0 4px 12px rgba(30,26,23,0.07)}
  .accent-bar{height:5px;background:linear-gradient(90deg, #C63D2F, #3E7A54, #D9A441)}
  .head{background:linear-gradient(135deg, #1E1A17 0%, #2A2320 100%);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(253,250,245,0.1)}
  .head .logo{font-size:1.5rem;font-weight:800;color:#FDFAF5;letter-spacing:-0.5px;margin-bottom:8px}
  .head .logo span{background:linear-gradient(135deg, #C63D2F, #A83127);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .head .tagline{color:rgba(253,250,245,0.75);margin:0;font-size:0.875rem;letter-spacing:0.05em;font-weight:600;text-transform:uppercase}
  .body{padding:36px 40px}
  .greeting{font-size:1rem;color:#1E1A17;margin-bottom:24px;line-height:1.7;font-weight:500}
  .greeting strong{font-weight:700;color:#1E1A17}
  .score-box{background:linear-gradient(135deg, #F7F1E8 0%, #EFE6D4 100%);border:1px solid #DDD4C0;border-radius:12px;padding:28px 24px;text-align:center;margin:24px 0;box-shadow:0 2px 8px rgba(30,26,23,0.06)}
  .score-category{font-size:0.7rem;text-transform:uppercase;letter-spacing:2.5px;color:#7A6E64;font-weight:800;margin-bottom:16px}
  .score-num{font-size:3.5rem;font-weight:900;color:${scoreColor};line-height:1;letter-spacing:-0.03em;margin:8px 0}
  .score-out{font-size:0.95rem;color:#7A6E64;margin-top:6px;font-weight:600}
  .score-grade{display:inline-block;background:${gradeBg};color:${scoreColor};border:2px solid ${gradeBorder};padding:6px 20px;border-radius:100px;font-weight:800;font-size:0.95rem;margin-top:14px;letter-spacing:0.8px;box-shadow:0 2px 6px rgba(30,26,23,0.08)}
  .score-pct{font-size:0.875rem;color:#B0A89E;margin-top:8px;font-weight:600}
  table.info{width:100%;border-collapse:collapse;margin:20px 0;font-size:0.9rem}
  table.info td{padding:12px 0;border-bottom:1px solid #EAE0CE;vertical-align:top}
  table.info tr:last-child td{border-bottom:none}
  table.info .lbl{color:#7A6E64;width:42%;font-weight:600;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em}
  table.info .val{color:#1E1A17;font-weight:700}
  .remarks-box{background:#FFF9EC;border:2px solid rgba(217,164,65,0.4);border-radius:10px;padding:16px 18px;margin:20px 0;font-size:0.875rem;color:#5C4400;line-height:1.7;box-shadow:0 2px 4px rgba(217,164,65,0.15)}
  .remarks-box strong{color:#4A3700;font-weight:800}
  .note{font-size:0.875rem;color:#7A6E64;margin-top:24px;line-height:1.7;padding-top:20px;border-top:1px solid #EAE0CE;font-weight:500}
  .note strong{color:#1E1A17;font-weight:700}
  .footer{text-align:center;padding:24px 20px;font-size:0.75rem;color:#B0A89E;border-top:1px solid #DDD4C0;background:linear-gradient(180deg, #F7F1E8 0%, #EFE6D4 100%);letter-spacing:0.03em;line-height:1.8}
  .footer-logo{font-weight:800;color:#4A3F36;font-size:0.8rem;margin-bottom:6px}
  .footer-logo span{color:#C63D2F}
  .footer-org{font-weight:700;color:#7A6E64;margin-bottom:4px}
  .footer-contact{margin-top:8px}
  .footer-contact a{color:#C63D2F;text-decoration:none;font-weight:600}
  .footer-contact a:hover{text-decoration:underline}
</style>
</head><body>
<div class="wrap">
  <div class="accent-bar"></div>
  <div class="head">
    <div class="logo">Aure<span>lis</span></div>
    <p class="tagline">Academic Performance Notification</p>
  </div>
  <div class="body">
    <div class="greeting">Dear <strong>${name}</strong>,<br/>Your marks for <strong>${category}</strong> in <strong>${course}</strong> have been officially recorded in your academic profile.</div>
    <div class="score-box">
      <div class="score-category">${category} &nbsp;•&nbsp; ${course}</div>
      <div class="score-num">${marks}</div>
      <div class="score-out">out of ${total}</div>
      <div><span class="score-grade">${grade}</span></div>
      <div class="score-pct">${pct}%</div>
    </div>
    <table class="info">
      <tr><td class="lbl">Course</td><td class="val">${course}</td></tr>
      <tr><td class="lbl">Assessment</td><td class="val">${category}</td></tr>
      <tr><td class="lbl">Teaching Assistant</td><td class="val">${ta}</td></tr>
      <tr><td class="lbl">Instructor</td><td class="val">${sir}</td></tr>
    </table>
    ${remarks ? `<div class="remarks-box"><strong>Instructor Notes:</strong> ${remarks}</div>` : ''}
    <div class="note">If you have any questions regarding your assessment results, please contact your Teaching Assistant <strong>${ta}</strong> or refer to your course guidelines for the grade appeal process.</div>
  </div>
  <div class="footer">
    <div class="footer-logo">Aure<span>lis</span></div>
    <div class="footer-org">Powered by Maqsad Tech</div>
    <div>Automated academic notification — Please do not reply to this email</div>
    <div class="footer-contact">
      Support: <a href="mailto:muhammed.abdullah.coder@gmail.com">muhammed.abdullah.coder@gmail.com</a> •
      <a href="https://wa.me/923226334814">WhatsApp</a>
    </div>
  </div>
</div>
</body></html>`;
}

// ── Reminder Email Template ──
function reminderEmail(name: string, ta: string, sir: string, course: string, category: string, total: number) {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Missing Marks — ${course}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;background:#F7F1E8;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  .wrap{max-width:600px;margin:40px auto;background:#FDFAF5;border-radius:14px;overflow:hidden;border:1px solid #DDD4C0;box-shadow:0 8px 32px rgba(30,26,23,0.12), 0 4px 12px rgba(30,26,23,0.07)}
  .accent-bar{height:5px;background:linear-gradient(90deg, #C63D2F, #3E7A54, #D9A441)}
  .head{background:linear-gradient(135deg, #1E1A17 0%, #2A2320 100%);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(253,250,245,0.1)}
  .head .logo{font-size:1.5rem;font-weight:800;color:#FDFAF5;letter-spacing:-0.5px;margin-bottom:8px}
  .head .logo span{background:linear-gradient(135deg, #C63D2F, #A83127);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .head .tagline{color:rgba(253,250,245,0.75);margin:0;font-size:0.875rem;letter-spacing:0.05em;font-weight:600;text-transform:uppercase}
  .body{padding:36px 40px}
  .greeting{font-size:1rem;color:#1E1A17;margin-bottom:24px;line-height:1.7;font-weight:500}
  .greeting strong{font-weight:700;color:#1E1A17}
  .warn-box{background:linear-gradient(135deg, #FFF9EC 0%, #FFF4D9 100%);border:2px solid rgba(217,164,65,0.5);border-radius:12px;padding:28px 24px;text-align:center;margin:24px 0;box-shadow:0 4px 12px rgba(217,164,65,0.2)}
  .warn-icon{font-size:2.8rem;margin-bottom:14px;line-height:1}
  .warn-box h3{color:#1E1A17;margin:0 0 10px;font-size:1.15rem;font-weight:800;letter-spacing:-0.02em}
  .warn-box p{color:#4A3F36;font-size:0.9rem;margin:0;line-height:1.7;font-weight:500}
  .warn-box p strong{font-weight:800;color:#1E1A17}
  table.info{width:100%;border-collapse:collapse;margin:20px 0;font-size:0.9rem}
  table.info td{padding:12px 0;border-bottom:1px solid #EAE0CE;vertical-align:top}
  table.info tr:last-child td{border-bottom:none}
  table.info .lbl{color:#7A6E64;width:42%;font-weight:600;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em}
  table.info .val{color:#1E1A17;font-weight:700}
  .note{font-size:0.875rem;color:#7A6E64;margin-top:24px;line-height:1.7;padding-top:20px;border-top:1px solid #EAE0CE;font-weight:500}
  .note strong{color:#1E1A17;font-weight:700}
  .footer{text-align:center;padding:24px 20px;font-size:0.75rem;color:#B0A89E;border-top:1px solid #DDD4C0;background:linear-gradient(180deg, #F7F1E8 0%, #EFE6D4 100%);letter-spacing:0.03em;line-height:1.8}
  .footer-logo{font-weight:800;color:#4A3F36;font-size:0.8rem;margin-bottom:6px}
  .footer-logo span{color:#C63D2F}
  .footer-org{font-weight:700;color:#7A6E64;margin-bottom:4px}
  .footer-contact{margin-top:8px}
  .footer-contact a{color:#C63D2F;text-decoration:none;font-weight:600}
  .footer-contact a:hover{text-decoration:underline}
</style>
</head><body>
<div class="wrap">
  <div class="accent-bar"></div>
  <div class="head">
    <div class="logo">Aure<span>lis</span></div>
    <p class="tagline">Missing Assessment Reminder</p>
  </div>
  <div class="body">
    <div class="greeting">Dear <strong>${name}</strong>,</div>
    <div class="warn-box">
      <div class="warn-icon">⚠️</div>
      <h3>Assessment Marks Pending</h3>
      <p>Your marks for <strong>${category}</strong> (out of ${total} points) have not been recorded yet for <strong>${course}</strong>.</p>
    </div>
    <table class="info">
      <tr><td class="lbl">Course</td><td class="val">${course}</td></tr>
      <tr><td class="lbl">Assessment</td><td class="val">${category}</td></tr>
      <tr><td class="lbl">Total Points</td><td class="val">${total}</td></tr>
      <tr><td class="lbl">Teaching Assistant</td><td class="val">${ta}</td></tr>
      <tr><td class="lbl">Instructor</td><td class="val">${sir}</td></tr>
    </table>
    <div class="note">Please reach out to your Teaching Assistant <strong>${ta}</strong> as soon as possible to clarify the status of your assessment submission or grading. Timely resolution is important for accurate academic records.</div>
  </div>
  <div class="footer">
    <div class="footer-logo">Aure<span>lis</span></div>
    <div class="footer-org">Powered by Maqsad Tech</div>
    <div>Automated reminder notification — Please do not reply to this email</div>
    <div class="footer-contact">
      Support: <a href="mailto:muhammed.abdullah.coder@gmail.com">muhammed.abdullah.coder@gmail.com</a> •
      <a href="https://wa.me/923226334814">WhatsApp</a>
    </div>
  </div>
</div>
</body></html>`;
}
