// ConsolidatedReports.jsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { StatusBadge, OneDriveLogo } from "./App";
import { ChevronDown, Eye, School, MessageSquareText } from "lucide-react";

// ============================================
// School year validation — accepts "2025" or "2025-2026"
// ============================================
function validateSchoolYear(value) {
  const trimmed = value.trim();
  const singleYear = /^\d{4}$/;
  const yearRange = /^(\d{4})-(\d{4})$/;

  if (singleYear.test(trimmed)) {
    return { valid: true, value: trimmed };
  }

  const match = trimmed.match(yearRange);
  if (match) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (end !== start + 1) {
      return {
        valid: false,
        error: "School year range must be consecutive, e.g. 2025-2026.",
      };
    }
    return { valid: true, value: trimmed };
  }

  return {
    valid: false,
    error: "School year must be like 2025 or 2025-2026.",
  };
}

// ============================================
// Create Consolidated Report — fans out to selected schools
// ============================================
const CreateConsolidatedReport = ({ allSchools, onCreated, onClose }) => {
  const [name, setName] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [driveLink, setDriveLink] = useState("");
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
      setError("Report name is required.");
      return;
    }
    const schoolYearCheck = validateSchoolYear(schoolYear);
    if (!schoolYearCheck.valid) {
      setError(schoolYearCheck.error);
      return;
    }
    if (status === "") {
      setError("Status is required.");
      return;
    }
    if (selectedSchoolIds.length === 0) {
      setError("At least one school is required to be selected.");
      return;
    }

    setSubmitting(true);

    const { data: report, error: reportError } = await supabase
      .from("consolidated_reports")
      .insert({
        name,
        school_year: schoolYearCheck.value,
      })
      .select()
      .single();

    if (reportError) {
      setError(reportError.message);
      setSubmitting(false);
      return;
    }

    const submissionRows = selectedSchoolIds.map((schoolId) => ({
      consolidated_report_id: report.id,
      school_id: schoolId,
      name: report.name,
      school_year: report.school_year,
      status: status,
      remarks: remarks,
      drive_link: driveLink,
    }));

    const { data: newSubmissions, error: submissionError } = await supabase
      .from("consolidated_report_submissions")
      .insert(submissionRows)
      .select();

    if (submissionError) {
      setError(submissionError.message);
      setSubmitting(false);
      return;
    }

    onCreated(newSubmissions);
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
              Add New Consolidated Report
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the details to create a new consolidated report.
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
              placeholder="e.g. Consolidated Annual Report"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500">
                School Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                placeholder="e.g. 2025-2026"
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
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="e.g. For SY consolidation"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
// Edit Consolidated Report Submission — one school's row
// ============================================
const EditConsolidatedReportSubmission = ({
  submission,
  onSaved,
  onDeleted,
  onClose,
}) => {
  const [name, setName] = useState(submission.name);
  const [schoolYear, setSchoolYear] = useState(submission.school_year || "");
  const [driveLink, setDriveLink] = useState(submission.drive_link || "");
  const [status, setStatus] = useState(submission.status);
  const [remarks, setRemarks] = useState(submission.remarks || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this consolidated report entry?",
    );
    if (!confirmed) return;

    setSaving(true);
    const { error } = await supabase
      .from("consolidated_report_submissions")
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
      setError("Report name is required.");
      return;
    }
    if (!status) {
      setError("Status is required.");
      return;
    }
    const schoolYearCheck = validateSchoolYear(schoolYear);
    if (!schoolYearCheck.valid) {
      setError(schoolYearCheck.error);
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("consolidated_report_submissions")
      .update({
        name,
        school_year: schoolYearCheck.value,
        drive_link: driveLink || null,
        status,
        remarks: remarks || null,
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
            <h3 className="text-2xl font-bold text-slate-800">
              Edit Consolidated Report
            </h3>
            <p className="text-sm text-slate-500">
              Fill in the details to edit this entry.
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
                School Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                placeholder="e.g. 2025-2026"
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
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Remarks (optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20"
              placeholder="e.g. Submitted"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://drive.google.com/..."
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

const RemarksModal = ({ submission, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4"
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
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition-transform hover:-translate-y-0.5"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

// ============================================
// Main view — school tabs + table, per school's submissions
// ============================================
const ConsolidatedReports = ({ schoolData }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(
    schoolData?.[0]?.id ?? null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [viewingRemarks, setViewingRemarks] = useState(null);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("consolidated_report_submissions")
        .select("*")
        .order("school_year", { ascending: false });

      if (error) setError(error.message);
      else setSubmissions(data);
      setLoading(false);
    }
    loadSubmissions();
  }, []);

  function handleCreated(newRows) {
    setSubmissions((prev) => [...prev, ...newRows]);
  }

  function handleEdited(updated) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  }

  function handleDeleted(id) {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center py-20 text-red-600">
        Error: {error}
      </div>
    );

  const activeSchool = schoolData.find((s) => s.id === activeSchoolId);
  const schoolSubmissions = submissions.filter(
    (s) => s.school_id === activeSchoolId,
  );

  const statusOrder = { not_started: 0, ongoing: 1, completed: 2 };
  const sorted = [...schoolSubmissions].sort((a, b) => {
    const diff = statusOrder[a.status] - statusOrder[b.status];
    if (diff !== 0) return diff;
    return (b.school_year || "").localeCompare(a.school_year || "");
  });

  return (
    <>
      {/* School tabs — same pattern as the dashboard */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-2 lg:overflow-x-auto gap-2 pb-1">
        {schoolData.map((school) => (
          <button
            key={school.id}
            onClick={() => setActiveSchoolId(school.id)}
            className={`flex gap-2 sm:gap-3 items-center justify-start lg:whitespace-nowrap rounded-lg px-4 sm:px-10 py-2 sm:py-3 text-xs sm:text-sm font-semibold cursor-pointer ${
              activeSchoolId === school.id
                ? "bg-[#0b1c39] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>
              <School size={20} className="sm:w-6 sm:h-6" />
            </span>
            {school.name}
          </button>
        ))}
      </div>

      {activeSchool && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">
              Consolidated Reports — {activeSchool.name}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              + Add New Consolidated Report
            </button>
          </div>

          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm italic text-slate-400">
              No consolidated reports yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full min-w-170 table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                    <th className="pb-2 pt-2 pl-2 font-bold">Report</th>
                    <th className="pb-2 pt-2 font-bold text-center">
                      School Year
                    </th>
                    <th className="pb-2 pt-2 font-bold text-center">Status</th>
                    <th className="pb-2 pt-2 font-bold text-center">Actions</th>
                    <th className="pb-2 pt-2 font-bold text-center">Remarks</th>
                    <th className="pb-2 pt-2 font-bold text-center">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-50">
                      <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                        <span className="block" title={sub.name}>
                          {sub.name}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-500">
                        {sub.school_year || "—"}
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={sub.status} />
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
                          title="Edit entry"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        {sub.remarks ? <p>{sub.remarks}</p> : "—"}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateConsolidatedReport
          allSchools={schoolData}
          onCreated={handleCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingSubmission && (
        <EditConsolidatedReportSubmission
          submission={editingSubmission}
          onSaved={handleEdited}
          onDeleted={handleDeleted}
          onClose={() => setEditingSubmission(null)}
        />
      )}

      {viewingRemarks && (
        <RemarksModal
          submission={viewingRemarks}
          onClose={() => setViewingRemarks(null)}
        />
      )}
    </>
  );
};

export default ConsolidatedReports;
