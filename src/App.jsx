// App.jsx — Tailwind-styled to match DepEd COMPASS reference

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ClipboardList,
  CheckCircle2,
  Hourglass,
  XCircle,
  Eye,
  ChevronDown,
  LogOut,
  School,
} from "lucide-react";

// ============================================
// Shared style tokens
// ============================================
const STATUS_STYLES = {
  completed: "bg-green-50 text-green-700 border-green-200",
  ongoing: "bg-amber-50 text-amber-700 border-amber-200",
  not_started: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_LABEL = {
  completed: "Completed",
  ongoing: "Ongoing",
  not_started: "Not Started",
};
const DONUT_COLORS = {
  completed: "#16A34A",
  ongoing: "#D97706",
  not_started: "#DC2626",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.not_started}`}
  >
    {STATUS_LABEL[status] || status}
  </span>
);

// ============================================
// Compliance calc
// ============================================
const complianceCalculator = (school) => {
  if (!school.submissions || school.submissions.length === 0) return 0;
  const completed = school.submissions.filter((s) => s.status === "completed");
  return Math.round((completed.length / school.submissions.length) * 100);
};

const countByStatus = (submissions) => ({
  total: submissions.length,
  completed: submissions.filter((s) => s.status === "completed").length,
  ongoing: submissions.filter((s) => s.status === "ongoing").length,
  not_started: submissions.filter((s) => s.status === "not_started").length,
});

// ============================================
// Stat card
// ============================================
const StatCard = ({ label, value, sublabel, color, icon: Icon }) => {
  const palette = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[color];

  const iconBg = {
    slate: "bg-slate-200 text-slate-600",
    green: "bg-green-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
  }[color];

  return (
    <div className={`flex items-start gap-5 rounded-xl border p-4 ${palette}`}>
      {Icon && (
        <div
          className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon size={38} />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {label}
        </p>
        <p className="mt-1 text-4xl font-bold">{value}</p>
        {sublabel && <p className="text-xs opacity-70">{sublabel}</p>}
      </div>
    </div>
  );
};

// ============================================
// Compliance donut
// ============================================
const ComplianceDonut = ({ counts }) => {
  const data = [
    { name: "Completed", value: counts.completed, key: "completed" },
    { name: "Ongoing", value: counts.ongoing, key: "ongoing" },
    { name: "Not Started", value: counts.not_started, key: "not_started" },
  ].filter((d) => d.value > 0);

  const pct = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-3 text-sm font-semibold text-slate-800">
        Compliance Overview
      </p>
      <div className="flex items-center gap-4">
        <div className="relative h-40 w-40 shrink-0">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.key} fill={DONUT_COLORS[d.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-8 border-slate-100 text-xs text-slate-400">
              No data
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{pct}%</span>
            <span className="text-[10px] text-slate-500">Overall</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <LegendRow
            color={DONUT_COLORS.completed}
            label="Completed"
            value={counts.completed}
          />
          <LegendRow
            color={DONUT_COLORS.ongoing}
            label="Ongoing"
            value={counts.ongoing}
          />
          <LegendRow
            color={DONUT_COLORS.not_started}
            label="Not Started"
            value={counts.not_started}
          />
        </div>
      </div>
    </div>
  );
};

const LegendRow = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);

// ============================================
// Sidebar (mostly static for now — one working page)
// ============================================
const Sidebar = () => {
  const navItems = [
    { label: "Dashboard", active: true },
    { label: "Monitor Accomplishments" },
    { label: "Consolidated Reports" },
    { label: "Analytics" },
    { label: "Send Reminders" },
    { label: "Download Reports" },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#0b1c39] px-4 py-6 text-white">
      <div className="mb-8 flex items-center gap-5 px-1">
        <img
          src="/images/DEPED_logo.png"
          alt="DEPED Logo"
          className="h-12 w-12"
        />
        <img
          src="/images/DEPED_torch_logo.png"
          alt="DEPED Logo"
          className="h-10"
        />
      </div>

      <div className="mb-8 text-lg font-semibold leading-tight">
        <img
          src="/images/COMPASS_banner_dark.webp"
          alt="COMPASS Banner"
          className="mb-2 w-full pr-5 rounded-lg"
        />
        <div className="text-[11px] font-normal text-white/60">
          Centralized Online Monitoring of Programs, Activities, and School
          Submissions
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg px-3 py-2 text-sm ${
              item.active
                ? "bg-blue-600 font-semibold text-white"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
};

// ============================================
// Create Activity — Admin only
// ============================================
const CreateActivity = ({ allSchools, onActivityCreated, onClose }) => {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [legalBasis, setLegalBasis] = useState("");

  function toggleSchool(id) {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (name.trim() === "") {
      setError("Activity name field is required.");
      return;
    }

    if (!dueDate) {
      setError("Date is required.");
      return;
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dueDate);

      if (isNaN(selectedDate.getTime())) {
        setError("Date is invalid.");
        return;
      }

      if (selectedDate < today) {
        setError("Date cannot be in the past.");
        return;
      }

      if (selectedSchoolIds.length === 0) {
        setError("At least one school is required to be selected.");
        return;
      }
    }
    setSubmitting(true);

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        name,
        due_date: dueDate || null,
        legal_basis: legalBasis || null,
      })
      .select()
      .single();

    if (activityError) {
      setError(activityError.message);
      setSubmitting(false);
      return;
    }

    const submissionRows = selectedSchoolIds.map((schoolId) => ({
      activity_id: activity.id,
      school_id: schoolId,
      name: activity.name,
      due_date: activity.due_date,
      drive_link: driveLink || null,
      status: "not_started",
      legal_basis: activity.legal_basis,
    }));

    const { data: newSubmissions, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionRows)
      .select(); // no more nested activities(*) needed

    if (submissionError) {
      setError(submissionError.message);
      setSubmitting(false);
      return;
    }

    onActivityCreated(newSubmissions);
    setSubmitting(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              Add New Activity
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the details to create a new activity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer mr-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Activity name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="e.g. Nutrition Month Celebration"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Legal Basis
            </label>
            <textarea
              value={legalBasis}
              onChange={(e) => setLegalBasis(e.target.value)}
              rows={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="e.g. DepEd Order No. 12, s. 2024"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition focus:ring-3 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-500">
                Google Drive Link (optional)
              </label>
              <GoogleDriveLogo size={16} />
            </div>

            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Assign to schools <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1.5">
              {allSchools.map((school) => (
                <label
                  key={school.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedSchoolIds.includes(school.id)}
                    onChange={() => toggleSchool(school.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  {school.name}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            {submitting ? "Creating..." : "Create Activity"}
          </button>
        </form>
      </div>
    </div>
  );
};

const EditActivity = ({ submission, onSaved, onDeleted, onClose }) => {
  const [name, setName] = useState(submission.name);
  const [dueDate, setDueDate] = useState(submission.due_date || "");
  const [driveLink, setDriveLink] = useState(submission.drive_link || "");
  const [status, setStatus] = useState(submission.status);
  const [legalBasis, setLegalBasis] = useState(submission.legal_basis || "");
  const [dateConducted, setDateConducted] = useState(
    submission.date_conducted || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?",
    );

    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", submission.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    onDeleted(submission.id);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (name.trim() === "") {
      setError("Activity name field is required.");
      return;
    }

    if (!status) {
      setError("Status is required.");
      return;
    }

    if (!dueDate) {
      setError("Date is required.");
      return;
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dueDate);

      if (isNaN(selectedDate.getTime())) {
        setError("Date is invalid.");
        return;
      }

      if (selectedDate < today) {
        setError("Date cannot be in the past.");
        return;
      }
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("submissions")
      .update({
        name,
        legal_basis: legalBasis || null,  
        due_date: dueDate || null,
        drive_link: driveLink || null,
        status,
        date_conducted: dateConducted || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    onSaved(data);
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Edit Activity</h3>
            <p className="text-sm text-slate-500">
              Fill in the details to edit the activity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer mr-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Activity name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Legal Basis
            </label>
            <textarea
              value={legalBasis}
              onChange={(e) => setLegalBasis(e.target.value)}
              rows={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              placeholder="e.g. DepEd Order No. 12, s. 2024"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Status <span className="text-red-500">*</span>
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <option value="not_started">Not Started</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-500">
                Google Drive Link (optional)
              </label>
              <GoogleDriveLogo size={16} />
            </div>

            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Date conducted (optional)
            </label>
            <input
              type="date"
              value={dateConducted}
              onChange={(e) => setDateConducted(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
            >
              Delete
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// Login
// ============================================
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) setError(error.message);
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e3f1ff] p-6">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
        {/* Left panel */}

        <div className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-[#050f22] via-[#0b1c39] to-[#1e3a6e] p-12 text-white md:flex">
          <div className="mb-6">
            <div className="mb-8 flex items-center gap-4">
              <img
                src="/images/DEPED_logo.png"
                alt="DEPED Logo"
                className="h-12 w-12"
              />
              <img
                src="/images/DEPED_torch_logo.png"
                alt="DEPED Logo"
                className="h-10"
              />
              <img
                src="/images/COMPASS_banner_dark.webp"
                alt="COMPASS Banner"
                className="h-10 ml-4"
              />
            </div>

            <h1 className="mb-8 text-4xl font-extrabold leading-tight">
              Monitor compliance,
              <br />
              track progress,
              <br />
              stay accountable.
            </h1>

            <div className="space-y-4">
              <ChecklistItem
                title="Track every activity"
                description="See what's due, ongoing, or completed across all schools in one view."
              />
              <ChecklistItem
                title="Stay on top of deadlines"
                description="Monitor due dates and compliance rates at a glance."
              />
              <ChecklistItem
                title="Streamline reporting"
                description="Consolidate school submissions without the back-and-forth."
              />
            </div>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} COMPASS
          </p>
        </div>

        {/* Right panel */}
        <div className="flex w-full flex-col justify-center bg-white p-10 md:w-1/2 md:p-14">
          <h2 className="mb-2 text-3xl font-bold text-slate-800">
            Welcome back
          </h2>
          <p className="mb-8 text-sm text-slate-500">
            Sign in to your COMPASS account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@deped.gov.ph"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-xs text-slate-400">
            Access is limited to authorized DepEd personnel.
          </p>
        </div>
      </div>
    </div>
  );
};

const ChecklistItem = ({ title, description }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
      <CheckCircle2 size={14} className="text-white" />
    </span>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  </div>
);

const LogoutButton = () => {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error.message);
  }
  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2  rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
    >
      <LogOut size={16} />
      <span>Log Out</span>
    </button>
  );
};

function GoogleDriveLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={(size * 100) / 112}
      viewBox="0 0 112 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M8.46154 85.7051L13.3974 94.2308C14.4231 96.0256 15.8974 97.4359 17.6282 98.4615L35.2564 67.9487H0C0 69.9359 0.512821 71.9231 1.53846 73.7179L8.46154 85.7051Z"
          fill="#0066DA"
        />
        <path
          d="M55.9615 32.0513L38.3333 1.53846C36.6026 2.5641 35.1282 3.97436 34.1026 5.76923L1.53846 62.1795C0.531683 63.9357 0.00134047 65.9244 0 67.9487H35.2564L55.9615 32.0513Z"
          fill="#00AC47"
        />
        <path
          d="M94.2949 98.4615C96.0256 97.4359 97.5 96.0256 98.5256 94.2308L100.577 90.7051L110.385 73.7179C111.41 71.9231 111.923 69.9359 111.923 67.9487H76.6641L84.1667 82.6923L94.2949 98.4615Z"
          fill="#EA4335"
        />
        <path
          d="M55.9615 32.0513L73.5898 1.53846C71.859 0.512821 69.8718 0 67.8205 0H44.1026C42.0513 0 40.0641 0.576923 38.3333 1.53846L55.9615 32.0513Z"
          fill="#00832D"
        />
        <path
          d="M76.6667 67.9487H35.2564L17.6282 98.4615C19.359 99.4872 21.3462 100 23.3974 100H88.5256C90.5769 100 92.5641 99.4231 94.2949 98.4615L76.6667 67.9487Z"
          fill="#2684FC"
        />
        <path
          d="M94.1026 33.9744L77.8205 5.76923C76.7949 3.97436 75.3205 2.5641 73.5897 1.53846L55.9615 32.0513L76.6667 67.9487H111.859C111.859 65.9615 111.346 63.9744 110.321 62.1795L94.1026 33.9744Z"
          fill="#FFBA00"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="111.923" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

// ============================================
// Admin Dashboard
// ============================================
const AdminDashboard = ({ profile }) => {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const today = new Date();
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1); // 1-12, or "all"
  const [filterYear, setFilterYear] = useState(today.getFullYear()); // number, or "all"

  useEffect(() => {
    async function loadSchools() {
      const { data, error } = await supabase
        .from("schools")
        .select("*, submissions(*)")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setSchoolData(data);
        if (data.length > 0) setActiveSchoolId(data[0].id);
      }
      setLoading(false);
    }
    loadSchools();
  }, []);

  function handleActivityCreated(newSubmissions) {
    setSchoolData((prev) =>
      prev.map((school) => {
        const match = newSubmissions.find((s) => s.school_id === school.id);
        if (!match) return school;
        return { ...school, submissions: [...school.submissions, match] };
      }),
    );
  }

  function handleActivityEdited(updatedSubmission) {
    setSchoolData((prev) =>
      prev.map((school) => ({
        ...school,
        submissions: school.submissions.map((sub) =>
          sub.id === updatedSubmission.id ? updatedSubmission : sub,
        ),
      })),
    );
  }

  function handleActivityDeleted(id) {
    setSchoolData((prev) =>
      prev.map((school) => ({
        ...school,
        submissions: school.submissions.filter((sub) => sub.id !== id),
      })),
    );
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Error: {error}
      </div>
    );

  const activeSchool = schoolData.find((s) => s.id === activeSchoolId);
  const allSubmissions = schoolData.flatMap((s) => s.submissions);
  const overallCounts = countByStatus(allSubmissions);
  const activeCounts = activeSchool
    ? countByStatus(activeSchool.submissions)
    : countByStatus([]);

  const statusOrder = {
    not_started: 0,
    ongoing: 1,
    completed: 2,
  };

  // adds filtering + available years before the sort
  const filteredSubmissions = activeSchool.submissions.filter((sub) => {
    if (filterMonth === "all" && filterYear === "all") return true;
    if (!sub.due_date) return false;

    const dueDate = new Date(sub.due_date);
    const matchesMonth =
      filterMonth === "all" || dueDate.getMonth() + 1 === filterMonth;
    const matchesYear =
      filterYear === "all" || dueDate.getFullYear() === filterYear;

    return matchesMonth && matchesYear;
  });

  const availableYears = [
    ...new Set(
      allSubmissions
        .filter((s) => s.due_date)
        .map((s) => new Date(s.due_date).getFullYear()),
    ),
  ];
  if (!availableYears.includes(today.getFullYear())) {
    availableYears.push(today.getFullYear());
  }
  availableYears.sort((a, b) => b - a);

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });
  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <div className="flex flex-col">
        <Sidebar />
        <div className="mt-0 bg-[#0b1c39] px-4 pb-77 pt-0 text-white">
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-white/50">
            Monthly Progress (All Schools)
          </p>
          <ComplianceMiniDonut counts={overallCounts} />
        </div>
      </div>

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500">
              Monitor accomplishments of central schools, generate reports, and
              track compliance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(filterMonth !== "all" || filterYear !== "all") && (
              <button
                onClick={() => {
                  setFilterMonth("all");
                  setFilterYear("all");
                }}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
            <select
              value={filterMonth}
              onChange={(e) =>
                setFilterMonth(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Months</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) =>
                setFilterYear(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <span className="text-sm text-slate-600">
              Welcome, {profile.full_name || "PDO"}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* School tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {schoolData.map((school) => (
            <button
              key={school.id}
              onClick={() => setActiveSchoolId(school.id)}
              className={`inline-flex gap-3 items-center whitespace-nowrap rounded-lg px-10 py-3 text-sm font-semibold cursor-pointer ${
                activeSchoolId === school.id
                  ? "bg-[#0b1c39] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>
                <School size={24} />
              </span>
              {school.name}
            </button>
          ))}
        </div>

        {activeSchool && (
          <>
            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label="Total Activities"
                value={activeCounts.total}
                sublabel="This month"
                color="slate"
                icon={ClipboardList}
              />
              <StatCard
                label="Completed"
                value={activeCounts.completed}
                sublabel={`${activeCounts.total ? Math.round((activeCounts.completed / activeCounts.total) * 100) : 0}%`}
                color="green"
                icon={CheckCircle2}
              />
              <StatCard
                label="Ongoing"
                value={activeCounts.ongoing}
                sublabel={`${activeCounts.total ? Math.round((activeCounts.ongoing / activeCounts.total) * 100) : 0}%`}
                color="amber"
                icon={Hourglass}
              />
              <StatCard
                label="Not Started"
                value={activeCounts.not_started}
                sublabel={`${activeCounts.total ? Math.round((activeCounts.not_started / activeCounts.total) * 100) : 0}%`}
                color="red"
                icon={XCircle}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Activities table */}
              {/* Activities table */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <p className="mb-4 text-sm font-semibold text-slate-800">
                  Activities Monitoring — {activeSchool.name}
                </p>
                {filteredSubmissions.length === 0 ? (
                  <p className="py-8 text-center text-sm italic text-slate-400">
                    {activeSchool.submissions.length === 0
                      ? "No activities assigned yet."
                      : "No activities match the selected filter."}
                  </p>
                ) : (
                  <div className="max-h-90 overflow-y-auto rounded-lg">
                    <table className="w-full table-fixed text-left text-sm">
                      <colgroup>
                        <col className="w-[32%]" />
                        <col className="w-[15%]" />
                        <col className="w-[18%]" />
                        <col className="w-[8%]" />
                        <col className="w-[8%]" />
                        <col className="w-[20%]" />
                      </colgroup>
                      <thead className="sticky top-0 z-10 bg-slate-50">
                        <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                          <th className="pb-2 pt-2 pl-2 font-bold">Activity</th>
                          <th className="pb-2 pt-2 font-bold text-center">
                            Date
                          </th>
                          <th className="pb-2 pt-2 font-bold text-center">
                            Status
                          </th>
                          <th className="pb-2 pt-2 font-bold text-center">
                            Actions
                          </th>
                          <th className="pb-2 pt-2 font-bold text-center">
                            Link
                          </th>
                          <th className="pb-2 pt-2 font-bold text-center">
                            Legal Basis
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSubmissions.map((sub) => (
                          <tr key={sub.id} className="border-b border-slate-50">
                            <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                              <span className="block" title={sub.name}>
                                {sub.name}
                              </span>
                            </td>
                            <td className="py-3 text-center text-slate-500">
                              {sub.due_date || "—"}
                            </td>
                            <td className="py-3 text-center">
                              <StatusBadge status={sub.status} />
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => setEditingSubmission(sub)}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Edit activity"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                            <td className="py-3 text-center">
                              {sub.drive_link ? (
                                <a
                                  href={sub.drive_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex justify-center text-blue-600 hover:text-blue-800"
                                  title="Open Google Drive Link"
                                >
                                  <GoogleDriveLogo size={18} />
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3 text-center text-slate-500">
                              {sub.legal_basis || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <ComplianceDonut counts={activeCounts} />

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Quick Actions
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition-transform hover:-translate-y-0.5"
                  >
                    + Add New Activity
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Create Activity Modal */}
        {showCreateModal && (
          <CreateActivity
            allSchools={schoolData}
            onActivityCreated={handleActivityCreated}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {/* Edit Activity Modal */}
        {editingSubmission && (
          <EditActivity
            submission={editingSubmission}
            onSaved={handleActivityEdited}
            onClose={() => setEditingSubmission(null)}
            onDeleted={handleActivityDeleted}
          />
        )}
      </main>
    </div>
  );
};

const ComplianceMiniDonut = ({ counts }) => {
  const data = [
    { name: "Completed", value: counts.completed, key: "completed" },
    { name: "Ongoing", value: counts.ongoing, key: "ongoing" },
    { name: "Not Started", value: counts.not_started, key: "not_started" },
  ].filter((d) => d.value > 0);
  const pct = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-20 shrink-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={24}
                outerRadius={38}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={DONUT_COLORS[d.key]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white/10 text-[10px] text-white/40">
            No data
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold">
          {pct}%
        </div>
      </div>
      <div className="space-y-1 text-[11px] text-white/70">
        <p>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
          Completed {counts.completed}
        </p>
        <p>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
          Ongoing {counts.ongoing}
        </p>
        <p>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
          Not Started {counts.not_started}
        </p>
      </div>
    </div>
  );
};

// ============================================
// School Head Dashboard
// ============================================
const SchoolHeadDashboard = ({ profile }) => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*, activities(*)")
        .eq("school_id", profile.school_id)
        .order("updated_at", { ascending: false });

      if (error) setError(error.message);
      else setSubmissions(data);
      setLoading(false);
    }
    loadSubmissions();
  }, [profile.school_id]);

  function handleSubmissionUpdated(updated) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
    );
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Error: {error}
      </div>
    );

  const counts = countByStatus(submissions);

  return (
    <div className="min-h-screen bg-[#f4f6fb] p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My School's Activities
          </h1>
          <p className="text-sm text-slate-500">
            Update your compliance status and remarks.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total"
          value={counts.total}
          color="slate"
          icon={ClipboardList}
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          color="green"
          icon={CheckCircle2}
        />
        <StatCard
          label="Ongoing"
          value={counts.ongoing}
          color="amber"
          icon={Hourglass}
        />
        <StatCard
          label="Not Started"
          value={counts.not_started}
          color="red"
          icon={XCircle}
        />
      </div>

      {submissions.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm italic text-slate-400">
          No activities assigned yet.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionEditRow
              key={submission.id}
              submission={submission}
              onUpdated={handleSubmissionUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SubmissionEditRow = ({ submission, onUpdated }) => {
  const [status, setStatus] = useState(submission.status);
  const [remarks, setRemarks] = useState(submission.remarks || "");
  const [dateConducted, setDateConducted] = useState(
    submission.date_conducted || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("submissions")
      .update({
        status,
        remarks,
        date_conducted: dateConducted || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id)
      .select("*, activities(*)")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    onUpdated(data);
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">{submission.name}</p>
          {submission.due_date && (
            <p className="text-xs text-slate-500">Due {submission.due_date}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="not_started">Not Started</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Date conducted
          </label>
          <input
            type="date"
            value={dateConducted}
            onChange={(e) => setDateConducted(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-semibold text-slate-500">
          Remarks
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

// ============================================
// App root
// ============================================
function App() {
  const { session, profile, loading } = useAuth();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  if (!session) return <LoginPage />;
  if (!profile)
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Setting up your account...
      </div>
    );

  return profile.role === "admin" ? (
    <AdminDashboard profile={profile} />
  ) : (
    <SchoolHeadDashboard profile={profile} />
  );
}

export default App;
