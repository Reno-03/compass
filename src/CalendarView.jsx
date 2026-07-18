import { useState } from "react";
import {
  ClipboardList,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_STYLES = {
  completed: "bg-green-50 text-green-700 border-green-200",
  ongoing: "bg-amber-50 text-amber-700 border-amber-200",
  not_started: "bg-red-50 text-red-700 border-red-200",
};

const EVENT_TYPE_META = {
  activity: { icon: ClipboardList, label: "Activity" },
  report: { icon: FileText, label: "Report" },
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// Layout constants for the bar system
const CELL_MIN_HEIGHT = 118;
const DATE_ROW_HEIGHT = 24;
const BAR_HEIGHT = 16;
const BAR_GAP = 2;
const MAX_VISIBLE_ROWS = 3;
const OVERFLOW_ROW_HEIGHT = 16;

function buildCalendarEvents(schoolData) {
  const events = [];
  schoolData.forEach((school) => {
    (school.submissions || []).forEach((sub) => {
      if (!sub.start_date) return;
      events.push({
        id: `activity-${sub.id}`,
        type: "activity",
        title: sub.name,
        status: sub.status,
        schoolName: school.name,
        startDate: sub.start_date,
        endDate: sub.end_date || sub.start_date,
        raw: sub,
      });
    });
    (school.report_submissions || []).forEach((sub) => {
      if (!sub.submission_date) return;
      events.push({
        id: `report-${sub.id}`,
        type: "report",
        title: sub.name,
        status: sub.status,
        schoolName: school.name,
        startDate: sub.submission_date,
        endDate: sub.submission_date,
        raw: sub,
      });
    });
  });
  return events;
}

function toDateOnly(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function chunkIntoWeeks(cells) {
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// Clips events to a week's range, computes start column / span,
// then greedily assigns each segment to the first free row so
// overlapping bars stack instead of colliding.
function computeWeekSegments(week, events) {
  const weekStart = toDateOnly(week[0]);
  const weekEnd = toDateOnly(week[6]);

  const relevant = events.filter((e) => {
    const s = toDateOnly(new Date(e.startDate));
    const en = toDateOnly(new Date(e.endDate));
    return s <= weekEnd && en >= weekStart;
  });

  const segments = relevant.map((e) => {
    const s = toDateOnly(new Date(e.startDate));
    const en = toDateOnly(new Date(e.endDate));
    const clippedStart = s < weekStart ? weekStart : s;
    const clippedEnd = en > weekEnd ? weekEnd : en;
    const startCol = Math.round((clippedStart - weekStart) / 86400000);
    const span = Math.round((clippedEnd - clippedStart) / 86400000) + 1;
    return {
      event: e,
      startCol,
      span,
      endCol: startCol + span - 1,
      continuesBefore: s < weekStart,
      continuesAfter: en > weekEnd,
    };
  });

  // Longer / earlier bars claim rows first, like Google Calendar does
  segments.sort((a, b) => a.startCol - b.startCol || b.span - a.span);

  const rowOccupancy = [];
  segments.forEach((seg) => {
    let rowIndex = rowOccupancy.findIndex((occRanges) =>
      occRanges.every((r) => seg.endCol < r.startCol || seg.startCol > r.endCol),
    );
    if (rowIndex === -1) {
      rowIndex = rowOccupancy.length;
      rowOccupancy.push([]);
    }
    rowOccupancy[rowIndex].push({ startCol: seg.startCol, endCol: seg.endCol });
    seg.row = rowIndex;
  });

  return segments;
}

const CalendarView = ({ schoolData, schoolFilter, onSchoolFilterChange, onEventClick }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [dayModalDate, setDayModalDate] = useState(null);

  const allEvents = buildCalendarEvents(schoolData);
  const events =
    schoolFilter === "all"
      ? allEvents
      : allEvents.filter((e) => e.raw.school_id === schoolFilter);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
  const weeks = chunkIntoWeeks(cells);

  const today = toDateOnly(new Date());

  function eventsForDay(date) {
    const d = toDateOnly(date);
    return events.filter((e) => {
      const start = toDateOnly(new Date(e.startDate));
      const end = toDateOnly(new Date(e.endDate));
      return d >= start && d <= end;
    });
  }

  function goToPrevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function goToNextMonth() { setViewDate(new Date(year, month + 1, 1)); }
  function goToToday() {
    const d = new Date();
    d.setDate(1);
    setViewDate(d);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">
            {MONTH_NAMES_FULL[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={goToPrevMonth} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToNextMonth} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={goToToday} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Today
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ClipboardList size={14} /> Activity</span>
            <span className="flex items-center gap-1.5"><FileText size={14} /> Report</span>
          </div>
          <select
            value={schoolFilter}
            onChange={(e) => onSchoolFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Schools</option>
            {schoolData.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-lg bg-slate-100 text-center text-xs font-semibold uppercase text-slate-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-slate-50 py-2">{label}</div>
        ))}
      </div>

      <div className="overflow-hidden rounded-b-lg border-x border-b border-slate-100">
        {weeks.map((week, weekIdx) => {
          const segments = computeWeekSegments(week, events);
          const visibleSegments = segments.filter((s) => s.row < MAX_VISIBLE_ROWS);
          const hiddenSegments = segments.filter((s) => s.row >= MAX_VISIBLE_ROWS);

          return (
            <div
              key={weekIdx}
              className="relative border-t border-slate-100 first:border-t-0"
              style={{ minHeight: CELL_MIN_HEIGHT }}
            >
              <div className="grid grid-cols-7">
                {week.map((date) => {
                  const inMonth = date.getMonth() === month;
                  const isToday = isSameDay(date, today);
                  return (
                    <div
                      key={date.toISOString()}
                      className={`border-l border-slate-100 first:border-l-0 p-1.5 ${!inMonth ? "bg-slate-50/60" : ""}`}
                      style={{ minHeight: CELL_MIN_HEIGHT }}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? "bg-blue-600 text-white" : inMonth ? "text-slate-700" : "text-slate-300"
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Spanning bars overlay */}
              <div
                className="pointer-events-none absolute left-0 right-0"
                style={{ top: DATE_ROW_HEIGHT + 4 }}
              >
                {visibleSegments.map((seg) => {
                  const Icon = EVENT_TYPE_META[seg.event.type].icon;
                  return (
                    <button
                      key={seg.event.id}
                      onClick={() => onEventClick(seg.event)}
                      title={`${seg.event.title} — ${seg.event.schoolName}`}
                      className={`pointer-events-auto absolute flex items-center gap-1 overflow-hidden border px-1.5 text-[11px] font-medium cursor-pointer ${STATUS_STYLES[seg.event.status]} ${
                        seg.continuesBefore ? "rounded-l-none border-l-0" : "rounded-l-md"
                      } ${seg.continuesAfter ? "rounded-r-none border-r-0" : "rounded-r-md"}`}
                      style={{
                        left: `calc(${(seg.startCol / 7) * 100}% + 2px)`,
                        width: `calc(${(seg.span / 7) * 100}% - 4px)`,
                        top: seg.row * (BAR_HEIGHT + BAR_GAP),
                        height: BAR_HEIGHT,
                      }}
                    >
                      {seg.continuesBefore && <ChevronLeft size={10} className="shrink-0 opacity-60" />}
                      <Icon size={10} className="shrink-0" />
                      <span className="truncate">{seg.event.title}</span>
                      {seg.continuesAfter && <ChevronRight size={10} className="ml-auto shrink-0 opacity-60" />}
                    </button>
                  );
                })}

                {/* Per-day "+n more" overflow, opens the day modal */}
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const hiddenCount = hiddenSegments.filter(
                    (s) => dayIdx >= s.startCol && dayIdx <= s.endCol,
                  ).length;
                  if (hiddenCount === 0) return null;
                  return (
                    <button
                      key={`overflow-${dayIdx}`}
                      onClick={() => setDayModalDate(week[dayIdx])}
                      className="pointer-events-auto absolute truncate rounded px-1 text-left text-[10px] font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer"
                      style={{
                        left: `${(dayIdx / 7) * 100}%`,
                        width: `${(1 / 7) * 100}%`,
                        top: MAX_VISIBLE_ROWS * (BAR_HEIGHT + BAR_GAP),
                        height: OVERFLOW_ROW_HEIGHT,
                      }}
                    >
                      +{hiddenCount} more
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {dayModalDate && (
        <DayEventsModal
          date={dayModalDate}
          events={eventsForDay(dayModalDate)}
          onEventClick={(event) => { setDayModalDate(null); onEventClick(event); }}
          onClose={() => setDayModalDate(null)}
        />
      )}
    </div>
  );
};

const DayEventsModal = ({ date, events, onEventClick, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-bold text-slate-800">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
      </div>
      <div className="space-y-2">
        {events.map((event) => {
          const Icon = EVENT_TYPE_META[event.type].icon;
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm cursor-pointer hover:opacity-80 ${STATUS_STYLES[event.status]}`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{event.title}</span>
              <span className="text-xs opacity-70">{event.schoolName}</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export default CalendarView;