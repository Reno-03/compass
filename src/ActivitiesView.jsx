// ActivitiesView.jsx
// Everything related to the "Activities" tab: the summary section that used
// to live inline in AdminDashboard, plus the Create/Edit/Maximize modals it
// needs. It owns its own modal state — AdminDashboard just hands it data
// and three "something changed" callbacks.

import { useState } from "react";
import { supabase } from "./supabaseClient";
import {
  ClipboardList,
  CheckCircle2,
  Hourglass,
  XCircle,
  Eye,
  ChevronDown,
  Maximize2,
  School,
  X,
} from "lucide-react";
import {
  StatusBadge,
  PriorityBadge,
  StatCard,
  ComplianceDonut,
  OneDriveLogo,
} from "./dashboardShared";

// ============================================
// Create Activity — Admin only
// ============================================
const CreateActivity = ({ allSchools, onActivityCreated, onClose }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [legalBasis, setLegalBasis] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("not_started");

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
    if (!startDate) {
      setError("Date is required.");
      return;
    }
    if (!status) {
      setError("Status is required.");
      return;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      setError("Date is invalid.");
      return;
    }

    const resolvedEndDate = isMultiDay ? endDate : startDate;

    if (isMultiDay) {
      if (!endDate) {
        setError("End date is required.");
        return;
      }
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        setError("End date is invalid.");
        return;
      }
      if (end < start) {
        setError("End date cannot be before the start date.");
        return;
      }
    }

    if (selectedSchoolIds.length === 0) {
      setError("At least one school is required to be selected.");
      return;
    }

    setSubmitting(true);

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        name,
        start_date: startDate,
        end_date: resolvedEndDate,
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
      start_date: activity.start_date,
      end_date: activity.end_date,
      drive_link: driveLink || null,
      status: status || "not_started",
      legal_basis: activity.legal_basis,
      priority: priority || "medium",
    }));

    const { data: newSubmissions, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionRows)
      .select();

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

          <div className={isMultiDay ? "grid grid-cols-2 gap-3" : ""}>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                {isMultiDay ? "Start Date" : "Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition focus:ring-3 focus:ring-blue-500/20"
              />
            </div>

            {isMultiDay && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition focus:ring-3 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={isMultiDay}
              onChange={(e) => {
                setIsMultiDay(e.target.checked);
                if (!e.target.checked) setEndDate("");
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            This activity runs across multiple days
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Status <span className="text-red-500">*</span>
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <option value="not_started">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Legal Basis (optional)
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
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-500">
                OneDrive Link (optional)
              </label>
              <OneDriveLogo size={16} />
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

// ============================================
// Edit Activity
// ============================================
const EditActivity = ({ submission, onSaved, onDeleted, onClose }) => {
  const [name, setName] = useState(submission.name);
  const [startDate, setStartDate] = useState(submission.start_date || "");
  const [isMultiDay, setIsMultiDay] = useState(
    !!submission.end_date && submission.end_date !== submission.start_date,
  );
  const [endDate, setEndDate] = useState(submission.end_date || "");
  const [driveLink, setDriveLink] = useState(submission.drive_link || "");
  const [status, setStatus] = useState(submission.status);
  const [legalBasis, setLegalBasis] = useState(submission.legal_basis || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [priority, setPriority] = useState(submission.priority || "medium");

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
    if (!startDate) {
      setError("Date is required.");
      return;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      setError("Date is invalid.");
      return;
    }

    const resolvedEndDate = isMultiDay ? endDate : startDate;

    if (isMultiDay) {
      if (!endDate) {
        setError("End date is required.");
        return;
      }
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        setError("End date is invalid.");
        return;
      }
      if (end < start) {
        setError("End date cannot be before the start date.");
        return;
      }
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("submissions")
      .update({
        name,
        legal_basis: legalBasis || null,
        start_date: startDate,
        end_date: resolvedEndDate,
        drive_link: driveLink || null,
        status,
        updated_at: new Date().toISOString(),
        priority: priority || "medium",
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
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Edit Activity</h3>
            <p className="text-sm text-slate-500">
              Fill in the details to edit the activity.
            </p>
            {submission.schoolName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <School size={14} />
                {submission.schoolName}
              </p>
            )}
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

          <div className={isMultiDay ? "grid grid-cols-2 gap-3" : ""}>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                {isMultiDay ? "Start Date" : "Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
            </div>

            {isMultiDay && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={isMultiDay}
              onChange={(e) => {
                setIsMultiDay(e.target.checked);
                if (!e.target.checked) setEndDate("");
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            This activity runs across multiple days
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Status <span className="text-red-500">*</span>
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <option value="not_started">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Legal Basis (optional)
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
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-500">
                OneDrive Link (optional)
              </label>
              <OneDriveLogo size={16} />
            </div>

            <input
              type="url"
              value={driveLink}
              placeholder="https://drive.google.com/..."
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-between gap-3">
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
// Maximized (full-table) view
// ============================================
const MaximizedActivitiesModal = ({
  schoolName,
  sorted,
  onEdit,
  onClose,
  filterLabel,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-8"
    onClick={onClose}
  >
    <div
      className="flex h-full w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Activities Monitoring — {schoolName}
          </h3>
          <p className="text-s text-slate-500">
            {sorted.length} activity(ies) · {filterLabel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-slate-400">
            No activities assigned yet.
          </p>
        ) : (
          <table className="w-full min-w-220 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[19%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                <th className="pb-2 pt-2 pl-2 font-bold">Activity</th>
                <th className="pb-2 pt-2 font-bold text-center">Date</th>
                <th className="pb-2 pt-2 font-bold text-center">Status</th>
                <th className="pb-2 pt-2 font-bold text-center">Priority</th>
                <th className="pb-2 pt-2 font-bold text-center">Actions</th>
                <th className="pb-2 pt-2 font-bold text-center">Link</th>
                <th className="pb-2 pt-2 font-bold text-center">Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sub) => (
                <tr key={sub.id} className="border-b border-slate-50">
                  <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                    {sub.name}
                  </td>
                  <td className="py-3 text-center text-slate-500">
                    {sub.start_date
                      ? !sub.end_date || sub.end_date === sub.start_date
                        ? sub.start_date
                        : `${sub.start_date} – ${sub.end_date}`
                      : "—"}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={sub.status} category="activity" />
                  </td>
                  <td className="py-3 text-center">
                    <PriorityBadge priority={sub.priority} />
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onEdit({ ...sub, schoolName })}
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
                        title="Open OneDrive Link"
                      >
                        <OneDriveLogo size={18} />
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
        )}
      </div>
    </div>
  </div>
);

// ============================================
// ActivitiesView — the tab itself
// ============================================
export default function ActivitiesView({
  activeSchool,
  allSchools,
  filteredSubmissions,
  sortedSubmissions,
  activeCounts,
  filterLabel,
  onActivityCreated,
  onActivityEdited,
  onActivityDeleted,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [maximizedActivities, setMaximizedActivities] = useState(false);

  if (!activeSchool) return null;

  return (
    <>
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Activity Summary
        </h2>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Activities"
            value={activeCounts.total}
            sublabel={filterLabel}
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
            label="Upcoming"
            value={activeCounts.not_started}
            sublabel={`${activeCounts.total ? Math.round((activeCounts.not_started / activeCounts.total) * 100) : 0}%`}
            color="red"
            icon={XCircle}
          />
        </div>

        <div className="space-y-6">
          {/* Activities table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  Activities Monitoring — {activeSchool.name}
                </p>
                <button
                  onClick={() => setMaximizedActivities(true)}
                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                  title="View full table"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{filterLabel}</p>
            </div>
            {filteredSubmissions.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-slate-400">
                {activeSchool.submissions.length === 0
                  ? "No activities assigned yet."
                  : "No activities match the selected filter."}
              </p>
            ) : (
              <div className="max-h-150 overflow-x-auto lg:overflow-y-auto rounded-lg">
                <table className="w-full min-w-170 table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[15%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                      <th className="pb-2 pt-2 pl-2 font-bold">Activity</th>
                      <th className="pb-2 pt-2 font-bold text-center">Date</th>
                      <th className="pb-2 pt-2 font-bold text-center">Status</th>
                      <th className="pb-2 pt-2 font-bold text-center">Priority</th>
                      <th className="pb-2 pt-2 font-bold text-center">Actions</th>
                      <th className="pb-2 pt-2 font-bold text-center">Link</th>
                      <th className="pb-2 pt-2 font-bold text-center">Legal Basis</th>
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
                          {sub.start_date
                            ? !sub.end_date || sub.end_date === sub.start_date
                              ? sub.start_date
                              : `${sub.start_date} – ${sub.end_date}`
                            : "—"}
                        </td>
                        <td className="py-3 text-center">
                          <StatusBadge status={sub.status} category="activity" />
                        </td>
                        <td className="py-3 text-center">
                          <PriorityBadge priority={sub.priority} />
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() =>
                              setEditingSubmission({
                                ...sub,
                                schoolName: activeSchool.name,
                              })
                            }
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
                              title="Open OneDrive Link"
                            >
                              <OneDriveLogo size={18} />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          className="py-3 text-center text-slate-500 truncate"
                          title={sub.legal_basis}
                        >
                          {sub.legal_basis || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 w-75 rounded-xl border border-slate-200 bg-white p-5">
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

      {showCreateModal && (
        <CreateActivity
          allSchools={allSchools}
          onActivityCreated={onActivityCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingSubmission && (
        <EditActivity
          submission={editingSubmission}
          onSaved={onActivityEdited}
          onClose={() => setEditingSubmission(null)}
          onDeleted={onActivityDeleted}
        />
      )}

      {maximizedActivities && (
        <MaximizedActivitiesModal
          schoolName={activeSchool.name}
          sorted={sortedSubmissions}
          onClose={() => setMaximizedActivities(false)}
          filterLabel={filterLabel}
          onEdit={setEditingSubmission}
        />
      )}
    </>
  );
}