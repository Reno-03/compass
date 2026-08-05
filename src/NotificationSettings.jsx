// NotificationSettings.jsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, Trash2, Plus } from "lucide-react";

const NotificationSettings = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (error) setError(error.message);
    else setRecipients(data);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);

    const trimmed = newEmail.trim();
    if (!trimmed) return;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (recipients.some((r) => r.email.toLowerCase() === trimmed.toLowerCase())) {
      setError("This email is already in the list.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("notification_settings")
      .insert({ email: trimmed, is_active: true })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setRecipients((prev) => [...prev, data]);
      setNewEmail("");
    }
    setSaving(false);
  }

  async function handleRemove(id) {
    const confirmed = window.confirm("Remove this recipient from email notifications?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("notification_settings")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <main className="flex-1 p-4 lg:p-8 lg:pt-0">
      <div className="mb-6 mt-5">
        <h1 className="text-2xl font-bold text-slate-800">Email Notifications</h1>
        <p className="text-sm text-slate-500">
          Recipients listed here receive the daily digest of activities and reports due soon.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-slate-800">Recipients</p>

        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">Loading...</p>
        ) : recipients.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-slate-400">
            No recipients configured yet. Add one below.
          </p>
        ) : (
          <ul className="mb-5 space-y-2">
            {recipients.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Mail size={16} className="text-slate-400" />
                  {r.email}
                </span>
                <button
                  onClick={() => handleRemove(r.id)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Remove recipient"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@deped.gov.ph"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            <Plus size={16} />
            Add
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
};

export default NotificationSettings;