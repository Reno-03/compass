// ReportsView.jsx
// Everything related to the "Reports" tab: the summary section that used to
// live inline in AdminDashboard, plus the Create/Edit/Maximize/Remarks
// modals it needs. It owns its own modal state — AdminDashboard just hands
// it data and three "something changed" callbacks.

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
  FrequencyBadge,
  StatCard,
  ComplianceDonut,
  OneDriveLogo,
} from "./DashboardShared";

// ============================================
// Create Report — Admin only
// ============================================
const CreateReport = ({ allSchools, onReportCreated, onClose }) => {
  const [name, setName] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [legalBasis, setLegalBasis] = useState("");
  const [status, setStatus] = useState("not_started");
  const [frequency, setFrequency] = useState("one_time");

  function toggleSchool(id) {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (name.trim() === "") {
      setError("Report name field is required.");
      return;
    }
    if (!submissionDate) {
      setError("Submission date is required.");
      return;
    }
    if (isNaN(new Date(submissionDate).getTime())) {
      setError("Submission date is invalid.");
      return;
    }
    if (selectedSchoolIds.length === 0) {
      setError("At least one school is required to be selected.");
      return;
    }

    setSubmitting(true);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        name,
        submission_date: submissionDate,
        legal_basis: legalBasis || null,
      })
      .select()
      .single();

    if (reportError) {
      setError(reportError.message);
      setSubmitting(false);
      return;
    }

    const submissionRows = selectedSchoolIds.map((schoolId) => ({
      report_id: report.id,
      school_id: schoolId,
      name: report.name,
      submission_date: report.submission_date,
      drive_link: driveLink || null,
      status: status || "not_started",
      legal_basis: report.legal_basis,
      frequency: frequency || "one_time",
    }));

    const { data: newSubmissions, error: submissionError } = await supabase
      .from("report_submissions")
      .insert(submissionRows)
      .select();

    if (submissionError) {
      setError(submissionError.message);
      setSubmitting(false);
      return;
    }

    onReportCreated(newSubmissions);
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
              Add New Report
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the details to create a new report.
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
              Report name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="e.g. Quarterly Accomplishment Report"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Submission Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition focus:ring-3 focus:ring-blue-500/20"
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
                <option value="ongoing">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
            />
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
            {submitting ? "Creating..." : "Create Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================
// Edit Report
// ============================================
const EditReport = ({ submission, onSaved, onDeleted, onClose }) => {
  const [name, setName] = useState(submission.name);
  const [submissionDate, setSubmissionDate] = useState(
    submission.submission_date || "",
  );
  const [driveLink, setDriveLink] = useState(submission.drive_link || "");
  const [status, setStatus] = useState(submission.status);
  const [legalBasis, setLegalBasis] = useState(submission.legal_basis || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dateSubmitted, setDateSubmitted] = useState(
    submission.date_submitted || "",
  );
  const [frequency, setFrequency] = useState(submission.frequency || "one_time");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?",
    );
    if (!confirmed) return;

    setSaving(true);
    const { error } = await supabase
      .from("report_submissions")
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
      setError("Report name field is required.");
      return;
    }
    if (!status) {
      setError("Status is required.");
      return;
    }
    if (!submissionDate) {
      setError("Submission date is required.");
      return;
    }
    if (isNaN(new Date(submissionDate).getTime())) {
      setError("Submission date is invalid.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("report_submissions")
      .update({
        name,
        legal_basis: legalBasis || null,
        submission_date: submissionDate,
        date_submitted: dateSubmitted || null,
        drive_link: driveLink || null,
        status,
        frequency: frequency || "one_time",
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
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Edit Report</h3>
            <p className="text-sm text-slate-500">
              Fill in the details to edit the report.
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <School size={14} />
              {submission.schoolName}
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
              Report name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                Submission Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
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
                <option value="ongoing">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
              />
            </div>
          </div>

          <div className="relative">
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 px-3 pr-10 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 translate-y-1 text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Date Submitted <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateSubmitted}
                onChange={(e) => setDateSubmitted(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  setDateSubmitted(new Date().toISOString().split("T")[0]);
                  setStatus("completed");
                }}
                disabled={!!dateSubmitted}
                className="whitespace-nowrap rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Mark as Submitted
              </button>
            </div>
            {dateSubmitted && (
              <button
                type="button"
                onClick={() => setDateSubmitted("")}
                className="mt-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
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
// Remarks modal
// ============================================
const RemarksModal = ({ submission, onClose }) => (
  <div
    className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Remarks</h3>
          <p className="text-xs text-slate-500">{submission.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 mb-6">
        {submission.remarks}
      </p>

      <button
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-transform hover:-translate-y-0.5"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

// ============================================
// Maximized (full-table) view
// ============================================
const MaximizedReportsModal = ({
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
            Reports Monitoring — {schoolName}
          </h3>
          <p className="text-s text-slate-500">
            {sorted.length} Report(s) · {filterLabel}
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
            No reports assigned yet.
          </p>
        ) : (
          <table className="w-full min-w-220 table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                <th className="pb-2 pt-2 pl-2 font-bold">Report</th>
                <th className="pb-2 pt-2 font-bold text-center">Date</th>
                <th className="pb-2 pt-2 font-bold text-center">
                  Date Submitted
                </th>
                <th className="pb-2 pt-2 font-bold text-center">Status</th>
                <th className="pb-2 pt-2 font-bold text-center">Frequency</th>
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
                    {sub.submission_date || "—"}
                  </td>
                  <td className="py-3 text-center text-slate-500">
                    {sub.date_submitted || "—"}
                  </td>
                  <td className="py-3 text-center">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="py-3 text-center">
                    <FrequencyBadge frequency={sub.frequency} />
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onEdit({ ...sub, schoolName })}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Edit report"
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
// ReportsView — the tab itself
// ============================================
export default function ReportsView({
  activeSchool,
  allSchools,
  filteredReportSubmissions,
  sortedReportSubmissions,
  reportCounts,
  filterLabel,
  onReportCreated,
  onReportEdited,
  onReportDeleted,
}) {
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [editingReportSubmission, setEditingReportSubmission] = useState(null);
  const [viewingReportRemarks, setViewingReportRemarks] = useState(null);
  const [maximizedReports, setMaximizedReports] = useState(false);

  if (!activeSchool) return null;

  return (
    <>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Reports Summary
        </h2>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={reportCounts.total}
            sublabel={filterLabel}
            color="slate"
            icon={ClipboardList}
          />
          <StatCard
            label="Completed"
            value={reportCounts.completed}
            sublabel={`${reportCounts.total ? Math.round((reportCounts.completed / reportCounts.total) * 100) : 0}%`}
            color="green"
            icon={CheckCircle2}
          />
          <StatCard
            label="In Progress"
            value={reportCounts.ongoing}
            sublabel={`${reportCounts.total ? Math.round((reportCounts.ongoing / reportCounts.total) * 100) : 0}%`}
            color="amber"
            icon={Hourglass}
          />
          <StatCard
            label="Not Started"
            value={reportCounts.not_started}
            sublabel={`${reportCounts.total ? Math.round((reportCounts.not_started / reportCounts.total) * 100) : 0}%`}
            color="red"
            icon={XCircle}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  Reports Monitoring
                </p>
                <button
                  onClick={() => setMaximizedReports(true)}
                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                  title="View full table"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{filterLabel}</p>
            </div>
            {filteredReportSubmissions.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-slate-400">
                {activeSchool.report_submissions.length === 0
                  ? "No reports assigned yet."
                  : "No reports match the selected filter."}
              </p>
            ) : (
              <div className="max-h-90 overflow-x-auto lg:overflow-y-auto rounded-lg">
                <table className="w-full min-w-170 table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[13%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                      <th className="pb-2 pt-2 pl-2 font-bold">Report</th>
                      <th className="pb-2 pt-2 font-bold text-center">Date</th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Date Submitted
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">Status</th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Frequency
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">Actions</th>
                      <th className="pb-2 pt-2 font-bold text-center">Link</th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Legal Basis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReportSubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-50">
                        <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                          <span className="block" title={sub.name}>
                            {sub.name}
                          </span>
                        </td>
                        <td className="py-3 text-center text-slate-500">
                          {sub.submission_date || "—"}
                        </td>
                        <td className="py-3 text-center text-slate-500">
                          {sub.date_submitted || "—"}
                        </td>
                        <td className="py-3 text-center">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="py-3 text-center">
                          <FrequencyBadge frequency={sub.frequency} />
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() =>
                              setEditingReportSubmission({
                                ...sub,
                                schoolName: activeSchool.name,
                              })
                            }
                            className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Edit report"
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

          <div className="space-y-6">
            <ComplianceDonut
              counts={reportCounts}
              filterLabel={filterLabel}
              category="report"
            />
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Quick Actions
              </p>
              <button
                onClick={() => setShowCreateReportModal(true)}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                + Add New Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreateReportModal && (
        <CreateReport
          allSchools={allSchools}
          onReportCreated={onReportCreated}
          onClose={() => setShowCreateReportModal(false)}
        />
      )}

      {editingReportSubmission && (
        <EditReport
          submission={editingReportSubmission}
          onSaved={onReportEdited}
          onClose={() => setEditingReportSubmission(null)}
          onDeleted={onReportDeleted}
        />
      )}

      {viewingReportRemarks && (
        <RemarksModal
          submission={viewingReportRemarks}
          onClose={() => setViewingReportRemarks(null)}
        />
      )}

      {maximizedReports && (
        <MaximizedReportsModal
          schoolName={activeSchool.name}
          sorted={sortedReportSubmissions}
          onClose={() => setMaximizedReports(false)}
          filterLabel={filterLabel}
          onEdit={setEditingReportSubmission}
        />
      )}
    </>
  );
}