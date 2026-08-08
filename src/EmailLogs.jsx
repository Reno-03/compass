// EmailLogs.jsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, X, CheckCircle2, XCircle } from "lucide-react";

const TYPE_LABELS = {
  daily_digest: "Daily Digest",
  activity_completed: "Activity Completed",
  report_submitted: "Report Submitted",
};

const TYPE_COLORS = {
  daily_digest: "bg-blue-50 text-blue-700 border-blue-200",
  activity_completed: "bg-green-50 text-green-700 border-green-200",
  report_submitted: "bg-amber-50 text-amber-700 border-amber-200",
};

export const EmailLogsButton = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
        title="Email Log"
      >
        <Mail size={18} />
      </button>

      {open && <EmailLogsPanel onClose={() => setOpen(false)} />}
    </div>
  );
};

const EmailLogsPanel = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setError(error.message);
    else setLogs(data);

    setLoading(false);
  }

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.email_type === filter);

  return (
    // Panel
    <div
      className="
    absolute
    top-full
    -right-28
    mt-3
    w-115
    h-125
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-xl
    z-50
  "
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Email Log</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Recent notifications sent by COMPASS
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
        {["all", "daily_digest", "activity_completed", "report_submitted"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === t
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "all" ? "All" : TYPE_LABELS[t]}
            </button>
          ),
        )}
      </div>

      {/* Scrollable Content */}
      <div className="h-98.75 overflow-y-auto px-3 py-2">
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading...</p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm italic text-slate-400">
            No email logs found.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="
              rounded-lg
              border
              border-slate-200
              bg-white
              p-3
              transition
              hover:border-blue-200
              hover:bg-slate-50
            "
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      TYPE_COLORS[log.email_type]
                    }`}
                  >
                    {TYPE_LABELS[log.email_type]}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    {log.status === "sent" ? (
                      <CheckCircle2 size={14} className="text-green-600" />
                    ) : (
                      <XCircle size={14} className="text-red-600" />
                    )}

                    {new Date(log.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h4 className="text-sm font-semibold leading-5 text-slate-800">
                  {log.subject}
                </h4>

                <p className="mt-1 truncate text-xs text-slate-500">
                  To: {log.recipient}
                  {log.school_name && ` · ${log.school_name}`}
                </p>

                {log.status === "failed" && log.error_message && (
                  <p className="mt-2 text-xs text-red-600">
                    {log.error_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
