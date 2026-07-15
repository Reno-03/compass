// import React, { useState } from "react";
// import {
//   LayoutDashboard,
//   ClipboardCheck,
//   FileText,
//   BarChart3,
//   Mail,
//   Download,
//   ClipboardList,
//   CheckCircle2,
//   Hourglass,
//   XCircle,
//   FileCheck2,
//   Eye,
//   Plus,
//   Bell,
//   User,
//   Calendar,
//   GraduationCap,
// } from "lucide-react";

// // ---------- Dummy Data ----------
// const SCHOOLS = ["Central School 1", "Central School 2", "Central School 3"];

// const STAT_CARDS = [
//   {
//     label: "TOTAL ACTIVITIES",
//     value: 25,
//     sub: "This Month",
//     icon: ClipboardList,
//     color: "emerald",
//   },
//   {
//     label: "COMPLETED",
//     value: 15,
//     sub: "60%",
//     icon: CheckCircle2,
//     color: "green",
//   },
//   { label: "ONGOING", value: 6, sub: "24%", icon: Hourglass, color: "amber" },
//   { label: "NOT STARTED", value: 4, sub: "16%", icon: XCircle, color: "red" },
//   {
//     label: "REPORTS SUBMITTED",
//     value: 14,
//     sub: "56%",
//     icon: FileCheck2,
//     color: "blue",
//   },
// ];

// const ACTIVITIES = [
//   {
//     no: 1,
//     name: "Nutrition Month Celebration",
//     target: "Jul 31, 2025",
//     status: "Completed",
//     report: "Yes",
//     date: "Jul 25, 2025",
//   },
//   {
//     no: 2,
//     name: "National Disaster Resilience Month",
//     target: "Jul 31, 2025",
//     status: "Completed",
//     report: "Pending",
//     date: "\u2013",
//   },
//   {
//     no: 3,
//     name: "School DRRM Drill",
//     target: "Jul 15, 2025",
//     status: "Completed",
//     report: "Yes",
//     date: "Jul 15, 2025",
//   },
//   {
//     no: 4,
//     name: "WinS Monitoring",
//     target: "Jul 25, 2025",
//     status: "Ongoing",
//     report: "No",
//     date: "\u2013",
//   },
//   {
//     no: 5,
//     name: "GAD Activity (if applicable)",
//     target: "Jul 31, 2025",
//     status: "Not Started",
//     report: "No",
//     date: "\u2013",
//   },
// ];

// const RECENT_REPORTS = [
//   {
//     activity: "Nutrition Month Celebration",
//     date: "Jul 25, 2025",
//     by: "Juan Dela Cruz",
//   },
//   { activity: "School DRRM Drill", date: "Jul 15, 2025", by: "Maria Santos" },
//   {
//     activity: "National Disaster Resilience Month",
//     date: "Jul 10, 2025",
//     by: "Pedro Reyes",
//   },
// ];

// const REMINDERS = [
//   {
//     activity: "WinS Monitoring",
//     note: "Report not yet submitted",
//     due: "Jul 25, 2025",
//     level: "amber",
//   },
//   {
//     activity: "GAD Activity",
//     note: "Not yet conducted",
//     due: "Jul 31, 2025",
//     level: "red",
//   },
//   {
//     activity: "National Disaster Resilience Month",
//     note: "Report pending",
//     due: "Jul 31, 2025",
//     level: "blue",
//   },
// ];

// const COMPLIANCE = [
//   { label: "Completed", value: 15, pct: 60, color: "#22c55e" },
//   { label: "Ongoing", value: 6, pct: 24, color: "#eab308" },
//   { label: "Not Started", value: 4, pct: 16, color: "#ef4444" },
// ];

// const MONTHLY_PROGRESS = [
//   { label: "Completed", value: 75, pct: 60, color: "#22c55e" },
//   { label: "Ongoing", value: 30, pct: 24, color: "#eab308" },
//   { label: "Not Started", value: 20, pct: 16, color: "#ef4444" },
// ];

// const NAV_ITEMS = [
//   { label: "Dashboard", icon: LayoutDashboard },
//   { label: "Monitor Accomplishments", icon: ClipboardCheck },
//   { label: "Consolidated Reports", icon: FileText },
//   { label: "Analytics", icon: BarChart3 },
//   { label: "Send Reminders", icon: Mail },
//   { label: "Download Reports", icon: Download },
// ];

// const STATUS_STYLES = {
//   Completed: "bg-green-100 text-green-700",
//   Ongoing: "bg-amber-100 text-amber-700",
//   "Not Started": "bg-slate-200 text-slate-600",
// };

// const REPORT_STYLES = {
//   Yes: "bg-green-100 text-green-700",
//   Pending: "bg-amber-100 text-amber-700",
//   No: "bg-red-100 text-red-700",
// };

// const CARD_COLOR = {
//   emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
//   green: "bg-green-50 border-green-100 text-green-600",
//   amber: "bg-amber-50 border-amber-100 text-amber-500",
//   red: "bg-red-50 border-red-100 text-red-500",
//   blue: "bg-blue-50 border-blue-100 text-blue-600",
// };

// const LABEL_COLOR = {
//   emerald: "text-emerald-700",
//   green: "text-green-700",
//   amber: "text-amber-600",
//   red: "text-red-600",
//   blue: "text-blue-700",
// };

// // ---------- Donut Chart ----------
// function Donut({ data, centerLabel, centerSub, size = 180 }) {
//   const radius = size / 2 - 18;
//   const circumference = 2 * Math.PI * radius;
//   let offsetAcc = 0;
//   return (
//     <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//       <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
//         <circle r={radius} fill="none" stroke="#f1f5f9" strokeWidth={22} />
//         {data.map((d, i) => {
//           const dash = (d.pct / 100) * circumference;
//           const gap = circumference - dash;
//           const el = (
//             <circle
//               key={i}
//               r={radius}
//               fill="none"
//               stroke={d.color}
//               strokeWidth={22}
//               strokeDasharray={`${dash} ${gap}`}
//               strokeDashoffset={-offsetAcc}
//               strokeLinecap="butt"
//             />
//           );
//           offsetAcc += dash;
//           return el;
//         })}
//       </g>
//       <text
//         x="50%"
//         y="47%"
//         textAnchor="middle"
//         className="fill-slate-800"
//         style={{ fontSize: 26, fontWeight: 700 }}
//       >
//         {centerLabel}
//       </text>
//       <text
//         x="50%"
//         y="58%"
//         textAnchor="middle"
//         className="fill-slate-400"
//         style={{ fontSize: 11 }}
//       >
//         {centerSub}
//       </text>
//     </svg>
//   );
// }

// export default function Dashboard() {
//   const [activeSchool, setActiveSchool] = useState(0);
//   const [activeNav, setActiveNav] = useState(0);
//   const [month, setMonth] = useState("2025-07");

//   const monthLabel = new Date(month + "-02").toLocaleString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <div
//       className="min-h-screen w-full bg-slate-100 flex text-slate-800"
//       style={{ fontFamily: "Inter, system-ui, sans-serif" }}
//     >
//       {/* Sidebar */}
//       <aside className="w-64 shrink-0 bg-[#0b1e42] text-white flex flex-col">
//         <div className="flex items-center gap-3 px-5 pt-6 pb-5">
//           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
//             <GraduationCap className="w-6 h-6 text-[#0b1e42]" />
//           </div>
//           <div>
//             <div className="text-[10px] leading-tight font-semibold tracking-wide text-slate-300">
//               DepEd
//             </div>
//             <div className="text-xs font-bold leading-tight">
//               DEPARTMENT
//               <br />
//               OF EDUCATION
//             </div>
//           </div>
//         </div>
//         <div className="px-5 pb-6 text-sm font-bold leading-tight tracking-wide border-b border-white/10">
//           MONTHLY SCHOOL PROGRAM MONITORING SYSTEM
//         </div>

//         <nav className="flex-1 px-2 mt-4 space-y-1">
//           {NAV_ITEMS.map((item, i) => {
//             const Icon = item.icon;
//             const active = i === activeNav;
//             return (
//               <button
//                 key={item.label}
//                 onClick={() => setActiveNav(i)}
//                 className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
//                   active
//                     ? "bg-blue-600/90 text-white font-medium"
//                     : "text-slate-300 hover:bg-white/5"
//                 }`}
//               >
//                 <Icon className="w-4 h-4 shrink-0" />
//                 <span className="text-left">{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         <div className="px-5 pt-6 pb-6 border-t border-white/10 mt-4">
//           <div className="text-xs font-bold tracking-wide text-slate-300 mb-3">
//             MONTHLY PROGRESS (All Schools)
//           </div>
//           <div className="flex justify-center mb-3">
//             <Donut
//               data={MONTHLY_PROGRESS}
//               centerLabel=""
//               centerSub=""
//               size={140}
//             />
//           </div>
//           <div className="space-y-1.5">
//             {MONTHLY_PROGRESS.map((d) => (
//               <div
//                 key={d.label}
//                 className="flex items-center justify-between text-xs"
//               >
//                 <span className="flex items-center gap-2 text-slate-300">
//                   <span
//                     className="w-2.5 h-2.5 rounded-sm"
//                     style={{ backgroundColor: d.color }}
//                   />
//                   {d.label}
//                 </span>
//                 <span className="text-slate-200">
//                   {d.value} ({d.pct}%)
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </aside>

//       {/* Main */}
//       <main className="flex-1 min-w-0">
//         {/* Header */}
//         <div className="flex items-center justify-between px-8 pt-6 pb-4">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">
//               Dashboard Overview
//             </h1>
//             <p className="text-sm text-slate-500 mt-0.5">
//               Monitor accomplishments of central schools, generate reports, and
//               track compliance.
//             </p>
//           </div>
//           <div className="flex items-center gap-6">
//             <label className="flex items-center gap-2 text-sm text-slate-600">
//               Month:
//               <span className="relative">
//                 <input
//                   type="month"
//                   value={month}
//                   onChange={(e) => setMonth(e.target.value)}
//                   className="border border-slate-300 rounded-md pl-3 pr-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </span>
//             </label>
//             <div className="flex items-center gap-2 text-sm text-slate-700">
//               <span>Welcome, PDO</span>
//               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
//                 <User className="w-4 h-4 text-slate-500" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="px-8 pb-10">
//           {/* School Tabs */}
//           <div className="flex gap-2 mb-6">
//             {SCHOOLS.map((school, i) => {
//               const active = i === activeSchool;
//               return (
//                 <button
//                   key={school}
//                   onClick={() => setActiveSchool(i)}
//                   className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
//                     active
//                       ? "bg-[#0b1e42] text-white border-[#0b1e42]"
//                       : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
//                   }`}
//                 >
//                   <GraduationCap
//                     className={`w-4 h-4 ${active ? "text-amber-300" : "text-slate-400"}`}
//                   />
//                   {school.toUpperCase()}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Stat Cards */}
//           <div className="grid grid-cols-5 gap-4 mb-6">
//             {STAT_CARDS.map((card) => {
//               const Icon = card.icon;
//               return (
//                 <div
//                   key={card.label}
//                   className={`rounded-xl border p-4 ${CARD_COLOR[card.color]}`}
//                 >
//                   <div className="flex items-center gap-2 mb-2">
//                     <Icon className="w-4 h-4" />
//                     <span
//                       className={`text-[11px] font-semibold tracking-wide ${LABEL_COLOR[card.color]}`}
//                     >
//                       {card.label}
//                     </span>
//                   </div>
//                   <div className="text-2xl font-bold text-slate-800">
//                     {card.value}
//                   </div>
//                   <div className="text-xs text-slate-500 mt-0.5">
//                     {card.sub}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Activities + Compliance */}
//           <div className="grid grid-cols-3 gap-5 mb-6">
//             <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
//               <h2 className="text-sm font-bold text-slate-800 mb-4">
//                 ACTIVITIES MONITORING — {monthLabel.toUpperCase()}
//               </h2>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
//                     <th className="pb-2 font-medium">No.</th>
//                     <th className="pb-2 font-medium">Activity / Celebration</th>
//                     <th className="pb-2 font-medium">Target Date</th>
//                     <th className="pb-2 font-medium">Status (Activity)</th>
//                     <th className="pb-2 font-medium">Report Submitted</th>
//                     <th className="pb-2 font-medium">Date Submitted</th>
//                     <th className="pb-2 font-medium">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ACTIVITIES.map((a) => (
//                     <tr
//                       key={a.no}
//                       className="border-b border-slate-50 last:border-0"
//                     >
//                       <td className="py-3 text-slate-500">{a.no}</td>
//                       <td className="py-3 text-slate-700">{a.name}</td>
//                       <td className="py-3 text-slate-500">{a.target}</td>
//                       <td className="py-3">
//                         <span
//                           className={`px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_STYLES[a.status]}`}
//                         >
//                           {a.status}
//                         </span>
//                       </td>
//                       <td className="py-3">
//                         <span
//                           className={`px-2.5 py-1 rounded-md text-xs font-medium ${REPORT_STYLES[a.report]}`}
//                         >
//                           {a.report}
//                         </span>
//                       </td>
//                       <td className="py-3 text-slate-500">{a.date}</td>
//                       <td className="py-3">
//                         <button className="text-slate-400 hover:text-blue-600">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <button className="w-full mt-4 py-2.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
//                 View All Activities
//               </button>
//             </div>

//             <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
//               <h2 className="text-sm font-bold text-slate-800 mb-4">
//                 COMPLIANCE OVERVIEW — {monthLabel.toUpperCase()}
//               </h2>
//               <div className="flex justify-center my-2">
//                 <Donut
//                   data={COMPLIANCE}
//                   centerLabel="60%"
//                   centerSub="Overall Compliance"
//                   size={170}
//                 />
//               </div>
//               <div className="space-y-2 mt-3">
//                 {COMPLIANCE.map((d) => (
//                   <div
//                     key={d.label}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <span className="flex items-center gap-2 text-slate-600">
//                       <span
//                         className="w-2.5 h-2.5 rounded-sm"
//                         style={{ backgroundColor: d.color }}
//                       />
//                       {d.label}
//                     </span>
//                     <span className="text-slate-500">
//                       {d.value} ({d.pct}%)
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <button className="w-full mt-5 py-2.5 rounded-lg bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors">
//                 View Analytics
//               </button>
//             </div>
//           </div>

//           {/* Reports, Reminders, Quick Actions */}
//           <div className="grid grid-cols-3 gap-5">
//             <div className="bg-white rounded-xl border border-slate-200 p-5">
//               <h2 className="text-sm font-bold text-slate-800 mb-4">
//                 RECENT REPORTS SUBMITTED
//               </h2>
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
//                     <th className="pb-2 font-medium">Activity</th>
//                     <th className="pb-2 font-medium">Date Submitted</th>
//                     <th className="pb-2 font-medium">Submitted By</th>
//                     <th className="pb-2 font-medium">File</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {RECENT_REPORTS.map((r) => (
//                     <tr
//                       key={r.activity}
//                       className="border-b border-slate-50 last:border-0"
//                     >
//                       <td className="py-3 text-slate-700">{r.activity}</td>
//                       <td className="py-3 text-slate-500">{r.date}</td>
//                       <td className="py-3 text-slate-500">{r.by}</td>
//                       <td className="py-3">
//                         <FileText className="w-4 h-4 text-red-400" />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <button className="w-full mt-4 py-2.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
//                 View All Reports
//               </button>
//             </div>

//             <div className="bg-white rounded-xl border border-slate-200 p-5">
//               <h2 className="text-sm font-bold text-slate-800 mb-4">
//                 PENDING / UPCOMING REMINDERS
//               </h2>
//               <div className="space-y-3">
//                 {REMINDERS.map((r) => (
//                   <div
//                     key={r.activity}
//                     className="flex items-start justify-between gap-3"
//                   >
//                     <div className="flex items-start gap-2.5">
//                       <Bell
//                         className={`w-4 h-4 mt-0.5 shrink-0 ${
//                           r.level === "amber"
//                             ? "text-amber-500"
//                             : r.level === "red"
//                               ? "text-red-500"
//                               : "text-blue-500"
//                         }`}
//                       />
//                       <div>
//                         <div className="text-sm text-slate-700 font-medium">
//                           {r.activity}{" "}
//                           <span className="text-slate-400 font-normal">
//                             — {r.note}
//                           </span>
//                         </div>
//                         <div className="text-xs text-slate-400 mt-0.5">
//                           Due: {r.due}
//                         </div>
//                       </div>
//                     </div>
//                     <button className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md whitespace-nowrap hover:bg-amber-100">
//                       Send Reminder
//                     </button>
//                   </div>
//                 ))}
//               </div>
//               <button className="w-full mt-5 py-2.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
//                 View All Reminders
//               </button>
//             </div>

//             <div className="bg-white rounded-xl border border-slate-200 p-5">
//               <h2 className="text-sm font-bold text-slate-800 mb-4">
//                 QUICK ACTIONS
//               </h2>
//               <div className="space-y-2.5">
//                 <QuickAction
//                   icon={Plus}
//                   label="Add New Activity"
//                   color="bg-blue-600"
//                 />
//                 <QuickAction
//                   icon={FileText}
//                   label="Generate Consolidated Report"
//                   color="bg-emerald-600"
//                 />
//                 <QuickAction
//                   icon={BarChart3}
//                   label="View Dashboards & Analytics"
//                   color="bg-violet-600"
//                 />
//                 <QuickAction
//                   icon={Bell}
//                   label="Send Reminders"
//                   color="bg-orange-500"
//                 />
//                 <QuickAction
//                   icon={Download}
//                   label="Download Reports"
//                   color="bg-teal-600"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Note */}
//           <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-sm text-blue-800">
//             <span className="font-semibold">Note:</span> Please ensure all
//             required reports and documentation are submitted on or before the
//             target date.
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// function QuickAction({ icon: Icon, label, color }) {
//   return (
//     <button
//       className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white text-sm font-medium ${color} hover:opacity-90 transition-opacity`}
//     >
//       <Icon className="w-4 h-4" />
//       {label}
//     </button>
//   );
// }
