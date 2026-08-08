import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TRIGGER_SECRET = Deno.env.get("TRIGGER_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get("x-trigger-secret");
  if (authHeader !== TRIGGER_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const payload = await req.json();
  const { submission_id, name, school_id, date_submitted } = payload;

  const { data: school } = await supabase
    .from("schools")
    .select("name")
    .eq("id", school_id)
    .single();

  const recipients = await getNotificationRecipients();
  if (recipients.length === 0) {
    return new Response(JSON.stringify({ message: "No recipients configured." }), { status: 200 });
  }

  const html = buildHtml(name, school?.name || "—", date_submitted);
  const results = [];
  for (const email of recipients) {
    results.push(await sendEmail(email, html, name));
  }

  return new Response(JSON.stringify({ sent: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function getNotificationRecipients() {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("email")
    .eq("is_active", true);
  if (error) { console.error(error); return []; }
  return data.map((r) => r.email);
}

function buildHtml(reportName: string, schoolName: string, dateSubmitted: string) {
  const submittedDisplay = dateSubmitted
    ? new Date(dateSubmitted).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "today";
  return `
  <div style="background:#F4F5F7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <tr><td style="background:#B0651F;border-radius:10px 10px 0 0;padding:24px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;">📄 Report Submitted</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:24px 28px;border:1px solid #E5E7EB;border-top:none;">
        <p style="margin:0 0 6px 0;font-size:15px;color:#1A202C;font-weight:600;">${reportName}</p>
        <p style="margin:0 0 12px 0;font-size:14px;color:#4A5568;">was submitted by <strong>${schoolName}</strong>.</p>
        <p style="margin:0;font-size:13px;color:#8A94A6;">Date submitted: <strong style="color:#B0651F;">${submittedDisplay}</strong></p>
      </td></tr>
      <tr><td style="background:#FAFBFC;border-radius:0 0 10px 10px;border:1px solid #E5E7EB;border-top:none;padding:14px 28px;">
        <p style="margin:0;font-size:12px;color:#9AA5B1;">Automated notification from COMPASS.</p>
      </td></tr>
    </table>
  </div>`;
}

async function sendEmail(to: string, html: string, reportName: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "COMPASS Notifications <onboarding@resend.dev>",
      to,
      subject: `📄 Report submitted: ${reportName}`,
      html,
    }),
  });
  const data = await res.json();

  await supabase.from("email_logs").insert({
    email_type: "report_submitted",
    subject: `📄 Report submitted: ${reportName}`,
    recipient: to,
    related_name: reportName,
    status: res.ok ? "sent" : "failed",
    error_message: res.ok ? null : JSON.stringify(data),
    resend_id: data?.id || null,
  });

  return data;
}