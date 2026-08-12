// dashboardShared.jsx

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ClipboardList,
  CheckCircle2,
  Hourglass,
  XCircle,
  Menu,
  X,
} from "lucide-react";

const DONUT_COLORS = {
  completed: "#16A34A",
  ongoing: "#D97706",
  not_started: "#DC2626",
};

const STATUS_STYLES = {
  completed: "bg-green-50 text-green-700 border-green-200",
  ongoing: "bg-amber-50 text-amber-700 border-amber-200",
  not_started: "bg-red-50 text-red-700 border-red-200",
};

const ACTIVITY_STATUS_LABEL = {
  completed: "Completed",
  ongoing: "Ongoing",
  not_started: "Upcoming",
};

const REPORT_STATUS_LABEL = {
  completed: "Completed",
  ongoing: "In Progress",
  not_started: "Not Started",
};

export const StatusBadge = ({ status, category }) => {
  const labels =
    category === "activity" ? ACTIVITY_STATUS_LABEL : REPORT_STATUS_LABEL;
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.not_started}`}
    >
      {labels[status] || status}
    </span>
  );
};

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

export const PriorityBadge = ({ priority }) => (
  <span
    className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}`}
  >
    {PRIORITY_LABEL[priority] || "—"}
  </span>
);

const FREQUENCY_LABEL = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  one_time: "One-time",
};

export const FrequencyBadge = ({ frequency }) => (
  <span className="inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
    {FREQUENCY_LABEL[frequency] || "One-time"}
  </span>
);

export const StatCard = ({ label, value, sublabel, color, icon: Icon }) => {
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
    <div
      className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 rounded-xl border p-3 sm:p-4 ${palette}`}
    >
      {Icon && (
        <div
          className={`flex h-12 w-12 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon size={28} className="sm:w-9.5 sm:h-9.5" />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {label}
        </p>
        <p className="mt-1 text-2xl sm:text-4xl font-bold">{value}</p>
        {sublabel && <p className="text-xs opacity-70">{sublabel}</p>}
      </div>
    </div>
  );
};

export const ComplianceDonut = ({ counts, filterLabel, category }) => {
  const data = [
    { name: "Completed", value: counts.completed, key: "completed" },
    { name: "Ongoing", value: counts.ongoing, key: "ongoing" },
    { name: "Not Started", value: counts.not_started, key: "not_started" },
  ].filter((d) => d.value > 0);

  const ongoingLabel = category === "activity" ? "Ongoing" : "In Progress";
  const notStartedLabel = category === "activity" ? "Upcoming" : "Not Started";

  const pct = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">
          {category === "activity"
            ? "Activities Compliance"
            : "Reports Compliance"}
        </p>
        <p className="text-xs lg:text-sm text-slate-500">{filterLabel}</p>
      </div>
      <div className="flex flex-row items-center justify-center gap-6">
        <div className="relative h-32 w-32 lg:h-40 lg:w-40 shrink-0">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={60}
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
            <div className="flex h-full w-full items-center justify-center rounded-full border-8 border-slate-100 text-xs text-slate-400"></div>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl lg:text-2xl font-bold text-slate-800">
              {pct}%
            </span>
            <span className="text-[10px] text-slate-500">Overall</span>
          </div>
        </div>
        <div className="space-y-2 text-[13px]">
          <LegendRow
            color={DONUT_COLORS.completed}
            label="Completed"
            value={counts.completed}
          />
          <LegendRow
            color={DONUT_COLORS.ongoing}
            label={ongoingLabel}
            value={counts.ongoing}
          />
          <LegendRow
            color={DONUT_COLORS.not_started}
            label={notStartedLabel}
            value={counts.not_started}
          />
        </div>
      </div>
    </div>
  );
};

const LegendRow = ({ color, label, value }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);

export const Sidebar = ({ currentView, onNavigate, items }) => {
  const navItems = items || [
    { key: "dashboard", label: "Dashboard" },
    { key: "calendar", label: "Calendar" },
    { key: "reports", label: "Consolidated Reports" },
    { key: "download", label: "Download Reports" },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0b1c39] px-4 py-6 text-white">
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
          src="/images/lantaw-banner-logo-white.webp"
          alt="LANTAW Banner"
          className="mb-2 w-full pr-5 rounded-lg"
        />
        <div className="text-[11px] font-normal text-white/60">
          Leveraging Analytics and Navigation for Timely Action and Workflow
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm cursor-pointer ${
              currentView === item.key
                ? "bg-blue-600 font-semibold text-white"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export const MobileHeader = ({
  isMenuOpen,
  onMenuToggle,
  currentView,
  onNavigate,
  items,
}) => {
  const navItems = items || [
    { key: "dashboard", label: "Dashboard" },
    { key: "activities", label: "Activities" },
    { key: "reports", label: "Reports" },
    { key: "calendar", label: "Calendar" },
    { key: "evidence_vault", label: "Evidence Vault" },
    { key: "link", label: "LINK" },
  ];

  return (
    <>
      <div className="sticky top-0 z-40 flex lg:hidden items-center justify-between bg-[#0b1c39] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <img
            src="/images/DEPED_logo.png"
            alt="DEPED Logo"
            className="h-8 w-8"
          />
          <img
            src="/images/DEPED_torch_logo.png"
            alt="DEPED Logo"
            className="h-7"
          />
        </div>
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/10 cursor-pointer"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-x-0 top-16 z-50 lg:hidden
      border-b border-white/10 bg-[#0b1c39] shadow-lg
      transition-all duration-300 ease-out
      ${
        isMenuOpen
          ? "max-h-[calc(100dvh-4rem)] overflow-y-auto"
          : "max-h-0 overflow-hidden pointer-events-none"
      }`}
        >
        <nav className="space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                onMenuToggle();
              }}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                currentView === item.key
                  ? "bg-blue-600 font-semibold text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
export const ComplianceMiniDonut = ({ counts }) => {
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
}; // <-- closes ComplianceMiniDonut here

// ============================================
// OneDrive icon
// ============================================
export function OneDriveLogo({ size = 16 }) {
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
