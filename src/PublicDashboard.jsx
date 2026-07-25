import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import CalendarView from "./CalendarView";
import {
  ClipboardList,
  CheckCircle2,
  Hourglass,
  XCircle,
  School,
  MessageSquareText,
  Menu,
  X,
  Maximize2,
} from "lucide-react";
import {
  StatusBadge,
  StatCard,
  ComplianceDonut,
  Sidebar,
  MobileHeader,
  ComplianceMiniDonut,
} from "./dashboardShared";

const STATUS_ORDER = {
  not_started: 0,
  ongoing: 1,
  completed: 2,
};

const MONTH_NAMES = [
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
];

const countByStatus = (submissions) => ({
  total: submissions.length,
  completed: submissions.filter((s) => s.status === "completed").length,
  ongoing: submissions.filter((s) => s.status === "ongoing").length,
  not_started: submissions.filter((s) => s.status === "not_started").length,
});

const OneDriveLogo = ({ size = 18 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 5.5 32 20.5"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <g>
        <path
          d="M12.20245,11.19292l.00031-.0011,6.71765,4.02379,4.00293-1.68451.00018.00068A6.4768,6.4768,0,0,1,25.5,13c.14764,0,.29358.0067.43878.01639a10.00075,10.00075,0,0,0-18.041-3.01381C7.932,10.00215,7.9657,10,8,10A7.96073,7.96073,0,0,1,12.20245,11.19292Z"
          fill="#0364b8"
        />
        <path
          d="M12.20276,11.19182l-.00031.0011A7.96073,7.96073,0,0,0,8,10c-.0343,0-.06805.00215-.10223.00258A7.99676,7.99676,0,0,0,1.43732,22.57277l5.924-2.49292,2.63342-1.10819,5.86353-2.46746,3.06213-1.28859Z"
          fill="#0078d4"
        />
        <path
          d="M25.93878,13.01639C25.79358,13.0067,25.64764,13,25.5,13a6.4768,6.4768,0,0,0-2.57648.53178l-.00018-.00068-4.00293,1.68451,1.16077.69528L23.88611,18.19l1.66009.99438,5.67633,3.40007a6.5002,6.5002,0,0,0-5.28375-9.56805Z"
          fill="#1490df"
        />
        <path
          d="M25.5462,19.18437,23.88611,18.19l-3.80493-2.2791-1.16077-.69528L15.85828,16.5042,9.99475,18.97166,7.36133,20.07985l-5.924,2.49292A7.98889,7.98889,0,0,0,8,26H25.5a6.49837,6.49837,0,0,0,5.72253-3.41556Z"
          fill="#28a8ea"
        />
      </g>
    </svg>
  );
};

const MaximizedReportsModal = ({
  schoolName,
  sorted,
  onViewRemarks,
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
              <col className="w-[26%]" />
              <col className="w-[15%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[17%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                <th className="pb-2 pt-2 pl-2 font-bold">Report</th>
                <th className="pb-2 pt-2 font-bold text-center">Date</th>
                <th className="pb-2 pt-2 font-bold text-center">
                  Date Submitted
                </th>
                <th className="pb-2 pt-2 font-bold text-center">Status</th>
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

const MaximizedActivitiesModal = ({
  schoolName,
  sorted,
  onViewRemarks,
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
              <col className="w-[28%]" />
              <col className="w-[16%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                <th className="pb-2 pt-2 pl-2 font-bold">Activity</th>
                <th className="pb-2 pt-2 font-bold text-center">Date</th>
                <th className="pb-2 pt-2 font-bold text-center">Status</th>
                <th className="pb-2 pt-2 font-bold text-center">Remarks</th>
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
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="py-3 text-center">
                    {sub.remarks ? (
                      <button
                        onClick={() => onViewRemarks(sub)}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                        title={sub.remarks}
                      >
                        <MessageSquareText size={18} />
                      </button>
                    ) : (
                      "—"
                    )}
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

const PublicDashboard = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [consolidatedRows, setConsolidatedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [view, setView] = useState("dashboard");
  const [calendarSchoolFilter, setCalendarSchoolFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [maximizedReports, setMaximizedReports] = useState(false);
  const [maximizedActivities, setMaximizedActivities] = useState(false);
  const [viewingRemarks, setViewingRemarks] = useState(null);
  const today = new Date();
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(today.getFullYear());

  useEffect(() => {
    async function loadData() {
      const [
        schoolsResult,
        submissionsResult,
        reportResult,
        consolidatedResult,
      ] = await Promise.all([
        supabase.from("schools").select("id, name").order("name"),
        supabase.from("submissions").select("*"),
        supabase.from("report_submissions").select("*"),
        supabase.from("consolidated_report_submissions").select("*"),
      ]);

      const { data: schoolsData, error: schoolsError } = schoolsResult;
      const { data: submissionsData, error: submissionsError } =
        submissionsResult;
      const { data: reportData, error: reportError } = reportResult;
      const { data: consolidatedData, error: consolidatedError } =
        consolidatedResult;

      if (
        schoolsError ||
        submissionsError ||
        reportError ||
        consolidatedError
      ) {
        setError(
          [
            schoolsError?.message,
            submissionsError?.message,
            reportError?.message,
            consolidatedError?.message,
          ]
            .filter(Boolean)
            .join(" | "),
        );
      } else {
        const schoolLookup = new Map(
          (schoolsData || []).map((school) => [school.id, school]),
        );
        const submissionRows = submissionsData || [];
        const reportRows = reportData || [];

        for (const submission of submissionRows) {
          if (submission.school_id && !schoolLookup.has(submission.school_id)) {
            schoolLookup.set(submission.school_id, {
              id: submission.school_id,
              name: `School ${submission.school_id}`,
            });
          }
        }

        for (const report of reportRows) {
          if (report.school_id && !schoolLookup.has(report.school_id)) {
            schoolLookup.set(report.school_id, {
              id: report.school_id,
              name: `School ${report.school_id}`,
            });
          }
        }

        const normalizedSchools = Array.from(schoolLookup.values()).map(
          (school) => ({
            ...school,
            submissions: submissionRows.filter(
              (sub) => sub.school_id === school.id,
            ),
            report_submissions: reportRows.filter(
              (sub) => sub.school_id === school.id,
            ),
          }),
        );

        normalizedSchools.sort((a, b) => a.name.localeCompare(b.name));
        setSchoolData(normalizedSchools);
        setConsolidatedRows(consolidatedData || []);
        if (normalizedSchools.length > 0)
          setActiveSchoolId(normalizedSchools[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading public dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!schoolData || schoolData.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-4">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No public dashboard data is available yet. This usually means the
          connected database has no school records to display yet.
        </div>
      </div>
    );
  }

  const activeSchool =
    schoolData.find((s) => s.id === activeSchoolId) || schoolData[0];
  const activeSchoolName = activeSchool?.name || "Selected school";
  const allSubmissions = schoolData.flatMap((s) => s.submissions || []);
  const overallCounts = countByStatus(allSubmissions);

  const filteredSubmissions = activeSchool
    ? activeSchool.submissions.filter((sub) => {
        if (filterMonth === "all" && filterYear === "all") return true;
        if (!sub.start_date) return false;

        const start = new Date(sub.start_date);
        const end = new Date(sub.end_date || sub.start_date);
        const yearsToCheck =
          filterYear === "all"
            ? Array.from(
                { length: end.getFullYear() - start.getFullYear() + 1 },
                (_, i) => start.getFullYear() + i,
              )
            : [filterYear];

        return yearsToCheck.some((year) => {
          const monthsToCheck =
            filterMonth === "all"
              ? Array.from({ length: 12 }, (_, i) => i + 1)
              : [filterMonth];

          return monthsToCheck.some((month) => {
            const windowStart = new Date(year, month - 1, 1);
            const windowEnd = new Date(year, month, 0);
            return start <= windowEnd && end >= windowStart;
          });
        });
      })
    : [];

  const activeCounts = countByStatus(filteredSubmissions);

  const availableYears = [
    ...new Set(
      allSubmissions
        .filter((s) => s.start_date)
        .flatMap((s) => {
          const startYear = new Date(s.start_date).getFullYear();
          const endYear = new Date(s.end_date || s.start_date).getFullYear();
          return startYear === endYear ? [startYear] : [startYear, endYear];
        }),
    ),
  ];

  if (!availableYears.includes(today.getFullYear())) {
    availableYears.push(today.getFullYear());
  }
  availableYears.sort((a, b) => b - a);

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date) - new Date(b.start_date);
  });

  const filterLabel =
    filterMonth === "all" && filterYear === "all"
      ? "All time"
      : filterMonth === "all"
        ? `All months, ${filterYear}`
        : filterYear === "all"
          ? `${MONTH_NAMES[filterMonth - 1]}, all years`
          : `${MONTH_NAMES[filterMonth - 1]} ${filterYear}`;

  const filteredReportSubmissions = activeSchool
    ? activeSchool.report_submissions.filter((sub) => {
        if (filterMonth === "all" && filterYear === "all") return true;
        if (!sub.submission_date) return false;
        const d = new Date(sub.submission_date);
        const monthMatch =
          filterMonth === "all" || d.getMonth() + 1 === filterMonth;
        const yearMatch =
          filterYear === "all" || d.getFullYear() === filterYear;
        return monthMatch && yearMatch;
      })
    : [];

  const reportCounts = countByStatus(filteredReportSubmissions);
  const sortedReportSubmissions = [...filteredReportSubmissions].sort(
    (a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      if (!a.submission_date) return 1;
      if (!b.submission_date) return -1;
      return new Date(a.submission_date) - new Date(b.submission_date);
    },
  );

  const filteredConsolidatedRows = activeSchool
    ? consolidatedRows.filter((row) => row.school_id === activeSchool.id)
    : consolidatedRows;

  const consolidatedCounts = {
    total: filteredConsolidatedRows.length,
    completed: filteredConsolidatedRows.filter(
      (row) => row.status === "completed",
    ).length,
    ongoing: filteredConsolidatedRows.filter((row) => row.status === "ongoing")
      .length,
    not_started: filteredConsolidatedRows.filter(
      (row) => row.status === "not_started",
    ).length,
  };

  const sortedConsolidatedRows = [...filteredConsolidatedRows].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    const aSchool =
      schoolData.find((school) => school.id === a.school_id)?.name || "";
    const bSchool =
      schoolData.find((school) => school.id === b.school_id)?.name || "";
    return aSchool.localeCompare(bSchool);
  });

  const publicNavItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "calendar", label: "Calendar" },
    { key: "reports", label: "Consolidated Reports" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f6fb]">
      <MobileHeader
        isMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        currentView={view}
        onNavigate={setView}
        items={publicNavItems}
      />

      <div className="hidden lg:flex sticky top-0 self-start h-screen flex-col overflow-hidden">
        <Sidebar
          currentView={view}
          onNavigate={setView}
          items={publicNavItems}
        />
        <div className="mt-0 bg-[#0b1c39] px-4 pb-77 pt-0 text-white">
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-white/50">
            Monthly Progress (All Schools)
          </p>
          <ComplianceMiniDonut counts={overallCounts} />
        </div>
      </div>

      <div className="lg:hidden bg-[#0b1c39] px-4 py-3 text-white w-full">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/50">
          Monthly Progress (All Schools)
        </p>
        <div className="w-full">
          <ComplianceMiniDonut counts={overallCounts} />
        </div>
      </div>

      {view === "calendar" ? (
        <main className="flex-1 p-4 lg:p-8 lg:pt-0">
          <div className="mb-4 mt-5">
            <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
            <p className="text-sm text-slate-500">
              View activities and reports on a public calendar without editing
              controls.
            </p>
          </div>
          <CalendarView
            schoolData={schoolData}
            schoolFilter={calendarSchoolFilter}
            onSchoolFilterChange={setCalendarSchoolFilter}
            onEventClick={() => {}}
          />
        </main>
      ) : view === "reports" ? (
        <main className="flex-1 p-4 lg:p-8 lg:pt-0">
          <div className="mb-4 mt-5">
            <h1 className="text-2xl font-bold text-slate-800">
              Consolidated Reports
            </h1>
            <p className="text-sm text-slate-500">
              Review consolidated report status and related details in read-only
              mode.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {schoolData.map((school) => (
              <button
                key={school.id}
                onClick={() => setActiveSchoolId(school.id)}
                className={`flex items-center rounded-lg px-4 py-3 text-sm font-semibold cursor-pointer ${
                  activeSchoolId === school.id
                    ? "bg-[#0b1c39] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <School size={18} className="mr-2" />
                {school.name}
              </button>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Consolidated Reports"
              value={consolidatedCounts.total}
              color="slate"
              icon={ClipboardList}
            />
            <StatCard
              label="Completed"
              value={consolidatedCounts.completed}
              color="green"
              icon={CheckCircle2}
            />
            <StatCard
              label="Ongoing"
              value={consolidatedCounts.ongoing}
              color="amber"
              icon={Hourglass}
            />
            <StatCard
              label="Not Started"
              value={consolidatedCounts.not_started}
              color="red"
              icon={XCircle}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                Consolidated Report Status — {activeSchoolName}
              </p>
              <p className="text-xs text-slate-500">{filterLabel}</p>
            </div>
            {sortedConsolidatedRows.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-slate-400">
                No consolidated reports available.
              </p>
            ) : (
              <div className="max-h-90 overflow-x-auto rounded-lg">
                <table className="w-full min-w-170 table-fixed text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                      <th className="pb-2 pt-2 pl-2 font-bold">Report</th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        School
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Status
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        School Year
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Remarks
                      </th>
                      <th className="pb-2 pt-2 font-bold text-center">Link</th>
                      <th className="pb-2 pt-2 font-bold text-center">
                        Legal Basis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedConsolidatedRows.map((row) => {
                      const schoolName =
                        schoolData.find((school) => school.id === row.school_id)
                          ?.name || "—";
                      return (
                        <tr key={row.id} className="border-b border-slate-50">
                          <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                            {row.name}
                          </td>
                          <td className="py-3 text-center text-slate-500">
                            {schoolName}
                          </td>
                          <td className="py-3 text-center">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="py-3 text-center text-slate-500">
                            {row.school_year || "—"}
                          </td>
                          <td className="py-3 text-center">
                            {row.remarks ? (
                              <button
                                onClick={() => setViewingRemarks(row)}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                title={row.remarks}
                              >
                                <MessageSquareText size={18} />
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {row.drive_link ? (
                              <a
                                href={row.drive_link}
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
                            className="py-3 text-center text-slate-500"
                            title={row.legal_basis || undefined}
                          >
                            {row.legal_basis || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex-1 p-4 lg:p-8 lg:pt-0">
          <div className="lg:sticky lg:top-0 z-20 -mx-4 lg:-mx-8 mb-6 border-b border-slate-200/80 bg-[#f4f6fb]/95 px-4 lg:px-8 pb-4 pt-5 backdrop-blur-sm">
            <div className="mb-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-slate-500">
                  Review the latest public dashboard activity, report progress,
                  and school-level status in read-only mode.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {(filterMonth !== "all" || filterYear !== "all") && (
                  <button
                    onClick={() => {
                      setFilterMonth("all");
                      setFilterYear("all");
                    }}
                    className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
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
                  {MONTH_NAMES.map((label, i) => (
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-2 lg:overflow-x-auto gap-2 pb-1">
              {schoolData.map((school) => (
                <button
                  key={school.id}
                  onClick={() => setActiveSchoolId(school.id)}
                  className={`flex items-center justify-start rounded-lg px-4 py-3 text-xs sm:text-sm font-semibold cursor-pointer ${
                    activeSchoolId === school.id
                      ? "bg-[#0b1c39] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <School size={18} className="mr-2" />
                  {school.name}
                </button>
              ))}
            </div>
          </div>

          {activeSchool && (
            <>
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">
                  Activity Summary
                </h2>
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
                    label="Not Started"
                    value={activeCounts.not_started}
                    sublabel={`${activeCounts.total ? Math.round((activeCounts.not_started / activeCounts.total) * 100) : 0}%`}
                    color="red"
                    icon={XCircle}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
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
                      <p className="text-xs sm:text-sm text-slate-500">
                        {filterLabel}
                      </p>
                    </div>
                    {filteredSubmissions.length === 0 ? (
                      <p className="py-8 text-center text-sm italic text-slate-400">
                        No activities match the selected filter.
                      </p>
                    ) : (
                      <div className="max-h-90 overflow-x-auto rounded-lg">
                        <table className="w-full min-w-170 table-fixed text-left text-sm">
                          <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                              <th className="pb-2 pt-2 pl-2 font-bold">
                                Activity
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Date
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Status
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Remarks
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
                              <tr
                                key={sub.id}
                                className="border-b border-slate-50"
                              >
                                <td className="py-3 pl-2 pr-2 font-medium text-slate-700">
                                  {sub.name}
                                </td>
                                <td className="py-3 text-center text-slate-500">
                                  {sub.start_date
                                    ? !sub.end_date ||
                                      sub.end_date === sub.start_date
                                      ? sub.start_date
                                      : `${sub.start_date} – ${sub.end_date}`
                                    : "—"}
                                </td>
                                <td className="py-3 text-center">
                                  <StatusBadge status={sub.status} />
                                </td>
                                <td className="py-3 text-center">
                                  {sub.remarks ? (
                                    <button
                                      onClick={() => setViewingRemarks(sub)}
                                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                      title={sub.remarks}
                                    >
                                      <MessageSquareText size={18} />
                                    </button>
                                  ) : (
                                    "—"
                                  )}
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
                                  className="py-3 text-center text-slate-500"
                                  title={sub.legal_basis || undefined}
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
                  <ComplianceDonut
                    counts={activeCounts}
                    filterLabel={filterLabel}
                    category="activity"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-4 pt-4 text-lg font-semibold text-slate-800 border-t border-slate-200/80">
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
                    label="Ongoing"
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
                      <p className="text-xs sm:text-sm text-slate-500">
                        {filterLabel}
                      </p>
                    </div>
                    {filteredReportSubmissions.length === 0 ? (
                      <p className="py-8 text-center text-sm italic text-slate-400">
                        No reports match the selected filter.
                      </p>
                    ) : (
                      <div className="max-h-90 overflow-x-auto rounded-lg">
                        <table className="w-full min-w-170 table-fixed text-left text-sm">
                          <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr className="border-b border-slate-100 text-xs uppercase text-slate-800">
                              <th className="pb-2 pt-2 pl-2 font-bold">
                                Report
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Date
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Date Submitted
                              </th>
                              <th className="pb-2 pt-2 font-bold text-center">
                                Status
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
                            {sortedReportSubmissions.map((sub) => (
                              <tr
                                key={sub.id}
                                className="border-b border-slate-50"
                              >
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
                                  className="py-3 text-center text-slate-500"
                                  title={sub.legal_basis || undefined}
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
                  <ComplianceDonut
                    counts={reportCounts}
                    filterLabel={filterLabel}
                    category="report"
                  />
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {viewingRemarks && (
        <RemarksModal
          submission={viewingRemarks}
          onClose={() => setViewingRemarks(null)}
        />
      )}

      {maximizedReports && (
        <MaximizedReportsModal
          schoolName={activeSchool?.name || "Selected school"}
          sorted={sortedReportSubmissions}
          onViewRemarks={(sub) => setViewingRemarks(sub)}
          onClose={() => setMaximizedReports(false)}
          filterLabel={filterLabel}
        />
      )}

      {maximizedActivities && (
        <MaximizedActivitiesModal
          schoolName={activeSchool?.name || "Selected school"}
          sorted={sortedSubmissions}
          onClose={() => setMaximizedActivities(false)}
          onViewRemarks={(sub) => setViewingRemarks(sub)}
          filterLabel={filterLabel}
        />
      )}
    </div>
  );
};

export default PublicDashboard;
