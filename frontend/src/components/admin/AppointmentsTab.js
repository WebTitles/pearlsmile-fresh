// // ============================================================
// // src/components/admin/AppointmentsTab.js
// // ============================================================
// import React, { useState, useEffect, useCallback } from "react";
// import api from "../../utils/api";

// // ─── Status config ────────────────────────────────────────────
// const STATUS_CONFIG = {
//   pending: { label: "Pending", color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
//   confirmed: {
//     label: "Confirmed",
//     color: "#2563eb",
//     bg: "#eff6ff",
//     icon: "✅",
//   },
//   completed: {
//     label: "Completed",
//     color: "#16a34a",
//     bg: "#f0fdf4",
//     icon: "🎉",
//   },
//   cancelled: {
//     label: "Cancelled",
//     color: "#dc2626",
//     bg: "#fef2f2",
//     icon: "❌",
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────
// function toDateStr(d) {
//   // Normalise "YYYY-MM-DD" or "DD/MM/YYYY" etc. → comparable string
//   return d ? d.trim() : "";
// }

// function todayStr() {
//   const d = new Date();
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// function friendlyDate(dateStr) {
//   if (!dateStr) return "—";
//   // handle YYYY-MM-DD
//   const parts = dateStr.split("-");
//   if (parts.length === 3) {
//     const d = new Date(dateStr + "T00:00:00");
//     if (!isNaN(d))
//       return d.toLocaleDateString("en-IN", {
//         weekday: "short",
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       });
//   }
//   return dateStr;
// }

// function isToday(dateStr) {
//   return toDateStr(dateStr) === todayStr();
// }

// function isPast(dateStr) {
//   return toDateStr(dateStr) < todayStr();
// }

// function isUpcoming(dateStr) {
//   return toDateStr(dateStr) > todayStr();
// }

// function waLink(phone) {
//   const num = phone.replace(/\D/g, "");
//   const full = num.startsWith("91") ? num : "91" + num;
//   return `https://wa.me/${full}`;
// }

// // ─── Single appointment card ──────────────────────────────────
// function AppointmentCard({ appt, onStatusChange, onDelete }) {
//   const [changing, setChanging] = useState(false);
//   const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

//   async function handleStatus(newStatus) {
//     if (newStatus === appt.status) return;
//     setChanging(true);
//     await onStatusChange(appt._id, newStatus);
//     setChanging(false);
//   }

//   return (
//     <div
//       style={{
//         background: "#fff",
//         border: "1px solid #e5e7eb",
//         borderLeft: `4px solid ${cfg.color}`,
//         borderRadius: "10px",
//         padding: "16px 18px",
//         marginBottom: "12px",
//         boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
//       }}
//     >
//       {/* Top row: name + status badge */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           flexWrap: "wrap",
//           gap: "8px",
//         }}
//       >
//         <div>
//           <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
//             {appt.name}
//           </span>
//           <span
//             style={{
//               display: "inline-block",
//               marginLeft: "10px",
//               background: cfg.bg,
//               color: cfg.color,
//               border: `1px solid ${cfg.color}`,
//               borderRadius: "20px",
//               fontSize: "11px",
//               fontWeight: 600,
//               padding: "2px 10px",
//             }}
//           >
//             {cfg.icon} {cfg.label}
//           </span>
//         </div>
//         <div style={{ fontSize: "12px", color: "#94a3b8" }}>
//           Booked: {new Date(appt.createdAt).toLocaleDateString("en-IN")}
//         </div>
//       </div>

//       {/* Details grid */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//           gap: "6px 16px",
//           marginTop: "10px",
//         }}
//       >
//         <div>
//           <span style={labelStyle}>📅 Date</span>{" "}
//           <span style={valStyle}>{friendlyDate(appt.date)}</span>
//         </div>
//         <div>
//           <span style={labelStyle}>🕐 Time</span>{" "}
//           <span style={valStyle}>{appt.time || "Not specified"}</span>
//         </div>
//         <div>
//           <span style={labelStyle}>🦷 Service</span>{" "}
//           <span style={valStyle}>{appt.service}</span>
//         </div>
//         <div>
//           <span style={labelStyle}>📱 Phone</span>{" "}
//           <a
//             href={waLink(appt.phone)}
//             target="_blank"
//             rel="noreferrer"
//             style={{
//               color: "#16a34a",
//               fontWeight: 600,
//               textDecoration: "none",
//               fontSize: "13px",
//             }}
//           >
//             {appt.phone} 💬
//           </a>
//         </div>
//       </div>

//       {/* Message */}
//       {appt.message && (
//         <div
//           style={{
//             marginTop: "8px",
//             background: "#f8fafc",
//             borderRadius: "6px",
//             padding: "8px 10px",
//             fontSize: "13px",
//             color: "#475569",
//           }}
//         >
//           <span style={{ fontWeight: 600 }}>💬 Message: </span>
//           {appt.message}
//         </div>
//       )}

//       {/* Actions row */}
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: "6px",
//           marginTop: "12px",
//           alignItems: "center",
//         }}
//       >
//         <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
//           Update Status:
//         </span>
//         {Object.entries(STATUS_CONFIG).map(([key, c]) => (
//           <button
//             key={key}
//             disabled={changing || appt.status === key}
//             onClick={() => handleStatus(key)}
//             style={{
//               padding: "4px 10px",
//               borderRadius: "14px",
//               border: `1px solid ${c.color}`,
//               background: appt.status === key ? c.color : "#fff",
//               color: appt.status === key ? "#fff" : c.color,
//               fontSize: "11px",
//               fontWeight: 600,
//               cursor: appt.status === key ? "default" : "pointer",
//               opacity: changing ? 0.6 : 1,
//             }}
//           >
//             {c.icon} {c.label}
//           </button>
//         ))}

//         <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
//           <a
//             href={waLink(appt.phone)}
//             target="_blank"
//             rel="noreferrer"
//             style={{
//               padding: "5px 12px",
//               borderRadius: "8px",
//               background: "#dcfce7",
//               color: "#16a34a",
//               border: "1px solid #16a34a",
//               fontSize: "12px",
//               fontWeight: 600,
//               textDecoration: "none",
//             }}
//           >
//             📲 WhatsApp
//           </a>
//           <button
//             onClick={() => onDelete(appt._id)}
//             style={{
//               padding: "5px 10px",
//               borderRadius: "8px",
//               background: "#fef2f2",
//               color: "#dc2626",
//               border: "1px solid #dc2626",
//               fontSize: "12px",
//               fontWeight: 600,
//               cursor: "pointer",
//             }}
//           >
//             🗑
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const labelStyle = {
//   fontSize: "11px",
//   color: "#94a3b8",
//   fontWeight: 600,
//   textTransform: "uppercase",
//   marginRight: "4px",
// };
// const valStyle = { fontSize: "13px", color: "#334155", fontWeight: 500 };

// // ─── Section header ───────────────────────────────────────────
// function SectionHead({ title, count, accent }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "10px",
//         margin: "24px 0 12px",
//         borderBottom: `2px solid ${accent}`,
//         paddingBottom: "8px",
//       }}
//     >
//       <span style={{ fontSize: "18px", fontWeight: 700, color: accent }}>
//         {title}
//       </span>
//       <span
//         style={{
//           background: accent,
//           color: "#fff",
//           borderRadius: "20px",
//           padding: "1px 10px",
//           fontSize: "12px",
//           fontWeight: 700,
//         }}
//       >
//         {count}
//       </span>
//     </div>
//   );
// }

// // ─── Empty state ──────────────────────────────────────────────
// function Empty({ msg }) {
//   return (
//     <div
//       style={{
//         textAlign: "center",
//         padding: "28px",
//         background: "#f8fafc",
//         borderRadius: "10px",
//         color: "#94a3b8",
//         fontSize: "14px",
//         border: "1px dashed #e2e8f0",
//       }}
//     >
//       📭 {msg}
//     </div>
//   );
// }

// // ─── Main component ───────────────────────────────────────────
// export default function AppointmentsTab({ showNotify }) {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterView, setFilterView] = useState("all"); // all | today | upcoming | past

//   const fetchAppointments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await api.get("/appointments");
//       setAppointments(Array.isArray(data) ? data : []);
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     } finally {
//       setLoading(false);
//     }
//   }, [showNotify]);

//   useEffect(() => {
//     fetchAppointments();
//   }, [fetchAppointments]);

//   // Auto-refresh every 60 seconds
//   useEffect(() => {
//     const t = setInterval(fetchAppointments, 60000);
//     return () => clearInterval(t);
//   }, [fetchAppointments]);

//   async function handleStatusChange(id, status) {
//     try {
//       const updated = await api.put(`/appointments/${id}/status`, { status });
//       // api.put maps to PATCH — but our api.js only has put(); use fetch directly for PATCH
//       setAppointments((prev) =>
//         prev.map((a) => (a._id === id ? { ...a, status } : a)),
//       );
//       showNotify("Updated", `Status set to ${STATUS_CONFIG[status].label}`);
//     } catch (err) {
//       // fallback direct PATCH
//       try {
//         const BASE =
//           process.env.REACT_APP_API_URL || "http://localhost:5000/api";
//         const token = localStorage.getItem("pearlsmile_token");
//         const res = await fetch(`${BASE}/appointments/${id}/status`, {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status }),
//         });
//         if (!res.ok) throw new Error("Update failed");
//         setAppointments((prev) =>
//           prev.map((a) => (a._id === id ? { ...a, status } : a)),
//         );
//         showNotify("Updated", `Status set to ${STATUS_CONFIG[status].label}`);
//       } catch (e) {
//         showNotify("Error", e.message, true);
//       }
//     }
//   }

//   async function handleDelete(id) {
//     if (!window.confirm("Delete this appointment permanently?")) return;
//     try {
//       const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
//       const token = localStorage.getItem("pearlsmile_token");
//       const res = await fetch(`${BASE}/appointments/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Delete failed");
//       setAppointments((prev) => prev.filter((a) => a._id !== id));
//       showNotify("Deleted", "Appointment removed successfully.");
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   }

//   // ── Filter pipeline ────────────────────────────────────────
//   const filtered = appointments.filter((a) => {
//     const q = search.toLowerCase();
//     const matchSearch =
//       !q ||
//       a.name.toLowerCase().includes(q) ||
//       a.phone.includes(q) ||
//       a.service.toLowerCase().includes(q);
//     const matchStatus = filterStatus === "all" || a.status === filterStatus;
//     const matchView =
//       filterView === "all"
//         ? true
//         : filterView === "today"
//           ? isToday(a.date)
//           : filterView === "upcoming"
//             ? isUpcoming(a.date)
//             : filterView === "past"
//               ? isPast(a.date)
//               : true;
//     return matchSearch && matchStatus && matchView;
//   });

//   // ── Grouped for "all" view ─────────────────────────────────
//   const todayList = filtered.filter((a) => isToday(a.date));
//   const upcomingList = filtered
//     .filter((a) => isUpcoming(a.date))
//     .sort((a, b) => a.date.localeCompare(b.date));
//   const pastList = filtered
//     .filter((a) => isPast(a.date))
//     .sort((a, b) => b.date.localeCompare(a.date));

//   // ── Stats ──────────────────────────────────────────────────
//   const stats = {
//     total: appointments.length,
//     today: appointments.filter((a) => isToday(a.date)).length,
//     pending: appointments.filter((a) => a.status === "pending").length,
//     confirmed: appointments.filter((a) => a.status === "confirmed").length,
//     completed: appointments.filter((a) => a.status === "completed").length,
//     upcoming: appointments.filter((a) => isUpcoming(a.date)).length,
//   };

//   return (
//     <div style={{ padding: "0 0 40px" }}>
//       {/* ── Stats bar ─────────────────────────────────────── */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
//           gap: "10px",
//           marginBottom: "24px",
//         }}
//       >
//         {[
//           { label: "Total", value: stats.total, color: "#6366f1" },
//           { label: "Today", value: stats.today, color: "#f59e0b" },
//           { label: "Upcoming", value: stats.upcoming, color: "#2563eb" },
//           { label: "Pending", value: stats.pending, color: "#f59e0b" },
//           { label: "Confirmed", value: stats.confirmed, color: "#2563eb" },
//           { label: "Completed", value: stats.completed, color: "#16a34a" },
//         ].map((s) => (
//           <div
//             key={s.label}
//             style={{
//               background: "#fff",
//               border: `1px solid #e5e7eb`,
//               borderTop: `3px solid ${s.color}`,
//               borderRadius: "8px",
//               padding: "12px",
//               textAlign: "center",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//             }}
//           >
//             <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>
//               {s.value}
//             </div>
//             <div
//               style={{
//                 fontSize: "11px",
//                 color: "#94a3b8",
//                 fontWeight: 600,
//                 marginTop: "2px",
//               }}
//             >
//               {s.label}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ── Controls ──────────────────────────────────────── */}
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: "10px",
//           marginBottom: "18px",
//           alignItems: "center",
//         }}
//       >
//         {/* Search */}
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="🔍 Search by name, phone, service…"
//           style={{
//             flex: "1 1 220px",
//             padding: "9px 14px",
//             borderRadius: "8px",
//             border: "1px solid #d1d5db",
//             fontSize: "13px",
//             outline: "none",
//           }}
//         />

//         {/* Status filter */}
//         <select
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value)}
//           style={{
//             padding: "9px 12px",
//             borderRadius: "8px",
//             border: "1px solid #d1d5db",
//             fontSize: "13px",
//             cursor: "pointer",
//           }}
//         >
//           <option value="all">All Statuses</option>
//           {Object.entries(STATUS_CONFIG).map(([k, c]) => (
//             <option key={k} value={k}>
//               {c.icon} {c.label}
//             </option>
//           ))}
//         </select>

//         {/* View filter */}
//         {["all", "today", "upcoming", "past"].map((v) => (
//           <button
//             key={v}
//             onClick={() => setFilterView(v)}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "8px",
//               fontSize: "12px",
//               fontWeight: 600,
//               cursor: "pointer",
//               border: "1px solid #d1d5db",
//               background: filterView === v ? "#1e40af" : "#fff",
//               color: filterView === v ? "#fff" : "#374151",
//             }}
//           >
//             {v === "all" ? "All Dates" : v.charAt(0).toUpperCase() + v.slice(1)}
//           </button>
//         ))}

//         {/* Refresh */}
//         <button
//           onClick={fetchAppointments}
//           style={{
//             padding: "8px 14px",
//             borderRadius: "8px",
//             border: "1px solid #d1d5db",
//             background: "#f8fafc",
//             fontSize: "12px",
//             cursor: "pointer",
//             fontWeight: 600,
//             color: "#374151",
//           }}
//         >
//           🔄 Refresh
//         </button>
//       </div>

//       {/* ── Content ───────────────────────────────────────── */}
//       {loading ? (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "40px",
//             color: "#94a3b8",
//             fontSize: "15px",
//           }}
//         >
//           ⏳ Loading appointments…
//         </div>
//       ) : filtered.length === 0 ? (
//         <Empty msg="No appointments found for selected filters." />
//       ) : filterView !== "all" ? (
//         // Single flat list when a specific view is selected
//         <>
//           {filtered.map((a) => (
//             <AppointmentCard
//               key={a._id}
//               appt={a}
//               onStatusChange={handleStatusChange}
//               onDelete={handleDelete}
//             />
//           ))}
//         </>
//       ) : (
//         // Grouped view
//         <>
//           {/* TODAY */}
//           <SectionHead
//             title="📅 Today's Appointments"
//             count={todayList.length}
//             accent="#f59e0b"
//           />
//           {todayList.length === 0 ? (
//             <Empty msg="No appointments scheduled for today." />
//           ) : (
//             todayList.map((a) => (
//               <AppointmentCard
//                 key={a._id}
//                 appt={a}
//                 onStatusChange={handleStatusChange}
//                 onDelete={handleDelete}
//               />
//             ))
//           )}

//           {/* UPCOMING */}
//           <SectionHead
//             title="🔜 Upcoming Appointments"
//             count={upcomingList.length}
//             accent="#2563eb"
//           />
//           {upcomingList.length === 0 ? (
//             <Empty msg="No upcoming appointments." />
//           ) : (
//             upcomingList.map((a) => (
//               <AppointmentCard
//                 key={a._id}
//                 appt={a}
//                 onStatusChange={handleStatusChange}
//                 onDelete={handleDelete}
//               />
//             ))
//           )}

//           {/* PAST */}
//           <SectionHead
//             title="📂 Past Appointments"
//             count={pastList.length}
//             accent="#6b7280"
//           />
//           {pastList.length === 0 ? (
//             <Empty msg="No past appointment records." />
//           ) : (
//             pastList.map((a) => (
//               <AppointmentCard
//                 key={a._id}
//                 appt={a}
//                 onStatusChange={handleStatusChange}
//                 onDelete={handleDelete}
//               />
//             ))
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// ============================================================
// src/components/admin/AppointmentsTab.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const HOSPITAL_NAME = "PearlSmile Dental Hospital";

// ---- Status config ------------------------------------------
const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Confirmed", color: "#2563eb", bg: "#eff6ff" },
  completed: { label: "Completed", color: "#16a34a", bg: "#f0fdf4" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2" },
};

// ---- Date helpers -------------------------------------------
function toDateStr(d) {
  return d ? d.trim() : "";
}

function todayStr() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function friendlyDate(dateStr) {
  if (!dateStr) return "--";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(dateStr + "T00:00:00");
    if (!isNaN(d))
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  }
  return dateStr;
}

function isToday(dateStr) {
  return toDateStr(dateStr) === todayStr();
}
function isPast(dateStr) {
  return toDateStr(dateStr) < todayStr();
}
function isUpcoming(dateStr) {
  return toDateStr(dateStr) > todayStr();
}

// ---- WhatsApp helpers ---------------------------------------
function waNumber(phone) {
  const num = phone.replace(/\D/g, "");
  return num.startsWith("91") ? num : "91" + num;
}

function waLink(phone) {
  return `https://wa.me/${waNumber(phone)}`;
}

function buildWaConfirmUrl(appt) {
  const msg =
    `Hello ${appt.name}!\n\n` +
    `Your appointment at *${HOSPITAL_NAME}* has been *Confirmed*.\n\n` +
    `Date    : ${friendlyDate(appt.date)}\n` +
    `Time    : ${appt.time || "As scheduled"}\n` +
    `Service : ${appt.service}\n\n` +
    `Please arrive 10 minutes early. We look forward to seeing you!\n\n` +
    `-- ${HOSPITAL_NAME}`;
  return `https://wa.me/${waNumber(appt.phone)}?text=${encodeURIComponent(msg)}`;
}

function buildWaCancelUrl(appt) {
  const msg =
    `Hello ${appt.name},\n\n` +
    `We regret to inform you that your appointment at *${HOSPITAL_NAME}* ` +
    `scheduled for *${friendlyDate(appt.date)}* (${appt.time || "as scheduled"}) ` +
    `has been *Cancelled*.\n\n` +
    `We apologise for the inconvenience. Please call us or book a new appointment ` +
    `at your convenience.\n\n` +
    `-- ${HOSPITAL_NAME}`;
  return `https://wa.me/${waNumber(appt.phone)}?text=${encodeURIComponent(msg)}`;
}

// ---- PATCH status (PATCH not in api.js) ---------------------
async function patchStatus(id, status) {
  const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("pearlsmile_token");
  const res = await fetch(`${BASE}/appointments/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Status update failed");
  return res.json();
}

// ---- Shared styles ------------------------------------------
const labelStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  marginRight: "4px",
};
const valStyle = { fontSize: "13px", color: "#334155", fontWeight: 500 };

// ---- WhatsApp Send Queue Panel ------------------------------
// Shows after bulk action — one tap per patient to open their WhatsApp
function WaSendQueuePanel({ queue, onClose }) {
  const [sent, setSent] = useState({});

  if (!queue || queue.length === 0) return null;

  const allSent = queue.every((item) => sent[item.appt._id]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b" }}
            >
              Send WhatsApp Messages
            </div>
            <div
              style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}
            >
              Tap each button to send message to that patient individually
            </div>
          </div>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            {Object.keys(sent).length} / {queue.length} sent
          </div>
        </div>

        {/* Patient list */}
        <div style={{ overflowY: "auto", padding: "14px 20px", flex: 1 }}>
          {queue.map((item, idx) => {
            const isSent = !!sent[item.appt._id];
            return (
              <div
                key={item.appt._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: isSent ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${isSent ? "#bbf7d0" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  marginBottom: idx < queue.length - 1 ? "8px" : "0",
                  gap: "12px",
                }}
              >
                {/* Patient info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#1e293b",
                    }}
                  >
                    {item.appt.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {item.appt.phone} &nbsp;|&nbsp;{" "}
                    {friendlyDate(item.appt.date)}
                  </div>
                </div>

                {/* Send / Sent button */}
                {isSent ? (
                  <div
                    style={{
                      padding: "7px 16px",
                      borderRadius: "8px",
                      background: "#dcfce7",
                      color: "#16a34a",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid #86efac",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sent
                  </div>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      setSent((prev) => ({ ...prev, [item.appt._id]: true }))
                    }
                    style={{
                      padding: "7px 16px",
                      borderRadius: "8px",
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                      border: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
                    }}
                  >
                    Send on WhatsApp
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {!allSent && (
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                alignSelf: "center",
                flex: 1,
              }}
            >
              Tap each "Send on WhatsApp" to message that patient
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "8px 22px",
              borderRadius: "8px",
              background: allSent ? "#2563eb" : "#f1f5f9",
              color: allSent ? "#fff" : "#374151",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {allSent ? "Done" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Single appointment card --------------------------------
function AppointmentCard({ appt, onStatusChange, onDelete }) {
  const [changing, setChanging] = useState(false);
  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

  async function handleStatus(newStatus) {
    if (newStatus === appt.status) return;
    setChanging(true);
    await onStatusChange(appt._id, newStatus, appt);
    setChanging(false);
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: "10px",
        padding: "16px 18px",
        marginBottom: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
            {appt.name}
          </span>
          <span
            style={{
              display: "inline-block",
              marginLeft: "10px",
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.color}`,
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 10px",
            }}
          >
            {cfg.label}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Booked: {new Date(appt.createdAt).toLocaleDateString("en-IN")}
        </div>
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "6px 16px",
          marginTop: "10px",
        }}
      >
        <div>
          <span style={labelStyle}>Date</span>
          <span style={valStyle}>{friendlyDate(appt.date)}</span>
        </div>
        <div>
          <span style={labelStyle}>Time</span>
          <span style={valStyle}>{appt.time || "Not specified"}</span>
        </div>
        <div>
          <span style={labelStyle}>Service</span>
          <span style={valStyle}>{appt.service}</span>
        </div>
        <div>
          <span style={labelStyle}>Phone</span>
          <a
            href={waLink(appt.phone)}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#16a34a",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            {appt.phone}
          </a>
        </div>
      </div>

      {/* Message */}
      {appt.message && (
        <div
          style={{
            marginTop: "8px",
            background: "#f8fafc",
            borderRadius: "6px",
            padding: "8px 10px",
            fontSize: "13px",
            color: "#475569",
          }}
        >
          <span style={{ fontWeight: 600 }}>Note: </span>
          {appt.message}
        </div>
      )}

      {/* Actions row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "12px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          Status:
        </span>

        {Object.entries(STATUS_CONFIG).map(([key, c]) => (
          <button
            key={key}
            disabled={changing || appt.status === key}
            onClick={() => handleStatus(key)}
            style={{
              padding: "4px 10px",
              borderRadius: "14px",
              border: `1px solid ${c.color}`,
              background: appt.status === key ? c.color : "#fff",
              color: appt.status === key ? "#fff" : c.color,
              fontSize: "11px",
              fontWeight: 600,
              cursor: appt.status === key ? "default" : "pointer",
              opacity: changing ? 0.6 : 1,
            }}
          >
            {c.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <a
            href={waLink(appt.phone)}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              background: "#dcfce7",
              color: "#16a34a",
              border: "1px solid #16a34a",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            WhatsApp
          </a>
          <button
            onClick={() => onDelete(appt._id)}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #dc2626",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Section header with Confirm All / Cancel All -----------
function SectionHead({
  title,
  count,
  accent,
  list,
  onBulkConfirm,
  onBulkCancel,
  showBulk,
}) {
  const [busyConfirm, setBusyConfirm] = useState(false);
  const [busyCancel, setBusyCancel] = useState(false);

  const confirmable = (list || []).filter(
    (a) =>
      a.status !== "confirmed" &&
      a.status !== "completed" &&
      a.status !== "cancelled",
  );
  const cancellable = (list || []).filter(
    (a) => a.status !== "cancelled" && a.status !== "completed",
  );

  async function handleConfirmAll() {
    if (!confirmable.length) return;
    if (
      !window.confirm(
        `Confirm all ${confirmable.length} appointment(s)? A send panel will open so you can message each patient on WhatsApp.`,
      )
    )
      return;
    setBusyConfirm(true);
    await onBulkConfirm(confirmable);
    setBusyConfirm(false);
  }

  async function handleCancelAll() {
    if (!cancellable.length) return;
    if (
      !window.confirm(
        `Cancel all ${cancellable.length} appointment(s)? A send panel will open so you can message each patient on WhatsApp.`,
      )
    )
      return;
    setBusyCancel(true);
    await onBulkCancel(cancellable);
    setBusyCancel(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        margin: "24px 0 12px",
        borderBottom: `2px solid ${accent}`,
        paddingBottom: "10px",
      }}
    >
      <span style={{ fontSize: "17px", fontWeight: 700, color: accent }}>
        {title}
      </span>
      <span
        style={{
          background: accent,
          color: "#fff",
          borderRadius: "20px",
          padding: "1px 10px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {count}
      </span>

      {showBulk && (list || []).length > 0 && (
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={handleConfirmAll}
            disabled={busyConfirm || confirmable.length === 0}
            style={{
              padding: "6px 18px",
              borderRadius: "20px",
              border: "none",
              background: confirmable.length === 0 ? "#e5e7eb" : "#2563eb",
              color: confirmable.length === 0 ? "#9ca3af" : "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: confirmable.length === 0 ? "default" : "pointer",
              opacity: busyConfirm ? 0.6 : 1,
              boxShadow:
                confirmable.length > 0
                  ? "0 2px 6px rgba(37,99,235,0.3)"
                  : "none",
            }}
          >
            {busyConfirm
              ? "Processing..."
              : `Confirm All (${confirmable.length})`}
          </button>

          <button
            onClick={handleCancelAll}
            disabled={busyCancel || cancellable.length === 0}
            style={{
              padding: "6px 18px",
              borderRadius: "20px",
              border: "none",
              background: cancellable.length === 0 ? "#e5e7eb" : "#dc2626",
              color: cancellable.length === 0 ? "#9ca3af" : "#fff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: cancellable.length === 0 ? "default" : "pointer",
              opacity: busyCancel ? 0.6 : 1,
              boxShadow:
                cancellable.length > 0
                  ? "0 2px 6px rgba(220,38,38,0.3)"
                  : "none",
            }}
          >
            {busyCancel
              ? "Processing..."
              : `Cancel All (${cancellable.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Empty state --------------------------------------------
function Empty({ msg }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "28px",
        background: "#f8fafc",
        borderRadius: "10px",
        color: "#94a3b8",
        fontSize: "14px",
        border: "1px dashed #e2e8f0",
      }}
    >
      {msg}
    </div>
  );
}

// ---- Main component -----------------------------------------
export default function AppointmentsTab({ showNotify }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterView, setFilterView] = useState("all");

  // WhatsApp send queue — shown after bulk action
  const [waQueue, setWaQueue] = useState(null); // null | [ { appt, url } ]

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotify("Error", err.message, true);
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const t = setInterval(fetchAppointments, 60000);
    return () => clearInterval(t);
  }, [fetchAppointments]);

  // ---- Single status change + direct WhatsApp ---------------
  async function handleStatusChange(id, status, appt) {
    try {
      await patchStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a)),
      );
      showNotify("Updated", `Status set to ${STATUS_CONFIG[status].label}`);
      // Single card — open WhatsApp directly (user clicked, so popup allowed)
      if (status === "confirmed") {
        window.open(buildWaConfirmUrl(appt), "_blank");
      }
      if (status === "cancelled") {
        window.open(buildWaCancelUrl(appt), "_blank");
      }
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  }

  // ---- Bulk confirm — update DB then show send queue --------
  async function handleBulkConfirm(list) {
    // 1. Update all statuses in DB
    const updated = [];
    for (const appt of list) {
      try {
        await patchStatus(appt._id, "confirmed");
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === appt._id ? { ...a, status: "confirmed" } : a,
          ),
        );
        updated.push(appt);
      } catch (_) {}
    }
    showNotify("Confirm All", `${updated.length} appointment(s) confirmed.`);

    // 2. Build queue and show the send panel
    const queue = updated.map((appt) => ({
      appt,
      url: buildWaConfirmUrl(appt),
    }));
    setWaQueue(queue);
  }

  // ---- Bulk cancel — update DB then show send queue ---------
  async function handleBulkCancel(list) {
    const updated = [];
    for (const appt of list) {
      try {
        await patchStatus(appt._id, "cancelled");
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === appt._id ? { ...a, status: "cancelled" } : a,
          ),
        );
        updated.push(appt);
      } catch (_) {}
    }
    showNotify("Cancel All", `${updated.length} appointment(s) cancelled.`);

    const queue = updated.map((appt) => ({
      appt,
      url: buildWaCancelUrl(appt),
    }));
    setWaQueue(queue);
  }

  // ---- Delete -----------------------------------------------
  async function handleDelete(id) {
    if (!window.confirm("Delete this appointment permanently?")) return;
    try {
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("pearlsmile_token");
      const res = await fetch(`${BASE}/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      showNotify("Deleted", "Appointment removed successfully.");
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  }

  // ---- Filter pipeline --------------------------------------
  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.service.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchView =
      filterView === "all"
        ? true
        : filterView === "today"
          ? isToday(a.date)
          : filterView === "upcoming"
            ? isUpcoming(a.date)
            : filterView === "past"
              ? isPast(a.date)
              : true;
    return matchSearch && matchStatus && matchView;
  });

  const todayList = filtered.filter((a) => isToday(a.date));
  const upcomingList = filtered
    .filter((a) => isUpcoming(a.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastList = filtered
    .filter((a) => isPast(a.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  const stats = {
    total: appointments.length,
    today: appointments.filter((a) => isToday(a.date)).length,
    upcoming: appointments.filter((a) => isUpcoming(a.date)).length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* WhatsApp Send Queue Panel (modal) */}
      {waQueue && (
        <WaSendQueuePanel queue={waQueue} onClose={() => setWaQueue(null)} />
      )}

      {/* ---- Stats bar --------------------------------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total", value: stats.total, color: "#6366f1" },
          { label: "Today", value: stats.today, color: "#f59e0b" },
          { label: "Upcoming", value: stats.upcoming, color: "#2563eb" },
          { label: "Pending", value: stats.pending, color: "#f59e0b" },
          { label: "Confirmed", value: stats.confirmed, color: "#2563eb" },
          { label: "Completed", value: stats.completed, color: "#16a34a" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderTop: `3px solid ${s.color}`,
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                fontWeight: 600,
                marginTop: "2px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Controls --------------------------------------- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, service..."
          style={{
            flex: "1 1 220px",
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "13px",
            outline: "none",
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, c]) => (
            <option key={k} value={k}>
              {c.label}
            </option>
          ))}
        </select>

        {["all", "today", "upcoming", "past"].map((v) => (
          <button
            key={v}
            onClick={() => setFilterView(v)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #d1d5db",
              background: filterView === v ? "#1e40af" : "#fff",
              color: filterView === v ? "#fff" : "#374151",
            }}
          >
            {v === "all" ? "All Dates" : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}

        <button
          onClick={fetchAppointments}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#f8fafc",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Refresh
        </button>
      </div>

      {/* ---- Content ----------------------------------------- */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          Loading appointments...
        </div>
      ) : filtered.length === 0 ? (
        <Empty msg="No appointments found for selected filters." />
      ) : filterView !== "all" ? (
        <>
          {filtered.map((a) => (
            <AppointmentCard
              key={a._id}
              appt={a}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </>
      ) : (
        <>
          {/* TODAY */}
          <SectionHead
            title="Today's Appointments"
            count={todayList.length}
            accent="#f59e0b"
            list={todayList}
            onBulkConfirm={handleBulkConfirm}
            onBulkCancel={handleBulkCancel}
            showBulk={true}
          />
          {todayList.length === 0 ? (
            <Empty msg="No appointments scheduled for today." />
          ) : (
            todayList.map((a) => (
              <AppointmentCard
                key={a._id}
                appt={a}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* UPCOMING */}
          <SectionHead
            title="Upcoming Appointments"
            count={upcomingList.length}
            accent="#2563eb"
            list={upcomingList}
            onBulkConfirm={handleBulkConfirm}
            onBulkCancel={handleBulkCancel}
            showBulk={true}
          />
          {upcomingList.length === 0 ? (
            <Empty msg="No upcoming appointments." />
          ) : (
            upcomingList.map((a) => (
              <AppointmentCard
                key={a._id}
                appt={a}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* PAST — no bulk buttons */}
          <SectionHead
            title="Past Appointments"
            count={pastList.length}
            accent="#6b7280"
            list={pastList}
            showBulk={false}
          />
          {pastList.length === 0 ? (
            <Empty msg="No past appointment records." />
          ) : (
            pastList.map((a) => (
              <AppointmentCard
                key={a._id}
                appt={a}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
