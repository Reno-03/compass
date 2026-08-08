import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const WINDOW_DAYS = 5; // show anything due today through N days out

Deno.serve(async (req) => {
  const activities = await getUpcoming("submissions", "start_date");
  const reports = await getUpcoming("report_submissions", "submission_date");

  const totalCount = activities.length + reports.length;
  const recipients = await getNotificationRecipients();

  if (totalCount === 0) {
    return new Response(JSON.stringify({ message: `Nothing due within ${WINDOW_DAYS} days.` }), { status: 200 });
  }
  if (recipients.length === 0) {
    return new Response(JSON.stringify({ message: "No recipients configured." }), { status: 200 });
  }

  const html = buildDigestHtml(activities, reports);
  const results = [];
  for (const email of recipients) {
    results.push(await sendDigestEmail(email, html, totalCount));
  }

  return new Response(JSON.stringify({ sent: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Anything due from today through WINDOW_DAYS out, not yet completed
async function getUpcoming(table: string, dateField: string) {
  const { data, error } = await supabase
    .from(table)
    .select(`id, name, ${dateField}, status, school_id, schools ( name )`)
    .neq("status", "completed")
    .gte(dateField, todayStr())
    .lte(dateField, daysFromNow(WINDOW_DAYS));

  if (error) { console.error(`${table} query error:`, error); return []; }

  return data.map((item: any) => {
    const due = new Date(item[dateField]);
    const now = new Date(todayStr());
    const daysUntil = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { ...item, daysUntil };
  }).sort((a, b) => a.daysUntil - b.daysUntil); // most urgent first
}

async function getNotificationRecipients() {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("email")
    .eq("is_active", true);

  if (error) { console.error("Failed to fetch recipients:", error); return []; }
  return data.map((r) => r.email);
}

function urgencyLabel(days: number) {
  if (days <= 0) return { text: "Due today", color: "#D64545" };
  if (days === 1) return { text: "Due tomorrow", color: "#D64545" };
  if (days <= 2) return { text: `Due in ${days} days`, color: "#D68C00" };
  return { text: `Due in ${days} days`, color: "#4A5568" };
}

function renderTable(title: string, accentColor: string, items: any[]) {
  if (items.length === 0) {
    return `
      <tr><td style="padding:0 0 28px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
          <tr><td style="background:${accentColor};padding:12px 20px;">
            <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">${title}</span>
          </td></tr>
          <tr><td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;color:#8A94A6;font-size:13px;">Nothing due in the next ${WINDOW_DAYS} days.</td></tr>
        </table>
      </td></tr>`;
  }

  const rows = items.map((item, i) => {
    const label = urgencyLabel(item.daysUntil);
    return `
      <tr>
        <td style="padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A202C;border-top:1px solid #F1F2F4;${i === 0 ? "border-top:none;" : ""}">${item.name}</td>
        <td style="padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4A5568;border-top:1px solid #F1F2F4;${i === 0 ? "border-top:none;" : ""}">${item.schools?.name || "—"}</td>
        <td style="padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:right;white-space:nowrap;border-top:1px solid #F1F2F4;${i === 0 ? "border-top:none;" : ""}">
          <span style="color:${label.color};font-weight:600;">${label.text}</span>
        </td>
      </tr>`;
  }).join("");

  return `
    <tr><td style="padding:0 0 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
        <tr><td style="background:${accentColor};padding:12px 20px;">
          <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">${title}</span>
          <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;opacity:0.85;float:right;">${items.length} item${items.length !== 1 ? "s" : ""}</span>
        </td></tr>
        <tr><td style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr style="background:#FAFBFC;">
              <td style="padding:8px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8A94A6;text-transform:uppercase;">Name</td>
              <td style="padding:8px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8A94A6;text-transform:uppercase;">School</td>
              <td style="padding:8px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8A94A6;text-transform:uppercase;text-align:right;">Status</td>
            </tr>
            ${rows}
          </table>
        </td></tr>
      </table>
    </td></tr>`;
}

function buildDigestHtml(activities: any[], reports: any[]) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return `
  <div style="background:#F4F5F7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
      <tr><td style="background:#1F3864;border-radius:10px 10px 0 0;padding:28px 28px 24px 28px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;">COMPASS Daily Digest</span><br/>
        <span style="color:#B8C4DC;font-size:13px;">${today}</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:28px 24px 4px 24px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
        <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4A5568;">
          Everything due within the next <strong>${WINDOW_DAYS} days</strong>, sorted by urgency.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${renderTable("Activities", "#2F6F4F", activities)}
          ${renderTable("Reports", "#B0651F", reports)}
        </table>
      </td></tr>
      <tr><td style="background:#FAFBFC;border-radius:0 0 10px 10px;border:1px solid #E5E7EB;border-top:none;padding:18px 24px;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9AA5B1;">
          Automated reminder from COMPASS. Sent to configured admin recipients.
        </p>
      </td></tr>
    </table>
  </div>`;
}

async function sendDigestEmail(to: string, html: string, count: number) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "COMPASS Notifications <onboarding@resend.dev>",
      to,
      subject: `COMPASS: ${count} item(s) due within ${WINDOW_DAYS} days`,
      html,
    }),
  });
  const data = await res.json();

  await supabase.from("email_logs").insert({
    email_type: "daily_digest",
    subject: `COMPASS: ${count} item(s) due within ${WINDOW_DAYS} days`,
    recipient: to,
    related_name: "",
    status: res.ok ? "sent" : "failed",
    error_message: res.ok ? null : JSON.stringify(data),
    resend_id: data?.id || null,
  });

  return data;
}