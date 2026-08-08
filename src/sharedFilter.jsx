// SharedFilterHeader.jsx
// The sticky header block (title, month/year filters, welcome bar, school
// tabs) that appears identically at the top of Dashboard, Activities, and
// Reports. Pulling it out once avoids maintaining three copies.

import { LogOut, School } from "lucide-react";
import { supabase } from "./supabaseClient";
import { EmailLogsButton } from "./EmailLogs";

const LogoutButton = () => {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error.message);
  }
  return (
    <button
      onClick={handleLogout}
      className="inline-flex whitespace-nowrap items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
    >
      <LogOut size={16} />
      <span>Log Out</span>
    </button>
  );
};

export default function SharedFilterHeader({
  title,
  subtitle = "Monitor accomplishments of central schools, generate reports, and track compliance.",
  profile,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  availableYears,
  monthNames,
  schoolData,
  activeSchoolId,
  setActiveSchoolId,
}) {
  return (
    <div className="lg:sticky lg:top-0 z-20 -mx-4 lg:-mx-8 mb-6 border-b border-slate-200/80 bg-[#f4f6fb]/95 px-4 lg:px-8 pb-4 pt-5 backdrop-blur-sm">
      <div className="mb-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
            {(filterMonth !== "all" || filterYear !== "all") && (
              <button
                onClick={() => {
                  setFilterMonth("all");
                  setFilterYear("all");
                }}
                className="cursor-pointer whitespace-nowrap text-xs font-semibold text-blue-600 hover:underline"
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
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Months</option>
              {monthNames.map((label, i) => (
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
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="whitespace-nowrap text-xs sm:text-sm text-slate-600">
              Welcome, {profile.full_name || "PDO"}
            </span>
            <EmailLogsButton />
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-2 lg:overflow-x-auto gap-2 pb-1">
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
    </div>
  );
}