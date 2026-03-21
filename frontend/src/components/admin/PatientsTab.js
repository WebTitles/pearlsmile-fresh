// // ============================================================
// // src/components/admin/PatientsTab.js
// // ============================================================
// import React, { useState, useEffect, useCallback } from "react";
// import api from "../../utils/api";

// const SERVICES_LIST = [
//   "General Checkup & Cleaning",
//   "Cosmetic Dentistry / Smile Makeover",
//   "Dental Implants",
//   "Orthodontics / Invisalign",
//   "Root Canal Therapy",
//   "Pediatric Dentistry",
//   "Oral Surgery",
//   "Periodontal Treatment",
//   "Teeth Whitening",
//   "Emergency Dental Care",
//   "Follow-Up Visit",
//   "Other",
// ];

// const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];
// const MONTHS_SHORT = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// function fmtDate(dateStr) {
//   if (!dateStr) return "";
//   const d = new Date(dateStr + "T00:00:00");
//   return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
// }

// function fmtDateShort(dateStr) {
//   if (!dateStr) return "";
//   const d = new Date(dateStr + "T00:00:00");
//   return d.getDate() + " " + MONTHS_SHORT[d.getMonth()] + " " + d.getFullYear();
// }

// function fmtTime(t) {
//   if (!t) return "";
//   const parts = t.split(":");
//   const hh = parseInt(parts[0]),
//     mm = parts[1];
//   return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
// }

// function totalRevenue(visits = []) {
//   return visits.reduce((sum, v) => {
//     const n = parseFloat((v.amount || "0").toString().replace(/[^0-9.]/g, ""));
//     return sum + (isNaN(n) ? 0 : n);
//   }, 0);
// }

// export default function PatientsTab({ showNotify, doctor }) {
//   const [patients, setPatients] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showNewForm, setShowNewForm] = useState(false);
//   const [newPat, setNewPat] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     age: "",
//     gender: "",
//     blood: "",
//   });
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [rxModal, setRxModal] = useState(null);

//   const today = new Date().toISOString().split("T")[0];
//   const nowTime = new Date().toTimeString().slice(0, 5);
//   const [visitForm, setVisitForm] = useState({
//     date: today,
//     time: nowTime,
//     service: "",
//     amount: "",
//     nextVisitDate: "",
//     notes: "",
//   });

//   const loadPatients = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await api.get("/patients");
//       setPatients(data);
//       setFiltered(data);
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     loadPatients();
//   }, [loadPatients]);

//   const filterPatients = (q) => {
//     const term = q.toLowerCase();
//     setFiltered(
//       patients.filter(
//         (p) =>
//           (p.name || "").toLowerCase().includes(term) ||
//           (p.mobile || "").includes(term) ||
//           (p.email || "").toLowerCase().includes(term),
//       ),
//     );
//   };

//   const createPatient = async () => {
//     if (!newPat.name.trim()) {
//       showNotify("Error", "Patient name is required.", true);
//       return;
//     }
//     if (!newPat.mobile.trim()) {
//       showNotify("Error", "Mobile number is required.", true);
//       return;
//     }
//     try {
//       await api.post("/patients", newPat);
//       setNewPat({
//         name: "",
//         mobile: "",
//         email: "",
//         age: "",
//         gender: "",
//         blood: "",
//       });
//       setShowNewForm(false);
//       showNotify(
//         "Patient Profile Created! ✓",
//         "New profile for " + newPat.name + " saved.",
//       );
//       loadPatients();
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   };

//   const openPatient = async (p) => {
//     try {
//       const full = await api.get("/patients/" + p._id);
//       setSelectedPatient(full);
//       setVisitForm({
//         date: today,
//         time: nowTime,
//         service: "",
//         amount: "",
//         nextVisitDate: "",
//         notes: "",
//       });
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   };

//   const deletePatient = async () => {
//     if (
//       !window.confirm(
//         "Delete this patient profile and all their records? This cannot be undone.",
//       )
//     )
//       return;
//     try {
//       await api.delete("/patients/" + selectedPatient._id);
//       showNotify("Profile Deleted", "Patient profile removed.");
//       setSelectedPatient(null);
//       loadPatients();
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   };

//   const saveVisit = async () => {
//     if (!visitForm.date) {
//       showNotify("Missing Fields", "Please select a visit date.", true);
//       return;
//     }
//     if (!visitForm.service) {
//       showNotify("Missing Fields", "Please select a service.", true);
//       return;
//     }
//     try {
//       const payload = {
//         visitDate: visitForm.date,
//         visitTime: visitForm.time,
//         service: visitForm.service,
//         amount: visitForm.amount,
//         nextVisitDate: visitForm.nextVisitDate,
//         notes: visitForm.notes,
//         doctor: doctor?.name || "",
//         prescription: { medicineRows: [] },
//       };
//       const updated = await api.post(
//         "/patients/" + selectedPatient._id + "/visits",
//         payload,
//       );
//       setSelectedPatient(updated);
//       setVisitForm({
//         date: today,
//         time: nowTime,
//         service: "",
//         amount: "",
//         nextVisitDate: "",
//         notes: "",
//       });

//       // Follow-up WhatsApp if notes contain "follow-up" and nextVisitDate is set
//       const isFollowUp = /follow[\s\-]?up/i.test(visitForm.notes);
//       if (isFollowUp && visitForm.nextVisitDate && selectedPatient.mobile) {
//         let rawMobile = (selectedPatient.mobile || "").replace(
//           /[\s\-\(\)\+]/g,
//           "",
//         );
//         if (!rawMobile.startsWith("91") && rawMobile.length === 10)
//           rawMobile = "91" + rawMobile;
//         const waMsg = `*PearlSmile Dental Hospital* — Follow-Up Reminder\n\nDear ${selectedPatient.name},\nThis is a reminder for your follow-up appointment.\n\n*Service:* ${visitForm.service}\n*Next Visit:* ${fmtDate(visitForm.nextVisitDate)}\n\nPlease call us to confirm your appointment.\n📞 +91 87936 08083`;
//         setTimeout(
//           () =>
//             window.open(
//               "https://wa.me/" +
//                 rawMobile +
//                 "?text=" +
//                 encodeURIComponent(waMsg),
//               "_blank",
//             ),
//           500,
//         );
//         showNotify(
//           "Visit Saved + Follow-Up WhatsApp Sent!",
//           "Reminder sent to " +
//             selectedPatient.name +
//             " for " +
//             fmtDate(visitForm.nextVisitDate) +
//             ".",
//         );
//       } else {
//         showNotify(
//           "Visit Record Saved! ✓",
//           "Patient visit has been recorded successfully.",
//         );
//       }
//       loadPatients();
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   };

//   const deleteVisit = async (visitId) => {
//     if (!window.confirm("Delete this visit record?")) return;
//     try {
//       const result = await api.delete(
//         "/patients/" + selectedPatient._id + "/visits/" + visitId,
//       );
//       setSelectedPatient(result.patient);
//       showNotify("Visit Deleted", "Visit record removed.");
//       loadPatients();
//     } catch (err) {
//       showNotify("Error", err.message, true);
//     }
//   };

//   const sendPrescription = (visit) => {
//     setRxModal({ visit, patient: selectedPatient, doctor });
//   };

//   // ── LIST VIEW ─────────────────────────────────────────────────
//   if (!selectedPatient) {
//     return (
//       <div>
//         <div className="admin-section-title">Patient Profiles</div>
//         <div className="admin-section-desc">
//           Create and manage individual patient profiles. Click a profile to view
//           visit history and add new records.
//         </div>

//         <div className="patients-list-view">
//           <input
//             type="text"
//             className="patient-search-bar"
//             placeholder="🔍 Search patients by name or phone..."
//             onChange={(e) => filterPatients(e.target.value)}
//           />

//           {showNewForm && (
//             <div className="new-patient-form">
//               <h4>➕ Create New Patient Profile</h4>
//               <div className="new-patient-grid">
//                 {[
//                   ["name", "text", "Full Name *", "Patient full name"],
//                   ["mobile", "tel", "Mobile Number *", "+91 98765 43210"],
//                   ["email", "email", "Email Address", "patient@email.com"],
//                   ["age", "number", "Age", "Age"],
//                 ].map(([k, t, label, ph]) => (
//                   <div key={k}>
//                     <div className="admin-row-label">{label}</div>
//                     <input
//                       type={t}
//                       placeholder={ph}
//                       value={newPat[k]}
//                       onChange={(e) =>
//                         setNewPat((p) => ({ ...p, [k]: e.target.value }))
//                       }
//                     />
//                   </div>
//                 ))}
//                 <div>
//                   <div className="admin-row-label">Gender</div>
//                   <select
//                     value={newPat.gender}
//                     onChange={(e) =>
//                       setNewPat((p) => ({ ...p, gender: e.target.value }))
//                     }
//                   >
//                     <option value="">Select Gender</option>
//                     <option>Male</option>
//                     <option>Female</option>
//                     <option>Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <div className="admin-row-label">Blood Group</div>
//                   <input
//                     type="text"
//                     placeholder="e.g. B+"
//                     value={newPat.blood}
//                     onChange={(e) =>
//                       setNewPat((p) => ({ ...p, blood: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//               <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                 <button className="add-visit-save-btn" onClick={createPatient}>
//                   💾 Save Patient Profile
//                 </button>
//                 <button
//                   className="btn-back-patients"
//                   onClick={() => setShowNewForm(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: 14,
//               flexWrap: "wrap",
//               gap: 10,
//             }}
//           >
//             <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
//               {loading
//                 ? "Loading patients..."
//                 : `${filtered.length} patient profile${filtered.length !== 1 ? "s" : ""}`}
//             </div>
//             <button
//               className="admin-add-btn"
//               onClick={() => setShowNewForm((s) => !s)}
//             >
//               {showNewForm ? "Cancel" : "+ New Patient Profile"}
//             </button>
//           </div>

//           <div className="patient-profiles-grid">
//             {loading ? (
//               <div
//                 style={{
//                   color: "var(--gray-400)",
//                   fontSize: 14,
//                   padding: "20px 0",
//                   gridColumn: "1/-1",
//                 }}
//               >
//                 Loading...
//               </div>
//             ) : filtered.length === 0 ? (
//               <div
//                 style={{
//                   color: "var(--gray-400)",
//                   fontSize: 14,
//                   padding: "24px 0",
//                   gridColumn: "1/-1",
//                   textAlign: "center",
//                 }}
//               >
//                 No patients yet. Click "+ New Patient Profile" to add your first
//                 patient.
//               </div>
//             ) : (
//               filtered.map((p) => (
//                 <div
//                   key={p._id}
//                   className="patient-profile-card"
//                   onClick={() => openPatient(p)}
//                 >
//                   <div className="patient-avatar-icon">🧑‍⚕️</div>
//                   <div className="patient-card-name">{p.name}</div>
//                   <div className="patient-card-id">📞 {p.mobile || "—"}</div>
//                   <div className="patient-card-visits">
//                     📋 {p.visitCount || 0} visit{p.visitCount !== 1 ? "s" : ""}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── DETAIL VIEW ───────────────────────────────────────────────
//   const p = selectedPatient;
//   const visits = p.visits || [];
//   const total = totalRevenue(visits);

//   return (
//     <div>
//       <div className="patient-detail-view open">
//         <div className="patient-detail-header">
//           <button
//             className="btn-back-patients"
//             onClick={() => setSelectedPatient(null)}
//           >
//             ← Back to Patients
//           </button>
//           <div
//             className="patient-avatar-icon"
//             style={{ width: 56, height: 56, fontSize: 26 }}
//           >
//             🧑‍⚕️
//           </div>
//           <div style={{ flex: 1 }}>
//             <h3>{p.name}</h3>
//             <p style={{ fontSize: 13, color: "var(--gray-400)" }}>
//               {p.email}
//               {p.email && p.mobile ? " · " : ""}
//               {p.mobile}
//             </p>
//             <div className="patient-info-row">
//               {[
//                 p.age ? "Age: " + p.age : null,
//                 p.gender || null,
//                 p.blood ? "Blood: " + p.blood : null,
//               ]
//                 .filter(Boolean)
//                 .map((t, i) => (
//                   <span key={i} className="patient-info-pill">
//                     {t}
//                   </span>
//                 ))}
//             </div>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div
//               style={{
//                 fontSize: 11,
//                 color: "var(--gray-400)",
//                 letterSpacing: "0.5px",
//                 textTransform: "uppercase",
//                 marginBottom: 4,
//               }}
//             >
//               Total Revenue
//             </div>
//             <div
//               style={{
//                 fontFamily: "Cormorant Garamond,serif",
//                 fontSize: 26,
//                 fontWeight: 600,
//                 color: "var(--teal)",
//                 lineHeight: 1,
//               }}
//             >
//               Rs. {total.toLocaleString("en-IN")}
//             </div>
//             <div
//               style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}
//             >
//               {visits.length} visit{visits.length !== 1 ? "s" : ""}
//             </div>
//           </div>
//           <button
//             className="admin-del-btn"
//             onClick={deletePatient}
//             style={{ alignSelf: "flex-start", marginTop: 4 }}
//           >
//             🗑️ Delete Profile
//           </button>
//         </div>

//         {/* Add Visit Form — original simple layout */}
//         <div className="add-visit-form">
//           <h4>📋 Add New Visit Record</h4>
//           <div className="add-visit-grid">
//             <div>
//               <div className="admin-row-label">Visit Date *</div>
//               <input
//                 type="date"
//                 value={visitForm.date}
//                 onChange={(e) =>
//                   setVisitForm((f) => ({ ...f, date: e.target.value }))
//                 }
//               />
//             </div>
//             <div>
//               <div className="admin-row-label">Visit Time</div>
//               <input
//                 type="time"
//                 value={visitForm.time}
//                 onChange={(e) =>
//                   setVisitForm((f) => ({ ...f, time: e.target.value }))
//                 }
//               />
//             </div>
//             <div>
//               <div className="admin-row-label">Service Taken *</div>
//               <select
//                 value={visitForm.service}
//                 onChange={(e) =>
//                   setVisitForm((f) => ({ ...f, service: e.target.value }))
//                 }
//               >
//                 <option value="">Select Service</option>
//                 {SERVICES_LIST.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <div className="admin-row-label">Amount Charged (Rs.)</div>
//               <input
//                 type="text"
//                 placeholder="e.g. 2500"
//                 value={visitForm.amount}
//                 onChange={(e) =>
//                   setVisitForm((f) => ({ ...f, amount: e.target.value }))
//                 }
//               />
//             </div>
//             <div>
//               <div
//                 className="admin-row-label"
//                 style={{ display: "flex", alignItems: "center", gap: 6 }}
//               >
//                 Next Date to Visit
//                 <span
//                   style={{
//                     fontSize: 10,
//                     color: "var(--teal)",
//                     fontWeight: 400,
//                     background: "rgba(13,115,119,0.08)",
//                     padding: "2px 8px",
//                     borderRadius: 100,
//                     border: "1px solid rgba(13,115,119,0.2)",
//                   }}
//                 >
//                   For follow-up
//                 </span>
//               </div>
//               <input
//                 type="date"
//                 value={visitForm.nextVisitDate}
//                 onChange={(e) =>
//                   setVisitForm((f) => ({ ...f, nextVisitDate: e.target.value }))
//                 }
//                 style={{ marginTop: 6 }}
//               />
//             </div>
//           </div>
//           <div className="admin-row-label" style={{ marginBottom: 6 }}>
//             Doctor Notes / Diagnosis
//           </div>
//           <textarea
//             value={visitForm.notes}
//             onChange={(e) =>
//               setVisitForm((f) => ({ ...f, notes: e.target.value }))
//             }
//             placeholder="Enter observations, treatment given, prescription, follow-up advice... (type 'follow-up' to trigger WhatsApp reminder on Next Date to Visit)"
//           />
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               flexWrap: "wrap",
//               gap: 10,
//               marginTop: 4,
//             }}
//           >
//             <button className="add-visit-save-btn" onClick={saveVisit}>
//               💾 Save Visit Record
//             </button>
//           </div>
//         </div>

//         {/* Visit History */}
//         <div style={{ marginBottom: 12 }}>
//           <div className="admin-section-title" style={{ marginBottom: 8 }}>
//             Visit History
//           </div>
//           <div className="visit-records-list">
//             {visits.length === 0 ? (
//               <div
//                 style={{
//                   color: "var(--gray-400)",
//                   fontSize: 13,
//                   padding: "10px 0",
//                 }}
//               >
//                 No visits recorded yet. Add the first visit above.
//               </div>
//             ) : (
//               visits.map((v, i) => {
//                 const dtStr =
//                   (v.visitDate || "") +
//                   (v.visitTime ? " at " + v.visitTime : "");
//                 const isFollowUp = /follow[\s\-]?up/i.test(v.notes || "");
//                 return (
//                   <div key={v._id || i} className="visit-record-card">
//                     <button
//                       className="visit-del-btn"
//                       onClick={() => deleteVisit(v._id)}
//                       title="Delete"
//                     >
//                       ✕
//                     </button>
//                     <div className="visit-record-meta">
//                       <span className="visit-record-service">
//                         {v.service || "Visit"}
//                       </span>
//                       <span className="visit-record-date">📅 {dtStr}</span>
//                       {v.amount && (
//                         <span
//                           className="patient-info-pill"
//                           style={{ fontSize: 11 }}
//                         >
//                           Rs. {v.amount}
//                         </span>
//                       )}
//                     </div>
//                     <div className="visit-record-notes">{v.notes || "—"}</div>
//                     {v.nextVisitDate && (
//                       <div
//                         style={{
//                           marginTop: 8,
//                           display: "inline-flex",
//                           alignItems: "center",
//                           gap: 6,
//                           background: isFollowUp
//                             ? "rgba(201,168,76,0.12)"
//                             : "rgba(13,115,119,0.08)",
//                           border:
//                             "1px solid " +
//                             (isFollowUp
//                               ? "rgba(201,168,76,0.35)"
//                               : "rgba(13,115,119,0.2)"),
//                           borderRadius: 100,
//                           padding: "3px 12px",
//                           fontSize: 12,
//                           fontWeight: 500,
//                           color: isFollowUp ? "#8b6914" : "var(--teal)",
//                         }}
//                       >
//                         {isFollowUp ? "Follow-Up: " : "Next Visit: "}
//                         {fmtDateShort(v.nextVisitDate)}
//                         {isFollowUp ? " — WhatsApp sent" : ""}
//                       </div>
//                     )}
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 8,
//                         marginTop: 10,
//                       }}
//                     >
//                       <button
//                         onClick={() => sendPrescription(v)}
//                         style={{
//                           background: "linear-gradient(135deg,#0a1628,#1a3a6b)",
//                           color: "white",
//                           border: "none",
//                           borderRadius: 7,
//                           padding: "7px 14px",
//                           fontSize: 12,
//                           fontWeight: 500,
//                           cursor: "pointer",
//                           fontFamily: "'DM Sans',sans-serif",
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 6,
//                           transition: "opacity 0.2s",
//                         }}
//                         onMouseOver={(e) =>
//                           (e.currentTarget.style.opacity = "0.85")
//                         }
//                         onMouseOut={(e) =>
//                           (e.currentTarget.style.opacity = "1")
//                         }
//                       >
//                         <svg
//                           width="13"
//                           height="13"
//                           viewBox="0 0 24 24"
//                           fill="white"
//                         >
//                           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
//                           <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.857L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 0 1-5.028-1.382l-.36-.214-3.732.888.939-3.618-.235-.372A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
//                         </svg>
//                         Send Prescription
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>

//       {rxModal && (
//         <PrescriptionModal
//           visit={rxModal.visit}
//           patient={rxModal.patient}
//           doctor={rxModal.doctor}
//           onClose={() => setRxModal(null)}
//           showNotify={showNotify}
//         />
//       )}
//     </div>
//   );
// }

// // ── Prescription Modal — exact original PDF design ────────────
// function PrescriptionModal({ visit, patient, doctor, onClose, showNotify }) {
//   const [pdfUrl, setPdfUrl] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [pdfBlob, setPdfBlob] = useState(null);
//   const [rxMobile, setRxMobile] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [canNativeShare, setCanNativeShare] = useState(false);

//   useEffect(() => {
//     generatePDF();
//   }, []);

//   // Close on Escape
//   useEffect(() => {
//     const handler = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", handler);
//     return () => document.removeEventListener("keydown", handler);
//   }, [onClose]);

//   const fmtDateLocal = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr + "T00:00:00");
//     return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
//   };

//   const fmtTimeLocal = (t) => {
//     if (!t) return "";
//     const parts = t.split(":");
//     const hh = parseInt(parts[0]),
//       mm = parts[1];
//     return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
//   };

//   const generatePDF = () => {
//     if (window.jspdf) {
//       buildPDF();
//       return;
//     }
//     const existing = document.getElementById("jspdf-cdn");
//     if (existing) {
//       existing.addEventListener("load", buildPDF);
//       return;
//     }
//     const script = document.createElement("script");
//     script.id = "jspdf-cdn";
//     script.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
//     script.crossOrigin = "anonymous";
//     script.onload = buildPDF;
//     script.onerror = () => setLoading(false);
//     document.head.appendChild(script);
//   };

//   const buildPDF = () => {
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF({
//       unit: "mm",
//       format: "a4",
//       orientation: "portrait",
//     });
//     const W = 210,
//       H = 297;

//     const sf = (c) => pdf.setFillColor(c[0], c[1], c[2]);
//     const sd = (c) => pdf.setDrawColor(c[0], c[1], c[2]);
//     const st = (c) => pdf.setTextColor(c[0], c[1], c[2]);

//     const NAVY = [8, 25, 65],
//       BLUE = [20, 80, 160],
//       BLUE2 = [40, 110, 190];
//     const LBLUE = [210, 228, 248],
//       LBLUE2 = [232, 242, 252],
//       MIDBLUE = [160, 195, 235];
//     const TEAL = [0, 130, 130],
//       TEAL2 = [210, 240, 240];
//     const WHITE = [255, 255, 255],
//       LGRAY = [245, 247, 251],
//       LGRAY2 = [250, 251, 254],
//       LGRAY3 = [240, 243, 248];
//     const GRAY = [115, 118, 130],
//       GRAY2 = [75, 80, 95];
//     const GOLD = [170, 130, 40],
//       GOLD2 = [250, 245, 225];

//     const today = new Date();
//     const todayFmt =
//       today.getDate() +
//       " " +
//       MONTHS[today.getMonth()] +
//       " " +
//       today.getFullYear();
//     const rxNum =
//       "PS-" +
//       today.getFullYear() +
//       ("0" + (today.getMonth() + 1)).slice(-2) +
//       ("0" + today.getDate()).slice(-2) +
//       "-" +
//       Math.floor(1000 + Math.random() * 8999);

//     const visitDate = visit.visitDate || "";
//     const visitTime = visit.visitTime || "";
//     const notes = visit.notes || "";
//     const nextDate = visit.nextVisitDate || "";
//     const service = visit.service || "";
//     const doc = { name: doctor?.name || "Doctor", qual: "", reg: "" };

//     const visitDateFmt = fmtDateLocal(visitDate);
//     const visitTimeFmt = fmtTimeLocal(visitTime);
//     const nextDateFmt = fmtDateLocal(nextDate);

//     // ── Outer border ─────────────────────────────────────────────
//     sd(MIDBLUE);
//     pdf.setLineWidth(0.8);
//     pdf.rect(3.5, 3.5, W - 7, H - 7, "S");
//     sd(LBLUE);
//     pdf.setLineWidth(0.3);
//     pdf.rect(5.5, 5.5, W - 11, H - 11, "S");

//     // ── Header ───────────────────────────────────────────────────
//     sf(NAVY);
//     pdf.rect(3.5, 3.5, W - 7, 46, "F");
//     sf(BLUE);
//     pdf.rect(3.5, 43, W - 7, 10, "F");
//     sf(LBLUE);
//     pdf.rect(3.5, 53, W - 7, 6, "F");

//     st(WHITE);
//     pdf.setFontSize(18);
//     pdf.setFont("helvetica", "bold");
//     pdf.text(doc.name, 14, 19);
//     st(LBLUE);
//     pdf.setFontSize(8);
//     pdf.setFont("helvetica", "normal");
//     pdf.text((doc.qual || "").toUpperCase(), 14, 26);
//     sd(MIDBLUE);
//     pdf.setLineWidth(0.25);
//     pdf.line(14, 28.5, W - 40, 28.5);
//     st(LGRAY);
//     pdf.setFontSize(7);
//     pdf.text("Reg. No.:  " + (doc.reg || "—"), 14, 33.5);
//     pdf.text("Specialisation:  Dental & Oral Health Care", 14, 38.5);

//     st(WHITE);
//     pdf.setFontSize(15);
//     pdf.setFont("helvetica", "bold");
//     pdf.text("PEARLSMILE", W - 10, 19, { align: "right" });
//     st(LBLUE);
//     pdf.setFontSize(7.5);
//     pdf.setFont("helvetica", "normal");
//     pdf.text("DENTAL HOSPITAL", W - 10, 25.5, { align: "right" });
//     sd(MIDBLUE);
//     pdf.setLineWidth(0.25);
//     pdf.line(W - 72, 28.5, W - 10, 28.5);
//     st(LGRAY);
//     pdf.setFontSize(6.8);
//     pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W - 10, 33.5, {
//       align: "right",
//     });
//     pdf.text("+91 87936 08083  |  care@pearlsmiledental.in", W - 10, 38.5, {
//       align: "right",
//     });

//     st(WHITE);
//     pdf.setFontSize(9);
//     pdf.setFont("helvetica", "bold");
//     pdf.text("DIGITAL PRESCRIPTION", W / 2, 50, { align: "center" });
//     st(LBLUE2);
//     pdf.setFontSize(7);
//     pdf.setFont("helvetica", "normal");
//     pdf.text("Rx No.: " + rxNum, 10, 50);
//     pdf.text("Date: " + todayFmt, W - 10, 50, { align: "right" });

//     st(BLUE);
//     pdf.setFontSize(7.5);
//     pdf.setFont("helvetica", "bold");
//     pdf.text("PATIENT INFORMATION", W / 2, 57, { align: "center" });

//     // ── Patient info table ────────────────────────────────────────
//     const infoTop = 61;
//     sf(LGRAY3);
//     pdf.rect(10, infoTop, W - 20, 44, "F");
//     sd(LBLUE);
//     pdf.setLineWidth(0.25);
//     pdf.rect(10, infoTop, W - 20, 44, "S");
//     sd(MIDBLUE);
//     pdf.setLineWidth(0.2);
//     pdf.line(W / 2, infoTop, W / 2, infoTop + 44);
//     let rdy = infoTop + 11;
//     for (let ri = 0; ri < 3; ri++) {
//       pdf.line(10, rdy, W - 10, rdy);
//       rdy += 11;
//     }

//     const drawCell = (label, value, x, y, maxW) => {
//       st(GRAY2);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(6.8);
//       pdf.text(label, x + 3, y + 4);
//       st(NAVY);
//       pdf.setFont("helvetica", "normal");
//       pdf.setFontSize(8.5);
//       const val = pdf.splitTextToSize(String(value || "—"), maxW || 75);
//       pdf.text(val[0], x + 3, y + 9.5);
//     };
//     const cHalf = W / 2;
//     drawCell("PATIENT NAME", patient.name || "—", 10, infoTop, cHalf - 16);
//     drawCell("MOBILE", patient.mobile || "—", cHalf, infoTop, cHalf - 16);
//     drawCell("EMAIL", patient.email || "—", 10, infoTop + 11, cHalf - 16);
//     drawCell(
//       "BLOOD GROUP",
//       patient.blood || "—",
//       cHalf,
//       infoTop + 11,
//       cHalf - 16,
//     );
//     drawCell(
//       "AGE / GENDER",
//       (patient.age || "—") + (patient.gender ? "  |  " + patient.gender : ""),
//       10,
//       infoTop + 22,
//       cHalf - 16,
//     );
//     drawCell(
//       "VISIT DATE",
//       visitDateFmt + (visitTimeFmt ? " (" + visitTimeFmt + ")" : ""),
//       cHalf,
//       infoTop + 22,
//       cHalf - 16,
//     );
//     drawCell("SERVICE/TREATMENT", service || "—", 10, infoTop + 33, cHalf - 16);
//     drawCell(
//       "NEXT VISIT DATE",
//       nextDateFmt || "—",
//       cHalf,
//       infoTop + 33,
//       cHalf - 16,
//     );

//     // ── Clinical Notes ────────────────────────────────────────────
//     const diagTop = infoTop + 50;
//     sf(BLUE);
//     pdf.rect(10, diagTop, W - 20, 8, "F");
//     st(WHITE);
//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(8.5);
//     pdf.text(
//       "Rx   CLINICAL NOTES / DIAGNOSIS & PRESCRIPTION",
//       14,
//       diagTop + 5.5,
//     );
//     st(GOLD);
//     pdf.setFontSize(10);
//     pdf.text("Rx", W - 16, diagTop + 5.5, { align: "right" });

//     const notesBoxH = 56;
//     sf(LGRAY2);
//     pdf.rect(10, diagTop + 8, W - 20, notesBoxH, "F");
//     sd(LBLUE);
//     pdf.setLineWidth(0.25);
//     pdf.rect(10, diagTop + 8, W - 20, notesBoxH, "S");
//     sd([215, 225, 240]);
//     pdf.setLineWidth(0.15);
//     for (let rl = 0; rl < 7; rl++)
//       pdf.line(14, diagTop + 16 + rl * 7, W - 14, diagTop + 16 + rl * 7);
//     st(NAVY);
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(9.5);
//     const noteLines = pdf.splitTextToSize(
//       notes || "No diagnosis or notes recorded for this visit.",
//       W - 30,
//     );
//     pdf.text(noteLines, 14, diagTop + 15);

//     // ── Next appointment box ──────────────────────────────────────
//     let afterY = diagTop + notesBoxH + 10;
//     if (nextDateFmt) {
//       sf(TEAL2);
//       pdf.roundedRect(10, afterY, W - 20, 13, 2, 2, "F");
//       sd(TEAL);
//       pdf.setLineWidth(0.4);
//       pdf.roundedRect(10, afterY, W - 20, 13, 2, 2, "S");
//       sf(TEAL);
//       pdf.roundedRect(10, afterY, 10, 13, 2, 2, "F");
//       st(WHITE);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(6.5);
//       pdf.text("NEXT", 11.2, afterY + 5.5);
//       pdf.text("VISIT", 11.0, afterY + 10);
//       st(TEAL);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(9);
//       pdf.text("Next Appointment:", 24, afterY + 6.5);
//       st(NAVY);
//       pdf.setFontSize(10);
//       pdf.setFont("helvetica", "bold");
//       pdf.text(nextDateFmt, 72, afterY + 6.5);
//       st(GRAY);
//       pdf.setFontSize(7);
//       pdf.setFont("helvetica", "italic");
//       pdf.text(
//         "Please arrive 10 minutes early and bring this prescription.",
//         24,
//         afterY + 11,
//       );
//       afterY += 19;
//     }

//     // ── General advice box ────────────────────────────────────────
//     const advY = afterY + 4;
//     sf(GOLD2);
//     pdf.roundedRect(10, advY, W - 20, 20, 2, 2, "F");
//     sd(GOLD);
//     pdf.setLineWidth(0.35);
//     pdf.roundedRect(10, advY, W - 20, 20, 2, 2, "S");
//     sf(GOLD);
//     pdf.roundedRect(10, advY, 10, 20, 2, 2, "F");
//     st(WHITE);
//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(6.2);
//     pdf.text("GEN.", 11.2, advY + 8);
//     pdf.text("ADV.", 11.2, advY + 13.5);
//     st(GOLD);
//     pdf.setFontSize(7.5);
//     pdf.setFont("helvetica", "bold");
//     pdf.text("General Advice:", 24, advY + 6.5);
//     st(GRAY2);
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(7);
//     pdf.text(
//       "1.  Follow all prescribed medicines on time and complete the full course.",
//       24,
//       advY + 11.5,
//     );
//     pdf.text(
//       "2.  Maintain good oral hygiene. Brush gently twice daily.",
//       24,
//       advY + 15.5,
//     );
//     pdf.text(
//       "3.  Avoid very hot, cold, or hard foods until fully healed.",
//       24,
//       advY + 19.2,
//     );

//     // ── Watermark ─────────────────────────────────────────────────
//     pdf.saveGraphicsState();
//     pdf.setGState(new pdf.GState({ opacity: 0.035 }));
//     st(NAVY);
//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(44);
//     pdf.text("PEARLSMILE", W / 2, H / 2 - 5, { align: "center", angle: 35 });
//     pdf.restoreGraphicsState();

//     // ── Doctor seal ───────────────────────────────────────────────
//     const sigY = Math.max(advY + 28, H - 55);
//     const INK = [28, 52, 140],
//       INK2 = [45, 75, 170];
//     const cx = W - 46,
//       cy = sigY + 13,
//       R = 18;

//     sd(INK);
//     pdf.setLineWidth(1.2);
//     pdf.circle(cx, cy, R, "S");
//     pdf.setLineWidth(0.4);
//     pdf.circle(cx, cy, R - 2.5, "S");

//     const drawStar = (sx, sy, sr) => {
//       const pts = [];
//       for (let si = 0; si < 5; si++) {
//         const ao = (si * 4 * Math.PI) / 5 - Math.PI / 2,
//           ai = ao + (2 * Math.PI) / 5;
//         pts.push({ x: sx + sr * Math.cos(ao), y: sy + sr * Math.sin(ao) });
//         pts.push({
//           x: sx + sr * 0.4 * Math.cos(ai),
//           y: sy + sr * 0.4 * Math.sin(ai),
//         });
//       }
//       pdf.setLineWidth(0.3);
//       sd(INK);
//       sf(INK);
//       pdf.lines(
//         pts.slice(1).map((pt, i) => [pt.x - pts[i].x, pt.y - pts[i].y]),
//         pts[0].x,
//         pts[0].y,
//         [1, 1],
//         "FD",
//         true,
//       );
//     };
//     drawStar(cx - R + 3.5, cy + 1, 2.2);
//     drawStar(cx + R - 3.5, cy + 1, 2.2);

//     const docShort = (doc.name || "Doctor").toUpperCase();
//     sd(INK);
//     st(INK);
//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(5.8);
//     const topSpan = Math.min(docShort.length * 0.19, 1.3);
//     const topStart = -Math.PI / 2 - topSpan / 2;
//     for (let ti = 0; ti < docShort.length; ti++) {
//       const ta = topStart + (ti / Math.max(docShort.length - 1, 1)) * topSpan;
//       const tx = cx + (R - 1.5) * Math.cos(ta),
//         ty = cy + (R - 1.5) * Math.sin(ta);
//       const trot = ((ta + Math.PI / 2) * 180) / Math.PI;
//       pdf.text(docShort[ti], tx, ty, { align: "center", angle: -trot });
//     }

//     pdf.setFontSize(5.5);
//     const botStr = "PEARLSMILE DENTAL";
//     const botSpan = Math.min(botStr.length * 0.175, 1.4);
//     const botStart = Math.PI / 2 - botSpan / 2;
//     for (let bi = 0; bi < botStr.length; bi++) {
//       const ba = botStart + (bi / Math.max(botStr.length - 1, 1)) * botSpan;
//       const bx = cx + (R - 1.5) * Math.cos(ba),
//         by = cy + (R - 1.5) * Math.sin(ba);
//       const brot = ((ba - Math.PI / 2) * 180) / Math.PI;
//       pdf.text(botStr[bi], bx, by, { align: "center", angle: -brot });
//     }

//     sd(INK);
//     pdf.setLineWidth(0.8);
//     pdf.line(cx, cy - 8, cx, cy + 7);
//     pdf.setLineWidth(0.5);
//     pdf.line(cx, cy - 7.5, cx - 4, cy - 9.5);
//     pdf.line(cx - 4, cy - 9.5, cx - 6, cy - 8);
//     pdf.line(cx - 6, cy - 8, cx - 3, cy - 6.5);
//     pdf.line(cx, cy - 7.5, cx + 4, cy - 9.5);
//     pdf.line(cx + 4, cy - 9.5, cx + 6, cy - 8);
//     pdf.line(cx + 6, cy - 8, cx + 3, cy - 6.5);
//     sf(INK);
//     pdf.circle(cx, cy - 8.2, 1, "F");

//     pdf.setLineWidth(0.6);
//     pdf.lines(
//       [
//         [2, -2],
//         [2, -2],
//         [0, -2],
//       ],
//       cx - 3,
//       cy + 5,
//       [1, 1],
//       "S",
//     );
//     pdf.lines(
//       [
//         [-2, -2],
//         [-2, -2],
//         [0, -2],
//       ],
//       cx + 3,
//       cy + 1,
//       [1, 1],
//       "S",
//     );
//     pdf.lines(
//       [
//         [2, -2],
//         [2, -2],
//       ],
//       cx - 3,
//       cy - 3,
//       [1, 1],
//       "S",
//     );
//     pdf.lines(
//       [
//         [-2, -2],
//         [-2, -2],
//         [0, -2],
//       ],
//       cx + 3,
//       cy + 5,
//       [1, 1],
//       "S",
//     );
//     pdf.lines(
//       [
//         [2, -2],
//         [2, -2],
//         [0, -2],
//       ],
//       cx - 3,
//       cy + 1,
//       [1, 1],
//       "S",
//     );

//     st(INK);
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(4.5);
//     pdf.text("Reg. " + (doc.reg || "—"), cx, cy + R - 5.5, { align: "center" });
//     st(INK2);
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(6.5);
//     pdf.text("Authorised Signatory", cx, cy + R + 4, { align: "center" });

//     st(GRAY);
//     pdf.setFontSize(7);
//     pdf.setFont("helvetica", "normal");
//     pdf.text("Rx No.: " + rxNum, 14, sigY + 30);
//     pdf.text("Date: " + todayFmt, W - 14, sigY + 30, { align: "right" });

//     // ── Footer ────────────────────────────────────────────────────
//     sf(NAVY);
//     pdf.rect(3.5, H - 21, W - 7, 17.5, "F");
//     sf(BLUE);
//     pdf.rect(3.5, H - 7, W - 7, 3.5, "F");
//     st(WHITE);
//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(7.5);
//     pdf.text("PearlSmile Dental Hospital", 10, H - 14.5);
//     st(LBLUE);
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(7);
//     pdf.text("+91 87936 08083", 10, H - 9.5);
//     pdf.text("care@pearlsmiledental.in", W / 2, H - 9.5, { align: "center" });
//     pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W - 10, H - 9.5, {
//       align: "right",
//     });
//     st(LBLUE2);
//     pdf.setFontSize(6);
//     pdf.setFont("helvetica", "italic");
//     pdf.text(
//       "This is a computer-generated prescription from PearlSmile Dental Hospital. Valid only with authorised doctor details.",
//       W / 2,
//       H - 5.5,
//       { align: "center" },
//     );

//     // ── Output ────────────────────────────────────────────────────
//     const blob = pdf.output("blob");
//     const url = URL.createObjectURL(blob);
//     const name =
//       "Prescription_" +
//       (patient.name || "Patient").replace(/\s+/g, "_") +
//       "_" +
//       visitDate +
//       ".pdf";

//     let rawMob = (patient.mobile || "").replace(/[\s\-\(\)\+]/g, "");
//     if (!rawMob.startsWith("91") && rawMob.length === 10)
//       rawMob = "91" + rawMob;

//     setPdfBlob(blob);
//     setPdfUrl(url);
//     setRxMobile(rawMob);
//     setFileName(name);
//     // Show native share button only if Web Share API supports files — exactly like original HTML
//     const testFile = new File([blob], name, { type: "application/pdf" });
//     if (
//       navigator.share &&
//       navigator.canShare &&
//       navigator.canShare({ files: [testFile] })
//     ) {
//       setCanNativeShare(true);
//     }
//     setLoading(false);
//   };

//   const downloadPDF = () => {
//     const link = document.createElement("a");
//     link.href = pdfUrl;
//     link.download = fileName;
//     link.click();
//   };

//   const openFullPreview = () => {
//     if (pdfUrl) window.open(pdfUrl, "_blank");
//   };

//   const shareViaWhatsApp = () => {
//     if (rxMobile) window.open("https://wa.me/" + rxMobile, "_blank");
//     showNotify(
//       "WhatsApp Opened!",
//       "Attach the PDF from the preview and send to patient.",
//     );
//   };

//   const nativeShare = async () => {
//     if (!pdfBlob) return;
//     const file = new File([pdfBlob], fileName, { type: "application/pdf" });
//     if (
//       navigator.share &&
//       navigator.canShare &&
//       navigator.canShare({ files: [file] })
//     ) {
//       navigator
//         .share({
//           title: "Digital Prescription — PearlSmile Dental Hospital",
//           text: "",
//           files: [file],
//         })
//         .then(() => {
//           showNotify("Shared!", "Prescription shared successfully.");
//           onClose();
//         })
//         .catch((err) => {
//           if (err.name !== "AbortError")
//             showNotify("Share Failed", err.message, true);
//         });
//     } else {
//       showNotify(
//         "Not Supported",
//         "Native share not supported on this device/browser.",
//         true,
//       );
//     }
//   };

//   return (
//     <div
//       className="rx-share-overlay open"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: 20,
//           width: "100%",
//           maxWidth: 540,
//           boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           maxHeight: "92vh",
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             background: "linear-gradient(135deg,#0a1628,#1a3a6b)",
//             padding: "18px 22px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <span style={{ fontSize: 22 }}>📄</span>
//             <div>
//               <div
//                 style={{
//                   color: "#fff",
//                   fontWeight: 600,
//                   fontSize: 15,
//                   fontFamily: "DM Sans,sans-serif",
//                 }}
//               >
//                 Digital Prescription Ready
//               </div>
//               <div
//                 style={{
//                   color: "rgba(255,255,255,0.55)",
//                   fontSize: 12,
//                   fontFamily: "DM Sans,sans-serif",
//                 }}
//               >
//                 {patient.name} · {visit.visitDate}
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: "rgba(255,255,255,0.12)",
//               border: "none",
//               color: "#fff",
//               width: 32,
//               height: 32,
//               borderRadius: "50%",
//               fontSize: 17,
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {/* PDF Preview */}
//         <div
//           style={{
//             flex: 1,
//             overflow: "hidden",
//             background: "#f0eeeb",
//             minHeight: 340,
//             position: "relative",
//           }}
//         >
//           {loading && (
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "#f0eeeb",
//                 gap: 10,
//               }}
//             >
//               <div
//                 style={{
//                   width: 36,
//                   height: 36,
//                   border: "3px solid #0d7377",
//                   borderTopColor: "transparent",
//                   borderRadius: "50%",
//                   animation: "spin 0.8s linear infinite",
//                 }}
//               />
//               <div
//                 style={{
//                   fontSize: 13,
//                   color: "#5a5550",
//                   fontFamily: "DM Sans,sans-serif",
//                 }}
//               >
//                 Generating PDF…
//               </div>
//             </div>
//           )}
//           {pdfUrl && (
//             <iframe
//               title="prescription"
//               src={pdfUrl}
//               style={{ width: "100%", height: 420, border: "none" }}
//             />
//           )}
//         </div>

//         {/* Action buttons — exactly like original HTML */}
//         <div
//           style={{
//             padding: "16px 20px",
//             display: "flex",
//             flexDirection: "column",
//             gap: 10,
//             background: "#fff",
//           }}
//         >
//           <div style={{ display: "flex", gap: 8 }}>
//             <button
//               onClick={openFullPreview}
//               onMouseOver={(e) =>
//                 (e.currentTarget.style.background = "#e5e0d8")
//               }
//               onMouseOut={(e) => (e.currentTarget.style.background = "#f0eeeb")}
//               style={{
//                 flex: 1,
//                 background: "#f0eeeb",
//                 color: "#0a1628",
//                 border: "1.5px solid #ddd9d3",
//                 borderRadius: 10,
//                 padding: 10,
//                 fontSize: 13,
//                 fontWeight: 500,
//                 cursor: "pointer",
//                 fontFamily: "DM Sans,sans-serif",
//                 transition: "background 0.2s",
//               }}
//             >
//               🔍 Open Full PDF
//             </button>
//             {canNativeShare && (
//               <button
//                 onClick={nativeShare}
//                 onMouseOver={(e) =>
//                   (e.currentTarget.style.background = "#e5e0d8")
//                 }
//                 onMouseOut={(e) =>
//                   (e.currentTarget.style.background = "#f0eeeb")
//                 }
//                 style={{
//                   flex: 1,
//                   background: "#f0eeeb",
//                   color: "#0a1628",
//                   border: "1.5px solid #ddd9d3",
//                   borderRadius: 10,
//                   padding: 10,
//                   fontSize: 13,
//                   fontWeight: 500,
//                   cursor: "pointer",
//                   fontFamily: "DM Sans,sans-serif",
//                   transition: "background 0.2s",
//                 }}
//               >
//                 📤 Share (Device)
//               </button>
//             )}
//           </div>
//           <p
//             style={{
//               fontSize: 11,
//               color: "#9a9590",
//               textAlign: "center",
//               margin: 0,
//               fontFamily: "DM Sans,sans-serif",
//               lineHeight: 1.5,
//             }}
//           >
//             On mobile: tap "Share (Device)" to send directly via WhatsApp.
//             <br />
//             On desktop: use "Open Full PDF" to view, then share manually.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// ============================================================
// src/components/admin/PatientsTab.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const SERVICES_LIST = [
  "General Checkup & Cleaning","Cosmetic Dentistry / Smile Makeover","Dental Implants",
  "Orthodontics / Invisalign","Root Canal Therapy","Pediatric Dentistry","Oral Surgery",
  "Periodontal Treatment","Teeth Whitening","Emergency Dental Care","Follow-Up Visit","Other",
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
}

function fmtDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() + " " + MONTHS_SHORT[d.getMonth()] + " " + d.getFullYear();
}

function fmtTime(t) {
  if (!t) return "";
  const parts = t.split(":");
  const hh = parseInt(parts[0]), mm = parts[1];
  return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
}

function totalRevenue(visits = []) {
  return visits.reduce((sum, v) => {
    const n = parseFloat((v.amount || "0").toString().replace(/[^0-9.]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

export default function PatientsTab({ showNotify, doctor }) {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPat, setNewPat] = useState({ name:"",mobile:"",email:"",age:"",gender:"",blood:"" });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rxModal, setRxModal] = useState(null);
  // Custom medicines — fetched from backend, shared across all doctors/devices
  const [customMeds, setCustomMeds] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0,5);
  const [visitForm, setVisitForm] = useState({
    date: today, time: nowTime, service:"", amount:"", nextVisitDate:"", notes:""
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/patients");
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  // Fetch custom medicines from backend on mount — shared across all doctors/devices
  useEffect(() => {
    api.get("/custommeds")
      .then(data => { if (Array.isArray(data)) setCustomMeds(data); })
      .catch(() => {});
  }, []);

  const filterPatients = (q) => {
    const term = q.toLowerCase();
    setFiltered(patients.filter(p =>
      (p.name||"").toLowerCase().includes(term) ||
      (p.mobile||"").includes(term) ||
      (p.email||"").toLowerCase().includes(term)
    ));
  };

  const createPatient = async () => {
    if (!newPat.name.trim()) { showNotify("Error", "Patient name is required.", true); return; }
    if (!newPat.mobile.trim()) { showNotify("Error", "Mobile number is required.", true); return; }
    try {
      await api.post("/patients", newPat);
      setNewPat({ name:"",mobile:"",email:"",age:"",gender:"",blood:"" });
      setShowNewForm(false);
      showNotify("Patient Profile Created! ✓", "New profile for " + newPat.name + " saved.");
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const openPatient = async (p) => {
    try {
      const full = await api.get("/patients/" + p._id);
      setSelectedPatient(full);
      setVisitForm({ date: today, time: nowTime, service:"", amount:"", nextVisitDate:"", notes:"" });
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const deletePatient = async () => {
    if (!window.confirm("Delete this patient profile and all their records? This cannot be undone.")) return;
    try {
      await api.delete("/patients/" + selectedPatient._id);
      showNotify("Profile Deleted", "Patient profile removed.");
      setSelectedPatient(null);
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const saveVisit = async () => {
    if (!visitForm.date) { showNotify("Missing Fields", "Please select a visit date.", true); return; }
    if (!visitForm.service) { showNotify("Missing Fields", "Please select a service.", true); return; }
    try {
      const payload = {
        visitDate: visitForm.date,
        visitTime: visitForm.time,
        service: visitForm.service,
        amount: visitForm.amount,
        nextVisitDate: visitForm.nextVisitDate,
        notes: visitForm.notes,
        doctor: doctor?.name || "",
        prescription: { medicineRows: [] },
      };
      const updated = await api.post("/patients/" + selectedPatient._id + "/visits", payload);
      setSelectedPatient(updated);
      setVisitForm({ date: today, time: nowTime, service:"", amount:"", nextVisitDate:"", notes:"" });

      // Follow-up WhatsApp if notes contain "follow-up" and nextVisitDate is set
      const isFollowUp = /follow[\s\-]?up/i.test(visitForm.notes);
      if (isFollowUp && visitForm.nextVisitDate && selectedPatient.mobile) {
        let rawMobile = (selectedPatient.mobile || "").replace(/[\s\-\(\)\+]/g, "");
        if (!rawMobile.startsWith("91") && rawMobile.length === 10) rawMobile = "91" + rawMobile;
        const waMsg = `*PearlSmile Dental Hospital* — Follow-Up Reminder\n\nDear ${selectedPatient.name},\nThis is a reminder for your follow-up appointment.\n\n*Service:* ${visitForm.service}\n*Next Visit:* ${fmtDate(visitForm.nextVisitDate)}\n\nPlease call us to confirm your appointment.\n📞 +91 87936 08083`;
        setTimeout(() => window.open("https://wa.me/" + rawMobile + "?text=" + encodeURIComponent(waMsg), "_blank"), 500);
        showNotify("Visit Saved + Follow-Up WhatsApp Sent!", "Reminder sent to " + selectedPatient.name + " for " + fmtDate(visitForm.nextVisitDate) + ".");
      } else {
        showNotify("Visit Record Saved! ✓", "Patient visit has been recorded successfully.");
      }
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const deleteVisit = async (visitId) => {
    if (!window.confirm("Delete this visit record?")) return;
    try {
      const result = await api.delete("/patients/" + selectedPatient._id + "/visits/" + visitId);
      setSelectedPatient(result.patient);
      showNotify("Visit Deleted", "Visit record removed.");
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const sendPrescription = (visit) => {
    setRxModal({ visit, patient: selectedPatient, doctor });
  };

  // ── LIST VIEW ─────────────────────────────────────────────────
  if (!selectedPatient) {
    return (
      <div>
        <div className="admin-section-title">Patient Profiles</div>
        <div className="admin-section-desc">Create and manage individual patient profiles. Click a profile to view visit history and add new records.</div>

        <div className="patients-list-view">
          <input type="text" className="patient-search-bar" placeholder="🔍 Search patients by name or phone..."
            onChange={e => filterPatients(e.target.value)} />

          {showNewForm && (
            <div className="new-patient-form">
              <h4>➕ Create New Patient Profile</h4>
              <div className="new-patient-grid">
                {[["name","text","Full Name *","Patient full name"],["mobile","tel","Mobile Number *","+91 98765 43210"],["email","email","Email Address","patient@email.com"],["age","number","Age","Age"]].map(([k,t,label,ph]) => (
                  <div key={k}>
                    <div className="admin-row-label">{label}</div>
                    <input type={t} placeholder={ph} value={newPat[k]} onChange={e => setNewPat(p => ({...p,[k]:e.target.value}))} />
                  </div>
                ))}
                <div>
                  <div className="admin-row-label">Gender</div>
                  <select value={newPat.gender} onChange={e => setNewPat(p => ({...p,gender:e.target.value}))}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <div className="admin-row-label">Blood Group</div>
                  <input type="text" placeholder="e.g. B+" value={newPat.blood} onChange={e => setNewPat(p => ({...p,blood:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button className="add-visit-save-btn" onClick={createPatient}>💾 Save Patient Profile</button>
                <button className="btn-back-patients" onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:13, color:"var(--gray-400)" }}>
              {loading ? "Loading patients..." : `${filtered.length} patient profile${filtered.length!==1?"s":""}`}
            </div>
            <button className="admin-add-btn" onClick={() => setShowNewForm(s => !s)}>
              {showNewForm ? "Cancel" : "+ New Patient Profile"}
            </button>
          </div>

          <div className="patient-profiles-grid">
            {loading ? (
              <div style={{ color:"var(--gray-400)", fontSize:14, padding:"20px 0", gridColumn:"1/-1" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ color:"var(--gray-400)", fontSize:14, padding:"24px 0", gridColumn:"1/-1", textAlign:"center" }}>
                No patients yet. Click "+ New Patient Profile" to add your first patient.
              </div>
            ) : filtered.map(p => (
              <div key={p._id} className="patient-profile-card" onClick={() => openPatient(p)}>
                <div className="patient-avatar-icon">🧑‍⚕️</div>
                <div className="patient-card-name">{p.name}</div>
                <div className="patient-card-id">📞 {p.mobile || "—"}</div>
                <div className="patient-card-visits">📋 {p.visitCount||0} visit{p.visitCount!==1?"s":""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────
  const p = selectedPatient;
  const visits = p.visits || [];
  const total = totalRevenue(visits);

  return (
    <div>
      <div className="patient-detail-view open">
        <div className="patient-detail-header">
          <button className="btn-back-patients" onClick={() => setSelectedPatient(null)}>← Back to Patients</button>
          <div className="patient-avatar-icon" style={{ width:56, height:56, fontSize:26 }}>🧑‍⚕️</div>
          <div style={{ flex:1 }}>
            <h3>{p.name}</h3>
            <p style={{ fontSize:13, color:"var(--gray-400)" }}>{p.email}{p.email&&p.mobile?" · ":""}{p.mobile}</p>
            <div className="patient-info-row">
              {[p.age?"Age: "+p.age:null, p.gender||null, p.blood?"Blood: "+p.blood:null].filter(Boolean).map((t,i) => (
                <span key={i} className="patient-info-pill">{t}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontSize:11, color:"var(--gray-400)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:4 }}>Total Revenue</div>
            <div style={{ fontFamily:"Cormorant Garamond,serif", fontSize:26, fontWeight:600, color:"var(--teal)", lineHeight:1 }}>
              Rs. {total.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:2 }}>{visits.length} visit{visits.length!==1?"s":""}</div>
          </div>
          <button className="admin-del-btn" onClick={deletePatient} style={{ alignSelf:"flex-start", marginTop:4 }}>
            🗑️ Delete Profile
          </button>
        </div>

        {/* Add Visit Form — original simple layout */}
        <div className="add-visit-form">
          <h4>📋 Add New Visit Record</h4>
          <div className="add-visit-grid">
            <div>
              <div className="admin-row-label">Visit Date *</div>
              <input type="date" value={visitForm.date} onChange={e => setVisitForm(f => ({...f,date:e.target.value}))} />
            </div>
            <div>
              <div className="admin-row-label">Visit Time</div>
              <input type="time" value={visitForm.time} onChange={e => setVisitForm(f => ({...f,time:e.target.value}))} />
            </div>
            <div>
              <div className="admin-row-label">Service Taken *</div>
              <select value={visitForm.service} onChange={e => setVisitForm(f => ({...f,service:e.target.value}))}>
                <option value="">Select Service</option>
                {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div className="admin-row-label">Amount Charged (Rs.)</div>
              <input type="text" placeholder="e.g. 2500" value={visitForm.amount} onChange={e => setVisitForm(f => ({...f,amount:e.target.value}))} />
            </div>
            <div>
              <div className="admin-row-label" style={{ display:"flex", alignItems:"center", gap:6 }}>
                Next Date to Visit
                <span style={{ fontSize:10, color:"var(--teal)", fontWeight:400, background:"rgba(13,115,119,0.08)", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(13,115,119,0.2)" }}>For follow-up</span>
              </div>
              <input type="date" value={visitForm.nextVisitDate} onChange={e => setVisitForm(f => ({...f,nextVisitDate:e.target.value}))} style={{ marginTop:6 }} />
            </div>
          </div>
          <div className="admin-row-label" style={{ marginBottom:6 }}>Doctor Notes / Diagnosis</div>
          <MedAutocomplete
            value={visitForm.notes}
            onChange={v => setVisitForm(f => ({...f,notes:v}))}
            customMeds={customMeds}
            onCustomSaved={() => {
              // Refresh custom meds from backend so new entry appears for all doctors
              api.get("/custommeds")
                .then(data => { if (Array.isArray(data)) setCustomMeds(data); })
                .catch(() => {});
            }}
          />
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:10, marginTop:4 }}>
            <button className="add-visit-save-btn" onClick={saveVisit}>💾 Save Visit Record</button>
          </div>
        </div>

        {/* Visit History */}
        <div style={{ marginBottom:12 }}>
          <div className="admin-section-title" style={{ marginBottom:8 }}>Visit History</div>
          <div className="visit-records-list">
            {visits.length === 0 ? (
              <div style={{ color:"var(--gray-400)", fontSize:13, padding:"10px 0" }}>No visits recorded yet. Add the first visit above.</div>
            ) : visits.map((v, i) => {
              const dtStr = (v.visitDate||"") + (v.visitTime ? " at " + v.visitTime : "");
              const isFollowUp = /follow[\s\-]?up/i.test(v.notes||"");
              return (
                <div key={v._id||i} className="visit-record-card">
                  <button className="visit-del-btn" onClick={() => deleteVisit(v._id)} title="Delete">✕</button>
                  <div className="visit-record-meta">
                    <span className="visit-record-service">{v.service||"Visit"}</span>
                    <span className="visit-record-date">📅 {dtStr}</span>
                    {v.amount && <span className="patient-info-pill" style={{ fontSize:11 }}>Rs. {v.amount}</span>}
                  </div>
                  <div className="visit-record-notes">{v.notes||"—"}</div>
                  {v.nextVisitDate && (
                    <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6,
                      background: isFollowUp ? "rgba(201,168,76,0.12)" : "rgba(13,115,119,0.08)",
                      border: "1px solid " + (isFollowUp ? "rgba(201,168,76,0.35)" : "rgba(13,115,119,0.2)"),
                      borderRadius:100, padding:"3px 12px", fontSize:12, fontWeight:500,
                      color: isFollowUp ? "#8b6914" : "var(--teal)" }}>
                      {isFollowUp ? "Follow-Up: " : "Next Visit: "}{fmtDateShort(v.nextVisitDate)}
                      {isFollowUp ? " — WhatsApp sent" : ""}
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                    <button onClick={() => sendPrescription(v)}
                      style={{ background:"linear-gradient(135deg,#0a1628,#1a3a6b)", color:"white", border:"none",
                        borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:500, cursor:"pointer",
                        fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6, transition:"opacity 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.opacity="0.85"}
                      onMouseOut={e => e.currentTarget.style.opacity="1"}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.857L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 0 1-5.028-1.382l-.36-.214-3.732.888.939-3.618-.235-.372A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                      </svg>
                      Send Prescription
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {rxModal && (
        <PrescriptionModal
          visit={rxModal.visit}
          patient={rxModal.patient}
          doctor={rxModal.doctor}
          onClose={() => setRxModal(null)}
          showNotify={showNotify}
        />
      )}
    </div>
  );
}

// ── Medicine Database — 1500+ entries (India: dental + clinical + surgical) ──
const MEDICINE_DB = [
  // ── ANTIBIOTICS ──────────────────────────────────────────────
  { name:"Amoxicillin 250mg Capsule", cat:"Antibiotic" },
  { name:"Amoxicillin 500mg Capsule", cat:"Antibiotic" },
  { name:"Amoxicillin 875mg Tablet", cat:"Antibiotic" },
  { name:"Amoxicillin 125mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Amoxicillin 250mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Amoxicillin + Clavulanate 375mg Tablet", cat:"Antibiotic" },
  { name:"Amoxicillin + Clavulanate 625mg Tablet", cat:"Antibiotic" },
  { name:"Amoxicillin + Clavulanate 1000mg Tablet", cat:"Antibiotic" },
  { name:"Amoxicillin + Clavulanate 228.5mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Azithromycin 250mg Tablet", cat:"Antibiotic" },
  { name:"Azithromycin 500mg Tablet", cat:"Antibiotic" },
  { name:"Azithromycin 200mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Clindamycin 150mg Capsule", cat:"Antibiotic" },
  { name:"Clindamycin 300mg Capsule", cat:"Antibiotic" },
  { name:"Clindamycin 600mg Injection", cat:"Antibiotic Inj" },
  { name:"Metronidazole 200mg Tablet", cat:"Antibiotic" },
  { name:"Metronidazole 400mg Tablet", cat:"Antibiotic" },
  { name:"Metronidazole 500mg Tablet", cat:"Antibiotic" },
  { name:"Metronidazole 200mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Metronidazole 500mg Infusion", cat:"Antibiotic Inj" },
  { name:"Ciprofloxacin 250mg Tablet", cat:"Antibiotic" },
  { name:"Ciprofloxacin 500mg Tablet", cat:"Antibiotic" },
  { name:"Ciprofloxacin 750mg Tablet", cat:"Antibiotic" },
  { name:"Ciprofloxacin 200mg/100ml Infusion", cat:"Antibiotic Inj" },
  { name:"Doxycycline 100mg Capsule", cat:"Antibiotic" },
  { name:"Doxycycline 200mg Tablet", cat:"Antibiotic" },
  { name:"Erythromycin 250mg Tablet", cat:"Antibiotic" },
  { name:"Erythromycin 500mg Tablet", cat:"Antibiotic" },
  { name:"Tinidazole 500mg Tablet", cat:"Antibiotic" },
  { name:"Ornidazole 500mg Tablet", cat:"Antibiotic" },
  { name:"Secnidazole 500mg Tablet", cat:"Antibiotic" },
  { name:"Co-Amoxiclav 375mg Tablet", cat:"Antibiotic" },
  { name:"Co-Amoxiclav 625mg Tablet", cat:"Antibiotic" },
  { name:"Levofloxacin 250mg Tablet", cat:"Antibiotic" },
  { name:"Levofloxacin 500mg Tablet", cat:"Antibiotic" },
  { name:"Levofloxacin 750mg Tablet", cat:"Antibiotic" },
  { name:"Ofloxacin 200mg Tablet", cat:"Antibiotic" },
  { name:"Ofloxacin 400mg Tablet", cat:"Antibiotic" },
  { name:"Cephalexin 250mg Capsule", cat:"Antibiotic" },
  { name:"Cephalexin 500mg Capsule", cat:"Antibiotic" },
  { name:"Cefixime 100mg Tablet", cat:"Antibiotic" },
  { name:"Cefixime 200mg Tablet", cat:"Antibiotic" },
  { name:"Cefixime 400mg Tablet", cat:"Antibiotic" },
  { name:"Cefixime 50mg/5ml Syrup", cat:"Antibiotic" },
  { name:"Cefuroxime 250mg Tablet", cat:"Antibiotic" },
  { name:"Cefuroxime 500mg Tablet", cat:"Antibiotic" },
  { name:"Cefpodoxime 100mg Tablet", cat:"Antibiotic" },
  { name:"Cefpodoxime 200mg Tablet", cat:"Antibiotic" },
  { name:"Ceftriaxone 250mg Injection", cat:"Antibiotic Inj" },
  { name:"Ceftriaxone 500mg Injection", cat:"Antibiotic Inj" },
  { name:"Ceftriaxone 1g Injection", cat:"Antibiotic Inj" },
  { name:"Ceftriaxone 2g Injection", cat:"Antibiotic Inj" },
  { name:"Amikacin 250mg Injection", cat:"Antibiotic Inj" },
  { name:"Amikacin 500mg Injection", cat:"Antibiotic Inj" },
  { name:"Gentamicin 40mg Injection", cat:"Antibiotic Inj" },
  { name:"Gentamicin 80mg Injection", cat:"Antibiotic Inj" },
  { name:"Vancomycin 500mg Injection", cat:"Antibiotic Inj" },
  { name:"Vancomycin 1g Injection", cat:"Antibiotic Inj" },
  { name:"Meropenem 500mg Injection", cat:"Antibiotic Inj" },
  { name:"Meropenem 1g Injection", cat:"Antibiotic Inj" },
  { name:"Piperacillin + Tazobactam 4.5g Injection", cat:"Antibiotic Inj" },
  { name:"Imipenem + Cilastatin 500mg Injection", cat:"Antibiotic Inj" },
  { name:"Linezolid 600mg Tablet", cat:"Antibiotic" },
  { name:"Linezolid 600mg Infusion", cat:"Antibiotic Inj" },
  { name:"Colistin 1 MU Injection", cat:"Antibiotic Inj" },
  { name:"Tetracycline 250mg Capsule", cat:"Antibiotic" },
  { name:"Tetracycline 500mg Capsule", cat:"Antibiotic" },
  { name:"Chloramphenicol 250mg Capsule", cat:"Antibiotic" },
  { name:"Ampicillin 250mg Capsule", cat:"Antibiotic" },
  { name:"Ampicillin 500mg Capsule", cat:"Antibiotic" },
  { name:"Ampicillin + Sulbactam 1.5g Injection", cat:"Antibiotic Inj" },
  { name:"Nitrofurantoin 50mg Capsule", cat:"Antibiotic" },
  { name:"Nitrofurantoin 100mg Capsule", cat:"Antibiotic" },
  { name:"Norfloxacin 400mg Tablet", cat:"Antibiotic" },
  { name:"Trimethoprim + Sulfamethoxazole 480mg Tablet", cat:"Antibiotic" },
  { name:"Trimethoprim + Sulfamethoxazole 960mg Tablet", cat:"Antibiotic" },
  { name:"Cefoperazone + Sulbactam 1.5g Injection", cat:"Antibiotic Inj" },
  { name:"Cefoperazone + Sulbactam 3g Injection", cat:"Antibiotic Inj" },
  { name:"Ertapenem 1g Injection", cat:"Antibiotic Inj" },
  { name:"Tigecycline 50mg Injection", cat:"Antibiotic Inj" },
  { name:"Fosfomycin 3g Sachet", cat:"Antibiotic" },
  { name:"Rifampicin 150mg Capsule", cat:"Antibiotic" },
  { name:"Rifampicin 300mg Capsule", cat:"Antibiotic" },
  { name:"Isoniazid 100mg Tablet", cat:"Antibiotic" },
  { name:"Isoniazid 300mg Tablet", cat:"Antibiotic" },
  { name:"Pyrazinamide 500mg Tablet", cat:"Antibiotic" },
  { name:"Ethambutol 400mg Tablet", cat:"Antibiotic" },
  { name:"Streptomycin 1g Injection", cat:"Antibiotic Inj" },
  // ── PAIN KILLERS / NSAIDS ────────────────────────────────────
  { name:"Paracetamol 325mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 500mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 650mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 1000mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 120mg/5ml Syrup", cat:"Painkiller" },
  { name:"Paracetamol 250mg/5ml Syrup", cat:"Painkiller" },
  { name:"Paracetamol 150mg/ml Drops", cat:"Painkiller" },
  { name:"Paracetamol 500mg/100ml Infusion", cat:"Painkiller Inj" },
  { name:"Ibuprofen 200mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 400mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 600mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 100mg/5ml Syrup", cat:"NSAID" },
  { name:"Diclofenac 50mg Tablet", cat:"NSAID" },
  { name:"Diclofenac 75mg Tablet", cat:"NSAID" },
  { name:"Diclofenac 100mg SR Tablet", cat:"NSAID" },
  { name:"Diclofenac 75mg Injection", cat:"NSAID Inj" },
  { name:"Ketorolac 10mg Tablet", cat:"NSAID" },
  { name:"Ketorolac 30mg Injection", cat:"NSAID Inj" },
  { name:"Naproxen 250mg Tablet", cat:"NSAID" },
  { name:"Naproxen 500mg Tablet", cat:"NSAID" },
  { name:"Mefenamic Acid 250mg Tablet", cat:"NSAID" },
  { name:"Mefenamic Acid 500mg Tablet", cat:"NSAID" },
  { name:"Nimesulide 100mg Tablet", cat:"NSAID" },
  { name:"Piroxicam 10mg Tablet", cat:"NSAID" },
  { name:"Piroxicam 20mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 60mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 90mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 120mg Tablet", cat:"NSAID" },
  { name:"Celecoxib 100mg Capsule", cat:"NSAID" },
  { name:"Celecoxib 200mg Capsule", cat:"NSAID" },
  { name:"Aceclofenac 100mg Tablet", cat:"NSAID" },
  { name:"Aceclofenac + Paracetamol Tablet", cat:"NSAID Combo" },
  { name:"Tramadol 50mg Capsule", cat:"Opioid Analgesic" },
  { name:"Tramadol 100mg SR Tablet", cat:"Opioid Analgesic" },
  { name:"Tramadol 50mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Tramadol + Paracetamol Tablet", cat:"Analgesic Combo" },
  { name:"Morphine 10mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Morphine 15mg Tablet", cat:"Opioid Analgesic" },
  { name:"Fentanyl 50mcg/ml Injection", cat:"Opioid Analgesic Inj" },
  { name:"Pentazocine 30mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Pethidine 50mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Buprenorphine 0.3mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Tapentadol 50mg Tablet", cat:"Opioid Analgesic" },
  { name:"Tapentadol 100mg Tablet", cat:"Opioid Analgesic" },
  // ── LOCAL ANAESTHETICS — DENTAL ─────────────────────────────
  { name:"Lignocaine 2% Dental Cartridge (1.8ml)", cat:"Local Anaesthetic" },
  { name:"Lignocaine + Adrenaline 2% Dental Cartridge", cat:"Local Anaesthetic" },
  { name:"Articaine 4% + Adrenaline 1:100000 Cartridge", cat:"Local Anaesthetic" },
  { name:"Articaine 4% + Adrenaline 1:200000 Cartridge", cat:"Local Anaesthetic" },
  { name:"Bupivacaine 0.5% Injection", cat:"Local Anaesthetic" },
  { name:"Bupivacaine 0.5% Heavy Spinal Injection", cat:"Local Anaesthetic" },
  { name:"Mepivacaine 3% Dental Cartridge", cat:"Local Anaesthetic" },
  { name:"Prilocaine 3% Dental Cartridge", cat:"Local Anaesthetic" },
  { name:"Lignocaine 2% Plain Injection 30ml Vial", cat:"Local Anaesthetic" },
  { name:"Lignocaine 2% + Adrenaline Injection Vial", cat:"Local Anaesthetic" },
  { name:"Lignocaine 10% Topical Spray", cat:"Local Anaesthetic Topical" },
  { name:"Lignocaine 2% Viscous Gel", cat:"Local Anaesthetic Topical" },
  { name:"Lignocaine 5% Ointment", cat:"Local Anaesthetic Topical" },
  { name:"Benzocaine 20% Topical Gel", cat:"Local Anaesthetic Topical" },
  { name:"EMLA Cream (Lignocaine + Prilocaine)", cat:"Local Anaesthetic Topical" },
  { name:"Xylocaine Jelly 2%", cat:"Local Anaesthetic Topical" },
  { name:"Ropivacaine 0.2% Injection", cat:"Local Anaesthetic" },
  { name:"Ropivacaine 0.75% Injection", cat:"Local Anaesthetic" },
  { name:"Tetracaine (Amethocaine) Eye Drops", cat:"Local Anaesthetic Topical" },
  // ── GENERAL ANAESTHESIA ─────────────────────────────────────
  { name:"Propofol 10mg/ml Injection", cat:"General Anaesthesia" },
  { name:"Ketamine 500mg Injection", cat:"General Anaesthesia" },
  { name:"Ketamine 10mg/ml Injection", cat:"General Anaesthesia" },
  { name:"Thiopentone Sodium 500mg Injection", cat:"General Anaesthesia" },
  { name:"Midazolam 1mg/ml Injection", cat:"Sedative / Anaesthesia" },
  { name:"Midazolam 5mg/ml Injection", cat:"Sedative / Anaesthesia" },
  { name:"Midazolam 7.5mg Tablet", cat:"Sedative" },
  { name:"Isoflurane Inhalation", cat:"Inhalation Anaesthetic" },
  { name:"Sevoflurane Inhalation", cat:"Inhalation Anaesthetic" },
  { name:"Desflurane Inhalation", cat:"Inhalation Anaesthetic" },
  { name:"Nitrous Oxide Gas", cat:"Inhalation Anaesthetic" },
  { name:"Oxygen Gas Cylinder", cat:"Medical Gas" },
  { name:"Succinylcholine 100mg Injection", cat:"Muscle Relaxant" },
  { name:"Vecuronium 4mg Injection", cat:"Muscle Relaxant" },
  { name:"Atracurium 25mg Injection", cat:"Muscle Relaxant" },
  { name:"Rocuronium 50mg Injection", cat:"Muscle Relaxant" },
  { name:"Neostigmine 0.5mg Injection", cat:"Reversal Agent" },
  { name:"Atropine 0.6mg Injection", cat:"Anticholinergic" },
  { name:"Glycopyrrolate 0.2mg Injection", cat:"Anticholinergic" },
  // ── STEROIDS / ANTI-INFLAMMATORY ────────────────────────────
  { name:"Dexamethasone 0.5mg Tablet", cat:"Steroid" },
  { name:"Dexamethasone 4mg Tablet", cat:"Steroid" },
  { name:"Dexamethasone 4mg Injection", cat:"Steroid Inj" },
  { name:"Dexamethasone 8mg Injection", cat:"Steroid Inj" },
  { name:"Betamethasone 0.5mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 5mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 10mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 20mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 40mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 4mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 16mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 40mg Injection", cat:"Steroid Inj" },
  { name:"Methylprednisolone 125mg Injection", cat:"Steroid Inj" },
  { name:"Hydrocortisone 100mg Injection", cat:"Steroid Inj" },
  { name:"Triamcinolone 10mg Injection", cat:"Steroid Inj" },
  { name:"Triamcinolone Acetonide 0.1% Oral Paste", cat:"Steroid Topical" },
  { name:"Kenacort 0.1% Dental Paste", cat:"Steroid Topical" },
  { name:"Betamethasone Gel Oral 0.025%", cat:"Steroid Topical" },
  // ── ANTIFUNGALS ─────────────────────────────────────────────
  { name:"Fluconazole 50mg Capsule", cat:"Antifungal" },
  { name:"Fluconazole 100mg Capsule", cat:"Antifungal" },
  { name:"Fluconazole 150mg Capsule", cat:"Antifungal" },
  { name:"Fluconazole 200mg Capsule", cat:"Antifungal" },
  { name:"Fluconazole 2mg/ml Infusion", cat:"Antifungal Inj" },
  { name:"Itraconazole 100mg Capsule", cat:"Antifungal" },
  { name:"Voriconazole 200mg Tablet", cat:"Antifungal" },
  { name:"Amphotericin B 50mg Injection", cat:"Antifungal Inj" },
  { name:"Clotrimazole 1% Oral Gel", cat:"Antifungal Topical" },
  { name:"Miconazole 2% Oral Gel", cat:"Antifungal Topical" },
  { name:"Nystatin 100000 IU/ml Oral Drops", cat:"Antifungal" },
  { name:"Nystatin 500000 IU Tablet", cat:"Antifungal" },
  { name:"Clotrimazole + Betamethasone Cream", cat:"Antifungal Topical" },
  { name:"Ketoconazole 200mg Tablet", cat:"Antifungal" },
  { name:"Ketoconazole 2% Shampoo", cat:"Antifungal Topical" },
  { name:"Terbinafine 250mg Tablet", cat:"Antifungal" },
  // ── ANTIVIRAL ───────────────────────────────────────────────
  { name:"Acyclovir 200mg Tablet", cat:"Antiviral" },
  { name:"Acyclovir 400mg Tablet", cat:"Antiviral" },
  { name:"Acyclovir 800mg Tablet", cat:"Antiviral" },
  { name:"Acyclovir 5% Cream", cat:"Antiviral Topical" },
  { name:"Acyclovir 250mg Injection", cat:"Antiviral Inj" },
  { name:"Valacyclovir 500mg Tablet", cat:"Antiviral" },
  { name:"Valacyclovir 1000mg Tablet", cat:"Antiviral" },
  { name:"Famciclovir 250mg Tablet", cat:"Antiviral" },
  { name:"Oseltamivir 75mg Capsule", cat:"Antiviral" },
  // ── ANTISEPTICS / MOUTHWASH / ORAL CARE ─────────────────────
  { name:"Chlorhexidine Gluconate 0.2% Mouthwash", cat:"Dental Antiseptic" },
  { name:"Chlorhexidine Gluconate 0.12% Mouthwash", cat:"Dental Antiseptic" },
  { name:"Chlorhexidine 1% Gel (Gum Gel)", cat:"Dental Antiseptic" },
  { name:"Povidone Iodine 5% Mouthwash / Gargle", cat:"Dental Antiseptic" },
  { name:"Povidone Iodine 10% Solution", cat:"Antiseptic" },
  { name:"Povidone Iodine 5% Ointment", cat:"Antiseptic Topical" },
  { name:"Hydrogen Peroxide 3% Solution", cat:"Dental Antiseptic" },
  { name:"Hydrogen Peroxide 1.5% Mouthwash", cat:"Dental Antiseptic" },
  { name:"Benzydamine Hydrochloride 0.15% Mouthwash", cat:"Dental Analgesic Rinse" },
  { name:"Hexetidine 0.1% Mouthwash", cat:"Dental Antiseptic" },
  { name:"Sodium Fluoride 0.05% Mouthwash", cat:"Fluoride Rinse" },
  { name:"Sodium Fluoride Varnish 5%", cat:"Fluoride Varnish" },
  { name:"Fluoride Gel APF 1.23%", cat:"Fluoride Gel" },
  { name:"Silver Diamine Fluoride 38%", cat:"Dental Fluoride" },
  { name:"Aloe Vera Gel Oral", cat:"Oral Care" },
  { name:"Hyaluronic Acid Gel 0.2% Oral", cat:"Oral Care" },
  { name:"Triclosan Toothpaste", cat:"Dental Brand" },
  { name:"Sensodyne Toothpaste", cat:"Dental Brand" },
  { name:"Colgate Total Toothpaste", cat:"Dental Brand" },
  { name:"Pepsodent Toothpaste", cat:"Dental Brand" },
  { name:"Emoform Toothpaste", cat:"Dental Brand" },
  { name:"Thermoseal Toothpaste", cat:"Dental Brand" },
  { name:"Himalaya HiOra Toothpaste", cat:"Dental Brand" },
  { name:"Dabur Red Toothpaste", cat:"Dental Brand" },
  { name:"Meswak Toothpaste", cat:"Dental Brand" },
  { name:"Oral-B Electric Toothbrush Head", cat:"Dental Accessory" },
  { name:"Interdental Brush", cat:"Dental Accessory" },
  { name:"Dental Floss", cat:"Dental Accessory" },
  { name:"Tongue Cleaner", cat:"Dental Accessory" },
  { name:"Water Flosser / Oral Irrigator", cat:"Dental Accessory" },
  // ── DENTAL MATERIALS ────────────────────────────────────────
  { name:"GIC Cement (Glass Ionomer Cement)", cat:"Dental Material" },
  { name:"GIC Type II Restorative", cat:"Dental Material" },
  { name:"RMGIC (Resin Modified GIC)", cat:"Dental Material" },
  { name:"Composite Resin A1 Shade", cat:"Dental Material" },
  { name:"Composite Resin A2 Shade", cat:"Dental Material" },
  { name:"Composite Resin A3 Shade", cat:"Dental Material" },
  { name:"Composite Resin B1 Shade", cat:"Dental Material" },
  { name:"Flowable Composite", cat:"Dental Material" },
  { name:"Bulk Fill Composite", cat:"Dental Material" },
  { name:"IRM (Intermediate Restorative Material)", cat:"Dental Material" },
  { name:"Zinc Oxide Eugenol Cement", cat:"Dental Material" },
  { name:"Zinc Phosphate Cement", cat:"Dental Material" },
  { name:"Zinc Polycarboxylate Cement", cat:"Dental Material" },
  { name:"MTA (Mineral Trioxide Aggregate)", cat:"Dental Material" },
  { name:"Calcium Hydroxide Paste", cat:"Dental Material" },
  { name:"Biodentine (Calcium Silicate)", cat:"Dental Material" },
  { name:"Dycal (Calcium Hydroxide Base)", cat:"Dental Material" },
  { name:"Cavity Liner (Varnish)", cat:"Dental Material" },
  { name:"Etchant 37% Phosphoric Acid Gel", cat:"Dental Material" },
  { name:"Bonding Agent (5th Gen)", cat:"Dental Material" },
  { name:"Bonding Agent (7th Gen Self-Etch)", cat:"Dental Material" },
  { name:"Dental Amalgam Capsule", cat:"Dental Material" },
  { name:"Impression Material Alginate", cat:"Dental Material" },
  { name:"Impression Material Polyvinyl Siloxane (PVS)", cat:"Dental Material" },
  { name:"Impression Material Polyether", cat:"Dental Material" },
  { name:"Zinc Oxide Impression Paste", cat:"Dental Material" },
  { name:"Plaster of Paris (Type II)", cat:"Dental Material" },
  { name:"Dental Stone (Type III)", cat:"Dental Material" },
  { name:"Dental Stone (Type IV)", cat:"Dental Material" },
  { name:"Acrylic Resin Heat Cure", cat:"Dental Material" },
  { name:"Acrylic Resin Cold Cure / Self Cure", cat:"Dental Material" },
  { name:"Denture Base Resin", cat:"Dental Material" },
  { name:"Denture Reliner", cat:"Dental Material" },
  { name:"Denture Adhesive Cream", cat:"Dental Material" },
  { name:"Dental Wax (Sheet Wax)", cat:"Dental Material" },
  { name:"Boxing Wax", cat:"Dental Material" },
  { name:"Inlay Wax", cat:"Dental Material" },
  { name:"Sticky Wax", cat:"Dental Material" },
  { name:"Orthodontic Wire NiTi 0.012", cat:"Dental Ortho" },
  { name:"Orthodontic Wire NiTi 0.014", cat:"Dental Ortho" },
  { name:"Orthodontic Wire NiTi 0.016", cat:"Dental Ortho" },
  { name:"Orthodontic Wire SS 0.019x0.025", cat:"Dental Ortho" },
  { name:"Orthodontic Brackets (Metal)", cat:"Dental Ortho" },
  { name:"Orthodontic Brackets (Ceramic)", cat:"Dental Ortho" },
  { name:"Orthodontic Elastic Bands", cat:"Dental Ortho" },
  { name:"Orthodontic Separator Elastics", cat:"Dental Ortho" },
  { name:"Orthodontic Molar Band", cat:"Dental Ortho" },
  { name:"Orthodontic Retainer Wire", cat:"Dental Ortho" },
  { name:"Invisalign Clear Aligner Tray", cat:"Dental Ortho" },
  { name:"Dental Implant Fixture (Titanium)", cat:"Dental Implant" },
  { name:"Dental Implant Abutment", cat:"Dental Implant" },
  { name:"Healing Cap / Cover Screw", cat:"Dental Implant" },
  { name:"Bone Graft Material (Synthetic HA)", cat:"Dental Implant" },
  { name:"Bone Graft Material (Xenograft)", cat:"Dental Implant" },
  { name:"Collagen Membrane (Resorbable)", cat:"Dental Implant" },
  { name:"Titanium Mesh", cat:"Dental Implant" },
  { name:"PRP (Platelet Rich Plasma) Kit", cat:"Dental Surgical" },
  { name:"PRF (Platelet Rich Fibrin) Kit", cat:"Dental Surgical" },
  { name:"Hemostatic Agent (Gelatin Sponge)", cat:"Dental Surgical" },
  { name:"Surgicel (Oxidised Cellulose)", cat:"Haemostatic" },
  { name:"Alvogyl (Dry Socket Dressing)", cat:"Dental Surgical" },
  { name:"Whitehead Varnish (Iodoform Paste)", cat:"Dental Surgical" },
  { name:"Ledermix Paste", cat:"Dental Material" },
  { name:"Root Canal Sealer (AH Plus)", cat:"Endodontic" },
  { name:"Root Canal Sealer (Sealapex)", cat:"Endodontic" },
  { name:"Root Canal Sealer (Zinc Oxide Eugenol)", cat:"Endodontic" },
  { name:"Gutta Percha Points (ISO 20-80)", cat:"Endodontic" },
  { name:"Paper Points (Absorbent Points)", cat:"Endodontic" },
  { name:"EDTA Liquid 17% (Root Canal)", cat:"Endodontic" },
  { name:"EDTA Gel 17% (Root Canal)", cat:"Endodontic" },
  { name:"Sodium Hypochlorite 2.5% Solution", cat:"Endodontic" },
  { name:"Sodium Hypochlorite 5.25% Solution", cat:"Endodontic" },
  { name:"Chlorhexidine 2% Irrigant", cat:"Endodontic" },
  { name:"RC Prep (Root Canal Lubricant)", cat:"Endodontic" },
  { name:"K-Files (Root Canal Files) ISO 6-80", cat:"Endodontic Instrument" },
  { name:"H-Files (Hedstrom Files) ISO 15-60", cat:"Endodontic Instrument" },
  { name:"Rotary NiTi Files (ProTaper)", cat:"Endodontic Instrument" },
  { name:"Rotary NiTi Files (WaveOne Gold)", cat:"Endodontic Instrument" },
  { name:"Rubber Dam Sheet", cat:"Endodontic Accessory" },
  { name:"Rubber Dam Clamp", cat:"Endodontic Accessory" },
  { name:"Rubber Dam Frame", cat:"Endodontic Accessory" },
  { name:"Pulp Capping Agent (Vitrebond)", cat:"Endodontic" },
  { name:"Formocresol Solution", cat:"Endodontic Paediatric" },
  { name:"Buckley's Formocresol", cat:"Endodontic Paediatric" },
  { name:"Zinc Oxide + Iodoform Paste (Kri Paste)", cat:"Endodontic Paediatric" },
  { name:"Stainless Steel Crown (Paediatric)", cat:"Paediatric Dental" },
  { name:"Fluoride Varnish Duraphat 22600 ppm", cat:"Fluoride Varnish" },
  // ── SURGICAL INSTRUMENTS ────────────────────────────────────
  { name:"Scalpel Handle No. 3", cat:"Surgical Instrument" },
  { name:"Scalpel Handle No. 4", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 11", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 12", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 15", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 23", cat:"Surgical Instrument" },
  { name:"Scissors (Metzenbaum)", cat:"Surgical Instrument" },
  { name:"Scissors (Mayo Straight)", cat:"Surgical Instrument" },
  { name:"Scissors (Mayo Curved)", cat:"Surgical Instrument" },
  { name:"Scissors (Iris)", cat:"Surgical Instrument" },
  { name:"Scissors (Dean)", cat:"Surgical Instrument" },
  { name:"Artery Forceps (Straight)", cat:"Surgical Instrument" },
  { name:"Artery Forceps (Curved)", cat:"Surgical Instrument" },
  { name:"Mosquito Forceps", cat:"Surgical Instrument" },
  { name:"Tissue Forceps (Adson)", cat:"Surgical Instrument" },
  { name:"Tissue Forceps (Rat Tooth)", cat:"Surgical Instrument" },
  { name:"Allis Tissue Forceps", cat:"Surgical Instrument" },
  { name:"Babcock Forceps", cat:"Surgical Instrument" },
  { name:"Needle Holder (Mayo Hegar)", cat:"Surgical Instrument" },
  { name:"Needle Holder (Mathieu)", cat:"Surgical Instrument" },
  { name:"Retractor (Langenbeck)", cat:"Surgical Instrument" },
  { name:"Retractor (Army-Navy)", cat:"Surgical Instrument" },
  { name:"Retractor (Minnesota)", cat:"Surgical Instrument" },
  { name:"Cheek Retractor (Plastic)", cat:"Dental Instrument" },
  { name:"Mouth Gag (Doyen)", cat:"Surgical Instrument" },
  { name:"Periosteal Elevator (Molt No.9)", cat:"Dental Instrument" },
  { name:"Periosteal Elevator (Freer)", cat:"Dental Instrument" },
  { name:"Bone Curette (Lucas)", cat:"Dental Instrument" },
  { name:"Surgical Curette", cat:"Surgical Instrument" },
  { name:"Bone File", cat:"Dental Instrument" },
  { name:"Rongeur Forceps (Bone Cutting)", cat:"Surgical Instrument" },
  { name:"Surgical Mallet", cat:"Surgical Instrument" },
  { name:"Osteotome", cat:"Surgical Instrument" },
  { name:"Chisel (Straight)", cat:"Surgical Instrument" },
  { name:"Suction Tip (Yankauer)", cat:"Surgical Instrument" },
  { name:"Suction Tip (Dental Fine Tip)", cat:"Dental Instrument" },
  { name:"Saliva Ejector Tip", cat:"Dental Instrument" },
  { name:"High Volume Evacuator (HVE) Tip", cat:"Dental Instrument" },
  { name:"Air/Water Syringe Tip", cat:"Dental Instrument" },
  // ── DENTAL EXTRACTION FORCEPS ────────────────────────────────
  { name:"Extraction Forceps Upper Anterior", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Premolar", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Molar (Left)", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Molar (Right)", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Anterior", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Premolar", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Molar", cat:"Dental Instrument" },
  { name:"Extraction Forceps Roots (Bayonet)", cat:"Dental Instrument" },
  { name:"Elevator (Straight No. 301)", cat:"Dental Instrument" },
  { name:"Elevator (Cryer Right)", cat:"Dental Instrument" },
  { name:"Elevator (Cryer Left)", cat:"Dental Instrument" },
  { name:"Elevator (Apexo)", cat:"Dental Instrument" },
  { name:"Elevator (Warwick James)", cat:"Dental Instrument" },
  { name:"Elevator (Coupland)", cat:"Dental Instrument" },
  // ── PERIODONTAL INSTRUMENTS ──────────────────────────────────
  { name:"Ultrasonic Scaler Tip (Universal)", cat:"Periodontal Instrument" },
  { name:"Ultrasonic Scaler Tip (Subgingival)", cat:"Periodontal Instrument" },
  { name:"Sickle Scaler H6/H7", cat:"Periodontal Instrument" },
  { name:"Gracey Curette 1/2", cat:"Periodontal Instrument" },
  { name:"Gracey Curette 5/6", cat:"Periodontal Instrument" },
  { name:"Gracey Curette 7/8", cat:"Periodontal Instrument" },
  { name:"Gracey Curette 11/12", cat:"Periodontal Instrument" },
  { name:"Gracey Curette 13/14", cat:"Periodontal Instrument" },
  { name:"Columbia Curette 4R/4L", cat:"Periodontal Instrument" },
  { name:"Periodontal Probe (Williams)", cat:"Periodontal Instrument" },
  { name:"Periodontal Probe (UNC-15)", cat:"Periodontal Instrument" },
  { name:"Periodontal Probe (CPITN)", cat:"Periodontal Instrument" },
  { name:"Suture Scissors (Crown Removing)", cat:"Periodontal Instrument" },
  { name:"Electrosurgery Tip", cat:"Periodontal Instrument" },
  // ── NEEDLES AND SYRINGES ─────────────────────────────────────
  { name:"Dental Needle 27G Short (21mm)", cat:"Dental Needle" },
  { name:"Dental Needle 27G Long (38mm)", cat:"Dental Needle" },
  { name:"Dental Needle 30G Short (21mm)", cat:"Dental Needle" },
  { name:"Dental Needle 25G Long (38mm)", cat:"Dental Needle" },
  { name:"Aspirating Dental Syringe (Breech Loading)", cat:"Dental Instrument" },
  { name:"Disposable Syringe 1ml (Insulin)", cat:"Syringe" },
  { name:"Disposable Syringe 2ml", cat:"Syringe" },
  { name:"Disposable Syringe 5ml", cat:"Syringe" },
  { name:"Disposable Syringe 10ml", cat:"Syringe" },
  { name:"Disposable Syringe 20ml", cat:"Syringe" },
  { name:"Disposable Syringe 50ml (Piston)", cat:"Syringe" },
  { name:"Needle 18G x 1.5 inch", cat:"Needle" },
  { name:"Needle 20G x 1.5 inch", cat:"Needle" },
  { name:"Needle 21G x 1.5 inch", cat:"Needle" },
  { name:"Needle 22G x 1.5 inch", cat:"Needle" },
  { name:"Needle 23G x 1 inch", cat:"Needle" },
  { name:"Needle 24G x 1 inch", cat:"Needle" },
  { name:"Needle 25G x 5/8 inch", cat:"Needle" },
  { name:"Needle 26G x 0.5 inch", cat:"Needle" },
  { name:"IV Cannula 14G (Orange)", cat:"IV Cannula" },
  { name:"IV Cannula 16G (Grey)", cat:"IV Cannula" },
  { name:"IV Cannula 18G (Green)", cat:"IV Cannula" },
  { name:"IV Cannula 20G (Pink)", cat:"IV Cannula" },
  { name:"IV Cannula 22G (Blue)", cat:"IV Cannula" },
  { name:"IV Cannula 24G (Yellow)", cat:"IV Cannula" },
  { name:"Spinal Needle 25G (Quincke)", cat:"Spinal Needle" },
  { name:"Spinal Needle 26G (Quincke)", cat:"Spinal Needle" },
  { name:"Epidural Needle 16G (Tuohy)", cat:"Epidural Needle" },
  { name:"Epidural Catheter", cat:"Epidural Set" },
  { name:"Hypodermic Needle 21G x 1.5\"", cat:"Needle" },
  { name:"Scalp Vein Set 21G (Butterfly)", cat:"IV Accessory" },
  { name:"Scalp Vein Set 23G (Butterfly)", cat:"IV Accessory" },
  { name:"Scalp Vein Set 25G (Butterfly)", cat:"IV Accessory" },
  // ── IV FLUIDS / INFUSIONS ────────────────────────────────────
  { name:"Normal Saline 0.9% 100ml Infusion", cat:"IV Fluid" },
  { name:"Normal Saline 0.9% 500ml Infusion", cat:"IV Fluid" },
  { name:"Normal Saline 0.9% 1000ml Infusion", cat:"IV Fluid" },
  { name:"Ringer's Lactate 500ml Infusion", cat:"IV Fluid" },
  { name:"Ringer's Lactate 1000ml Infusion", cat:"IV Fluid" },
  { name:"Dextrose 5% 100ml Infusion", cat:"IV Fluid" },
  { name:"Dextrose 5% 500ml Infusion", cat:"IV Fluid" },
  { name:"Dextrose 10% 500ml Infusion", cat:"IV Fluid" },
  { name:"Dextrose 25% 200ml Infusion", cat:"IV Fluid" },
  { name:"Dextrose 50% 50ml Injection", cat:"IV Fluid" },
  { name:"Dextrose 5% + Normal Saline 500ml", cat:"IV Fluid" },
  { name:"Dextrose Saline (0.45% NaCl + 5% Dextrose)", cat:"IV Fluid" },
  { name:"Isolyte S 500ml Infusion", cat:"IV Fluid" },
  { name:"Isolyte P 500ml Infusion (Paediatric)", cat:"IV Fluid" },
  { name:"Plasma Expander (Haemaccel) 500ml", cat:"IV Fluid" },
  { name:"Colloid Solution (Albumin 5%) 500ml", cat:"IV Fluid" },
  { name:"Albumin 25% 100ml Infusion", cat:"IV Fluid" },
  { name:"Mannitol 20% 100ml Infusion", cat:"IV Fluid" },
  { name:"Mannitol 20% 500ml Infusion", cat:"IV Fluid" },
  { name:"Sodium Bicarbonate 7.5% 25ml Injection", cat:"IV Fluid" },
  { name:"Potassium Chloride 15% 10ml Ampoule", cat:"IV Electrolyte" },
  { name:"Calcium Gluconate 10% Injection", cat:"IV Electrolyte" },
  { name:"Magnesium Sulphate 50% Injection", cat:"IV Electrolyte" },
  { name:"TPN (Total Parenteral Nutrition) Bag", cat:"IV Nutrition" },
  { name:"Lipid Emulsion 20% Infusion", cat:"IV Nutrition" },
  // ── ANTIEMETICS / GI ─────────────────────────────────────────
  { name:"Ondansetron 4mg Tablet", cat:"Antiemetic" },
  { name:"Ondansetron 8mg Tablet", cat:"Antiemetic" },
  { name:"Ondansetron 2mg/ml Injection", cat:"Antiemetic Inj" },
  { name:"Metoclopramide 10mg Tablet", cat:"Antiemetic" },
  { name:"Metoclopramide 10mg Injection", cat:"Antiemetic Inj" },
  { name:"Domperidone 10mg Tablet", cat:"Antiemetic" },
  { name:"Promethazine 25mg Tablet", cat:"Antiemetic / Antihistamine" },
  { name:"Promethazine 25mg Injection", cat:"Antiemetic Inj" },
  { name:"Granisetron 1mg Tablet", cat:"Antiemetic" },
  { name:"Pantoprazole 20mg Tablet", cat:"Antacid / PPI" },
  { name:"Pantoprazole 40mg Tablet", cat:"Antacid / PPI" },
  { name:"Pantoprazole 40mg Injection", cat:"Antacid Inj" },
  { name:"Omeprazole 20mg Capsule", cat:"Antacid / PPI" },
  { name:"Omeprazole 40mg Injection", cat:"Antacid Inj" },
  { name:"Rabeprazole 20mg Tablet", cat:"Antacid / PPI" },
  { name:"Esomeprazole 40mg Tablet", cat:"Antacid / PPI" },
  { name:"Ranitidine 150mg Tablet", cat:"Antacid / H2 Blocker" },
  { name:"Ranitidine 50mg Injection", cat:"Antacid Inj" },
  { name:"Sucralfate Suspension 1g/10ml", cat:"Antacid" },
  { name:"Antacid Suspension (Digene)", cat:"Antacid" },
  { name:"Antacid Tablet (Gelusil)", cat:"Antacid" },
  { name:"Syp Lactulose 10g/15ml", cat:"Laxative" },
  { name:"Bisacodyl 5mg Tablet", cat:"Laxative" },
  { name:"Bisacodyl Suppository 10mg", cat:"Laxative" },
  { name:"Loperamide 2mg Tablet", cat:"Antidiarrhoeal" },
  { name:"ORS Sachet (WHO Formula)", cat:"Oral Rehydration" },
  { name:"Zinc Sulphate 20mg Tablet (Paediatric)", cat:"Micronutrient" },
  // ── ANTIHISTAMINES / ALLERGY ─────────────────────────────────
  { name:"Cetirizine 5mg Tablet", cat:"Antihistamine" },
  { name:"Cetirizine 10mg Tablet", cat:"Antihistamine" },
  { name:"Cetirizine 5mg/5ml Syrup", cat:"Antihistamine" },
  { name:"Levocetirizine 5mg Tablet", cat:"Antihistamine" },
  { name:"Fexofenadine 120mg Tablet", cat:"Antihistamine" },
  { name:"Fexofenadine 180mg Tablet", cat:"Antihistamine" },
  { name:"Loratadine 10mg Tablet", cat:"Antihistamine" },
  { name:"Chlorpheniramine 4mg Tablet", cat:"Antihistamine" },
  { name:"Chlorpheniramine 10mg Injection", cat:"Antihistamine Inj" },
  { name:"Diphenhydramine 25mg Capsule", cat:"Antihistamine" },
  { name:"Diphenhydramine Injection", cat:"Antihistamine Inj" },
  { name:"Adrenaline (Epinephrine) 1mg/ml Injection", cat:"Emergency Drug" },
  { name:"Hydrocortisone 100mg Injection (Allergy)", cat:"Emergency Drug" },
  { name:"Epinephrine Auto-Injector (EpiPen)", cat:"Emergency Drug" },
  // ── CARDIOVASCULAR ───────────────────────────────────────────
  { name:"Amlodipine 2.5mg Tablet", cat:"Antihypertensive" },
  { name:"Amlodipine 5mg Tablet", cat:"Antihypertensive" },
  { name:"Amlodipine 10mg Tablet", cat:"Antihypertensive" },
  { name:"Atenolol 25mg Tablet", cat:"Beta Blocker" },
  { name:"Atenolol 50mg Tablet", cat:"Beta Blocker" },
  { name:"Atenolol 100mg Tablet", cat:"Beta Blocker" },
  { name:"Metoprolol 25mg Tablet", cat:"Beta Blocker" },
  { name:"Metoprolol 50mg Tablet", cat:"Beta Blocker" },
  { name:"Metoprolol 100mg Tablet", cat:"Beta Blocker" },
  { name:"Propranolol 10mg Tablet", cat:"Beta Blocker" },
  { name:"Propranolol 40mg Tablet", cat:"Beta Blocker" },
  { name:"Losartan 25mg Tablet", cat:"Antihypertensive" },
  { name:"Losartan 50mg Tablet", cat:"Antihypertensive" },
  { name:"Telmisartan 40mg Tablet", cat:"Antihypertensive" },
  { name:"Telmisartan 80mg Tablet", cat:"Antihypertensive" },
  { name:"Ramipril 2.5mg Tablet", cat:"ACE Inhibitor" },
  { name:"Ramipril 5mg Tablet", cat:"ACE Inhibitor" },
  { name:"Enalapril 5mg Tablet", cat:"ACE Inhibitor" },
  { name:"Enalapril 10mg Tablet", cat:"ACE Inhibitor" },
  { name:"Furosemide 20mg Tablet", cat:"Diuretic" },
  { name:"Furosemide 40mg Tablet", cat:"Diuretic" },
  { name:"Furosemide 20mg Injection", cat:"Diuretic Inj" },
  { name:"Spironolactone 25mg Tablet", cat:"Diuretic" },
  { name:"Aspirin 75mg Tablet", cat:"Antiplatelet" },
  { name:"Aspirin 150mg Tablet", cat:"Antiplatelet" },
  { name:"Clopidogrel 75mg Tablet", cat:"Antiplatelet" },
  { name:"Atorvastatin 10mg Tablet", cat:"Statin" },
  { name:"Atorvastatin 20mg Tablet", cat:"Statin" },
  { name:"Atorvastatin 40mg Tablet", cat:"Statin" },
  { name:"Nitroglycerin 0.5mg Sublingual Tablet", cat:"Nitrate" },
  { name:"Nitroglycerin 5mg/ml Infusion", cat:"Nitrate Inj" },
  { name:"Digoxin 0.25mg Tablet", cat:"Cardiac Glycoside" },
  { name:"Amiodarone 200mg Tablet", cat:"Antiarrhythmic" },
  { name:"Warfarin 1mg Tablet", cat:"Anticoagulant" },
  { name:"Warfarin 5mg Tablet", cat:"Anticoagulant" },
  { name:"Heparin 5000 IU Injection", cat:"Anticoagulant Inj" },
  { name:"Protamine Sulphate 10mg Injection", cat:"Anticoagulant Reversal" },
  // ── DIABETES DRUGS ───────────────────────────────────────────
  { name:"Metformin 500mg Tablet", cat:"Antidiabetic" },
  { name:"Metformin 850mg Tablet", cat:"Antidiabetic" },
  { name:"Metformin 1000mg Tablet", cat:"Antidiabetic" },
  { name:"Glimepiride 1mg Tablet", cat:"Antidiabetic" },
  { name:"Glimepiride 2mg Tablet", cat:"Antidiabetic" },
  { name:"Glimepiride 4mg Tablet", cat:"Antidiabetic" },
  { name:"Insulin Regular (Soluble) 100 IU/ml", cat:"Insulin" },
  { name:"Insulin NPH (Isophane) 100 IU/ml", cat:"Insulin" },
  { name:"Insulin Glargine 100 IU/ml (Lantus)", cat:"Insulin" },
  { name:"Insulin Aspart 100 IU/ml (Novorapid)", cat:"Insulin" },
  { name:"Insulin Lispro 100 IU/ml (Humalog)", cat:"Insulin" },
  // ── VITAMINS / SUPPLEMENTS ───────────────────────────────────
  { name:"Vitamin C 500mg Tablet", cat:"Vitamin" },
  { name:"Vitamin C 1000mg Tablet", cat:"Vitamin" },
  { name:"Vitamin D3 60000 IU Capsule (Weekly)", cat:"Vitamin" },
  { name:"Vitamin D3 1000 IU Tablet (Daily)", cat:"Vitamin" },
  { name:"Vitamin B Complex Tablet", cat:"Vitamin" },
  { name:"Vitamin B12 500mcg Tablet", cat:"Vitamin" },
  { name:"Vitamin B12 1000mcg Injection", cat:"Vitamin Inj" },
  { name:"Vitamin K1 10mg Injection", cat:"Vitamin Inj" },
  { name:"Folic Acid 5mg Tablet", cat:"Vitamin" },
  { name:"Iron (Ferrous Sulphate) 200mg Tablet", cat:"Iron Supplement" },
  { name:"Iron + Folic Acid Tablet", cat:"Iron Supplement" },
  { name:"Iron Sucrose 100mg Injection", cat:"Iron Supplement Inj" },
  { name:"Calcium Carbonate 500mg Tablet", cat:"Calcium Supplement" },
  { name:"Calcium + Vitamin D3 Tablet", cat:"Calcium Supplement" },
  { name:"Zinc Sulphate 50mg Tablet", cat:"Micronutrient" },
  { name:"Magnesium Hydroxide 300mg Tablet", cat:"Mineral Supplement" },
  { name:"Multivitamin Tablet (Adult)", cat:"Multivitamin" },
  { name:"Multivitamin Syrup (Paediatric)", cat:"Multivitamin" },
  // ── HAEMOSTATICS / BLEEDING ──────────────────────────────────
  { name:"Tranexamic Acid 500mg Tablet", cat:"Haemostatic" },
  { name:"Tranexamic Acid 250mg/5ml Injection", cat:"Haemostatic Inj" },
  { name:"Etamsylate 250mg Tablet", cat:"Haemostatic" },
  { name:"Etamsylate 125mg/2ml Injection", cat:"Haemostatic Inj" },
  { name:"Gelatin Sponge (Absorbable Haemostat)", cat:"Haemostatic" },
  { name:"Bone Wax", cat:"Haemostatic Surgical" },
  { name:"Thrombin Topical Powder", cat:"Haemostatic" },
  { name:"Fibrin Glue (Tisseel)", cat:"Haemostatic Surgical" },
  // ── SUTURE MATERIALS ─────────────────────────────────────────
  { name:"Vicryl (Polyglactin 910) 3-0 Suture", cat:"Suture" },
  { name:"Vicryl (Polyglactin 910) 4-0 Suture", cat:"Suture" },
  { name:"Vicryl Rapid 4-0 Suture", cat:"Suture" },
  { name:"Chromic Catgut 2-0 Suture", cat:"Suture" },
  { name:"Chromic Catgut 3-0 Suture", cat:"Suture" },
  { name:"Plain Catgut 2-0 Suture", cat:"Suture" },
  { name:"Silk Suture 2-0 Black Braided", cat:"Suture" },
  { name:"Silk Suture 3-0 Black Braided", cat:"Suture" },
  { name:"Silk Suture 4-0 Black Braided", cat:"Suture" },
  { name:"Nylon Suture 3-0 (Ethilon)", cat:"Suture" },
  { name:"Nylon Suture 4-0 (Ethilon)", cat:"Suture" },
  { name:"Nylon Suture 5-0 (Ethilon)", cat:"Suture" },
  { name:"Prolene (Polypropylene) 3-0 Suture", cat:"Suture" },
  { name:"Prolene (Polypropylene) 4-0 Suture", cat:"Suture" },
  { name:"PDS II (Polydioxanone) 3-0 Suture", cat:"Suture" },
  { name:"Monocryl 4-0 Suture (Poliglecaprone)", cat:"Suture" },
  { name:"Stapler Skin (Proximate Plus)", cat:"Surgical Closure" },
  { name:"Skin Staple Remover", cat:"Surgical Instrument" },
  { name:"Steri-Strip (Wound Closure Strip)", cat:"Wound Care" },
  { name:"Surgical Glue (Dermabond / Histoacryl)", cat:"Wound Care" },
  // ── DRESSINGS / WOUND CARE ───────────────────────────────────
  { name:"Gauze Swab 4x4 inch (Sterile)", cat:"Dressing" },
  { name:"Gauze Swab 10x10 cm (Non-Sterile)", cat:"Dressing" },
  { name:"ABD Pad (Combine Dressing)", cat:"Dressing" },
  { name:"Crepe Bandage 4 inch", cat:"Bandage" },
  { name:"Crepe Bandage 6 inch", cat:"Bandage" },
  { name:"Adhesive Plaster Roll 1 inch", cat:"Bandage" },
  { name:"Elastic Adhesive Bandage (EAB)", cat:"Bandage" },
  { name:"Cohesive Bandage", cat:"Bandage" },
  { name:"Cotton Roll (Non-Sterile)", cat:"Dental Material" },
  { name:"Cotton Roll Sterile", cat:"Dressing" },
  { name:"Absorbable Haemostatic Gauze", cat:"Haemostatic Dressing" },
  { name:"Vaseline Gauze (Petrolatum Gauze)", cat:"Dressing" },
  { name:"Jelonet Paraffin Gauze", cat:"Dressing" },
  { name:"Melolin Non-Adherent Dressing", cat:"Dressing" },
  { name:"Hydrocolloid Dressing (DuoDERM)", cat:"Dressing" },
  { name:"Hydrogel Dressing", cat:"Dressing" },
  { name:"Foam Dressing", cat:"Dressing" },
  { name:"Alginate Dressing", cat:"Dressing" },
  { name:"Transparent Film Dressing (Tegaderm)", cat:"Dressing" },
  { name:"Povidone Iodine Gauze", cat:"Dressing" },
  { name:"Silver Sulfadiazine 1% Cream", cat:"Burns Dressing" },
  { name:"Bacitracin Ointment", cat:"Topical Antibiotic" },
  { name:"Mupirocin 2% Ointment (Bactroban)", cat:"Topical Antibiotic" },
  { name:"Fusidic Acid 2% Cream", cat:"Topical Antibiotic" },
  { name:"Framycetin (Soframycin) Cream", cat:"Topical Antibiotic" },
  // ── GLOVES / PPE / DISPOSABLES ───────────────────────────────
  { name:"Latex Examination Gloves (S/M/L)", cat:"PPE" },
  { name:"Nitrile Examination Gloves (S/M/L)", cat:"PPE" },
  { name:"Sterile Surgical Gloves 6.0", cat:"PPE" },
  { name:"Sterile Surgical Gloves 6.5", cat:"PPE" },
  { name:"Sterile Surgical Gloves 7.0", cat:"PPE" },
  { name:"Sterile Surgical Gloves 7.5", cat:"PPE" },
  { name:"Sterile Surgical Gloves 8.0", cat:"PPE" },
  { name:"Surgical Mask (3-ply)", cat:"PPE" },
  { name:"N95 Respirator Mask (FFP2)", cat:"PPE" },
  { name:"Face Shield", cat:"PPE" },
  { name:"Surgical Cap / Head Cover", cat:"PPE" },
  { name:"Shoe Cover (Surgical Boot Cover)", cat:"PPE" },
  { name:"Sterile Gown (Surgical)", cat:"PPE" },
  { name:"Disposable Apron", cat:"PPE" },
  { name:"Safety Goggles", cat:"PPE" },
  { name:"Sharps Container 5L", cat:"Waste Disposal" },
  { name:"Yellow Biohazard Bag", cat:"Waste Disposal" },
  { name:"Red Biohazard Bag", cat:"Waste Disposal" },
  { name:"IV Line / Infusion Set", cat:"IV Accessory" },
  { name:"Burette Set (Paediatric IV Set)", cat:"IV Accessory" },
  { name:"Blood Transfusion Set", cat:"IV Accessory" },
  { name:"Nasogastric Tube (Ryle's Tube) 14F", cat:"Medical Device" },
  { name:"Nasogastric Tube 16F", cat:"Medical Device" },
  { name:"Foley Catheter 14F (2-Way)", cat:"Medical Device" },
  { name:"Foley Catheter 16F (2-Way)", cat:"Medical Device" },
  { name:"Foley Catheter 18F (3-Way)", cat:"Medical Device" },
  { name:"Urobag (Urine Collection Bag)", cat:"Medical Device" },
  { name:"Tracheostomy Tube (Cuffed) Size 7", cat:"Medical Device" },
  { name:"Endotracheal Tube (ETT) 7.0 Cuffed", cat:"Anaesthesia Device" },
  { name:"Endotracheal Tube (ETT) 7.5 Cuffed", cat:"Anaesthesia Device" },
  { name:"Laryngoscope Blade (Macintosh Size 3)", cat:"Anaesthesia Device" },
  { name:"Laryngeal Mask Airway (LMA) Size 3", cat:"Anaesthesia Device" },
  { name:"Oropharyngeal Airway (Guedel) Size 3", cat:"Anaesthesia Device" },
  { name:"Bag Valve Mask (BVM Resuscitator)", cat:"Emergency Device" },
  { name:"Pulse Oximeter Probe", cat:"Monitoring Device" },
  { name:"BP Cuff (Sphygmomanometer Cuff)", cat:"Monitoring Device" },
  // ── RESPIRATORY / BRONCHODILATORS ───────────────────────────
  { name:"Salbutamol 2mg Tablet", cat:"Bronchodilator" },
  { name:"Salbutamol 4mg Tablet", cat:"Bronchodilator" },
  { name:"Salbutamol 2.5mg/2.5ml Nebulisation", cat:"Bronchodilator" },
  { name:"Salbutamol Inhaler 100mcg (MDI)", cat:"Bronchodilator Inhaler" },
  { name:"Ipratropium 0.5mg Nebulisation", cat:"Bronchodilator" },
  { name:"Budesonide 0.5mg Nebulisation", cat:"Steroid Inhaler" },
  { name:"Doxofylline 400mg Tablet", cat:"Bronchodilator" },
  { name:"Deriphylline Injection", cat:"Bronchodilator Inj" },
  // ── ANTIEPILEPTICS ───────────────────────────────────────────
  { name:"Phenytoin 100mg Tablet", cat:"Antiepileptic" },
  { name:"Phenytoin 50mg/ml Injection", cat:"Antiepileptic Inj" },
  { name:"Valproate 200mg Tablet", cat:"Antiepileptic" },
  { name:"Valproate 500mg Tablet", cat:"Antiepileptic" },
  { name:"Levetiracetam 500mg Tablet", cat:"Antiepileptic" },
  { name:"Lorazepam 4mg Injection", cat:"Antiepileptic / Sedative Inj" },
  { name:"Diazepam 10mg Injection", cat:"Antiepileptic / Sedative Inj" },
  { name:"Clonazepam 0.5mg Tablet", cat:"Antiepileptic" },
  { name:"Clonazepam 2mg Tablet", cat:"Antiepileptic" },
  // ── VACCINES ─────────────────────────────────────────────────
  { name:"Tetanus Toxoid 0.5ml Injection", cat:"Vaccine" },
  { name:"Tetanus + Diphtheria (Td) Vaccine", cat:"Vaccine" },
  { name:"Influenza Vaccine (Flu Shot)", cat:"Vaccine" },
  { name:"Typhoid Vaccine (Vi Polysaccharide)", cat:"Vaccine" },
  { name:"Rabies Vaccine (Post-Exposure)", cat:"Vaccine" },
  { name:"Rabies Immunoglobulin (Human)", cat:"Vaccine" },
  { name:"MMR Vaccine", cat:"Vaccine" },
  { name:"Varicella (Chickenpox) Vaccine", cat:"Vaccine" },
  { name:"HPV Vaccine (Gardasil 4/9)", cat:"Vaccine" },
  { name:"COVID-19 Vaccine (Covishield)", cat:"Vaccine" },
  { name:"COVID-19 Vaccine (Covaxin)", cat:"Vaccine" },
  { name:"Anti-Tetanus Serum (ATS)", cat:"Antiserum" },
  { name:"Anti-Snake Venom (Polyvalent)", cat:"Antiserum" },
  { name:"Anti-Rabies Serum", cat:"Antiserum" },
  { name:"Anti-Scorpion Venom Serum", cat:"Antiserum" },
  // ── INVESTIGATIONS / LAB ─────────────────────────────────────
  { name:"OPG (Orthopantomogram) X-ray", cat:"Dental Investigation" },
  { name:"IOPA X-ray (Intraoral Periapical)", cat:"Dental Investigation" },
  { name:"Bitewing X-ray", cat:"Dental Investigation" },
  { name:"CBCT Scan (Cone Beam CT)", cat:"Dental Investigation" },
  { name:"Occlusal X-ray", cat:"Dental Investigation" },
  { name:"Lateral Cephalogram X-ray", cat:"Dental Investigation" },
  { name:"Chest X-ray PA View", cat:"Investigation" },
  { name:"Skull X-ray AP + Lateral", cat:"Investigation" },
  { name:"X-Ray Mandible PA View", cat:"Investigation" },
  { name:"X-Ray Waters View (PNS)", cat:"Investigation" },
  { name:"ECG (Electrocardiogram)", cat:"Investigation" },
  { name:"CT Scan Head Plain", cat:"Investigation" },
  { name:"CT Scan Neck with Contrast", cat:"Investigation" },
  { name:"MRI Face and Jaw", cat:"Investigation" },
  { name:"Ultrasound Neck / Submandibular", cat:"Investigation" },
  { name:"Complete Blood Count (CBC)", cat:"Lab Test" },
  { name:"Differential Count (DC)", cat:"Lab Test" },
  { name:"Blood Sugar Fasting (BSF)", cat:"Lab Test" },
  { name:"Blood Sugar Post Prandial (BSPP)", cat:"Lab Test" },
  { name:"Random Blood Sugar (RBS)", cat:"Lab Test" },
  { name:"HbA1c Test", cat:"Lab Test" },
  { name:"Liver Function Test (LFT)", cat:"Lab Test" },
  { name:"Kidney Function Test (KFT) / RFT", cat:"Lab Test" },
  { name:"Thyroid Function Test (TFT)", cat:"Lab Test" },
  { name:"Lipid Profile Test", cat:"Lab Test" },
  { name:"Urine Routine and Microscopy", cat:"Lab Test" },
  { name:"Blood Group and Rh Typing", cat:"Lab Test" },
  { name:"Platelet Count", cat:"Lab Test" },
  { name:"PT / INR (Prothrombin Time)", cat:"Lab Test" },
  { name:"APTT Test", cat:"Lab Test" },
  { name:"Bleeding Time (BT)", cat:"Lab Test" },
  { name:"Clotting Time (CT)", cat:"Lab Test" },
  { name:"ESR (Erythrocyte Sedimentation Rate)", cat:"Lab Test" },
  { name:"CRP (C-Reactive Protein)", cat:"Lab Test" },
  { name:"Serum Calcium Test", cat:"Lab Test" },
  { name:"Serum Phosphorus Test", cat:"Lab Test" },
  { name:"Serum Vitamin D (25-OH) Test", cat:"Lab Test" },
  { name:"Serum Vitamin B12 Test", cat:"Lab Test" },
  { name:"Serum Iron / TIBC Test", cat:"Lab Test" },
  { name:"HIV Test (ELISA)", cat:"Lab Test" },
  { name:"HBsAg Test (Hepatitis B Surface Antigen)", cat:"Lab Test" },
  { name:"Anti-HCV Test (Hepatitis C)", cat:"Lab Test" },
  { name:"VDRL / RPR Test (Syphilis)", cat:"Lab Test" },
  { name:"Pus Culture and Sensitivity", cat:"Lab Test" },
  { name:"Blood Culture and Sensitivity", cat:"Lab Test" },
  { name:"FNAC (Fine Needle Aspiration Cytology)", cat:"Biopsy" },
  { name:"Incisional Biopsy", cat:"Biopsy" },
  { name:"Excisional Biopsy", cat:"Biopsy" },
  { name:"Exfoliative Cytology (Oral Smear)", cat:"Lab Test" },
  { name:"Histopathology (HPE)", cat:"Lab Test" },
  // ── EMERGENCY DRUGS ─────────────────────────────────────────
  { name:"Adrenaline 1:1000 (1mg/ml) Injection", cat:"Emergency Drug" },
  { name:"Adrenaline 1:10000 Injection (Cardiac)", cat:"Emergency Drug" },
  { name:"Atropine 0.6mg Injection", cat:"Emergency Drug" },
  { name:"Sodium Bicarbonate 8.4% Injection", cat:"Emergency Drug" },
  { name:"Calcium Gluconate 10% Injection", cat:"Emergency Drug" },
  { name:"Dextrose 50% Injection (Hypoglycaemia)", cat:"Emergency Drug" },
  { name:"Naloxone 0.4mg Injection (Opioid Reversal)", cat:"Emergency Drug" },
  { name:"Flumazenil 0.5mg Injection (Benzo Reversal)", cat:"Emergency Drug" },
  { name:"Dopamine 200mg Infusion", cat:"Emergency Drug Inj" },
  { name:"Noradrenaline (Norepinephrine) Infusion", cat:"Emergency Drug Inj" },
  { name:"Vasopressin 20 IU Injection", cat:"Emergency Drug Inj" },
  { name:"GTN (Glyceryl Trinitrate) Infusion", cat:"Emergency Drug Inj" },
  { name:"Lignocaine 100mg IV Injection (Arrhythmia)", cat:"Emergency Drug Inj" },
  { name:"Adenosine 6mg Injection (SVT)", cat:"Emergency Drug Inj" },
  { name:"Defibrillator Pads (AED Electrode)", cat:"Emergency Device" },,
  // ── CONSUMABLES: COTTON & GAUZE ──────────────────────────────
  { name:"Cotton Roll (Dental Grade)", cat:"Consumable" },
  { name:"Cotton Pellet Small", cat:"Consumable" },
  { name:"Cotton Pellet Medium", cat:"Consumable" },
  { name:"Cotton Pellet Large", cat:"Consumable" },
  { name:"Absorbent Cotton Wool 500g Roll", cat:"Consumable" },
  { name:"Absorbent Cotton Wool 100g", cat:"Consumable" },
  { name:"Gauze Swab 4x4 inch Sterile", cat:"Consumable" },
  { name:"Gauze Swab 2x2 inch Sterile", cat:"Consumable" },
  { name:"Gauze Roll 5cm x 5m", cat:"Consumable" },
  { name:"Gauze Roll 10cm x 5m", cat:"Consumable" },
  { name:"Non-Woven Gauze Swab 4x4", cat:"Consumable" },
  { name:"Paraffin Gauze Dressing", cat:"Dressing" },
  { name:"Betadine Gauze Dressing", cat:"Dressing" },
  { name:"Ribbon Gauze 1/2 inch (Dental Packing)", cat:"Dental Consumable" },
  { name:"Ribbon Gauze 1 inch", cat:"Dental Consumable" },
  { name:"Dry Foil (Dental)", cat:"Dental Consumable" },

  // ── SALINE & IV FLUIDS ─────────────────────────────────────────
  { name:"Normal Saline 0.9% 100ml", cat:"IV Fluid" },
  { name:"Normal Saline 0.9% 250ml", cat:"IV Fluid" },
  { name:"Normal Saline 0.9% 500ml", cat:"IV Fluid" },
  { name:"Normal Saline 0.9% 1000ml", cat:"IV Fluid" },
  { name:"Dextrose 5% 100ml", cat:"IV Fluid" },
  { name:"Dextrose 5% 250ml", cat:"IV Fluid" },
  { name:"Dextrose 5% 500ml", cat:"IV Fluid" },
  { name:"Dextrose 5% 1000ml", cat:"IV Fluid" },
  { name:"Dextrose 10% 500ml", cat:"IV Fluid" },
  { name:"Dextrose 25% 100ml", cat:"IV Fluid" },
  { name:"Dextrose 50% 50ml", cat:"IV Fluid" },
  { name:"Ringer Lactate 500ml", cat:"IV Fluid" },
  { name:"Ringer Lactate 1000ml", cat:"IV Fluid" },
  { name:"DNS (Dextrose Normal Saline) 500ml", cat:"IV Fluid" },
  { name:"DNS 1000ml", cat:"IV Fluid" },
  { name:"Haemaccel 500ml Infusion", cat:"IV Fluid" },
  { name:"Gelofusine 500ml Infusion", cat:"IV Fluid" },
  { name:"Mannitol 20% 100ml", cat:"IV Fluid" },
  { name:"Mannitol 20% 250ml", cat:"IV Fluid" },
  { name:"Sodium Bicarbonate 7.5% 25ml", cat:"IV Electrolyte" },
  { name:"Sodium Bicarbonate 8.4% 100ml", cat:"IV Electrolyte" },
  { name:"Potassium Chloride 15% 10ml Ampoule", cat:"IV Electrolyte" },
  { name:"Calcium Gluconate 10% 10ml Injection", cat:"IV Electrolyte" },
  { name:"Magnesium Sulphate 50% 2ml Injection", cat:"IV Electrolyte" },

  // ── NEEDLES ────────────────────────────────────────────────────
  { name:"Disposable Syringe 1ml (Insulin Type)", cat:"Needle/Syringe" },
  { name:"Disposable Syringe 2ml", cat:"Needle/Syringe" },
  { name:"Disposable Syringe 5ml", cat:"Needle/Syringe" },
  { name:"Disposable Syringe 10ml", cat:"Needle/Syringe" },
  { name:"Disposable Syringe 20ml", cat:"Needle/Syringe" },
  { name:"Disposable Syringe 50ml", cat:"Needle/Syringe" },
  { name:"Hypodermic Needle 18G", cat:"Needle/Syringe" },
  { name:"Hypodermic Needle 20G", cat:"Needle/Syringe" },
  { name:"Hypodermic Needle 22G", cat:"Needle/Syringe" },
  { name:"Hypodermic Needle 24G", cat:"Needle/Syringe" },
  { name:"Hypodermic Needle 26G", cat:"Needle/Syringe" },
  { name:"Dental Needle 27G Short", cat:"Dental Needle" },
  { name:"Dental Needle 27G Long", cat:"Dental Needle" },
  { name:"Dental Needle 30G Short", cat:"Dental Needle" },
  { name:"Dental Needle 30G Ultra Short", cat:"Dental Needle" },
  { name:"Scalp Vein Set (Butterfly) 21G", cat:"IV Accessory" },
  { name:"Scalp Vein Set (Butterfly) 23G", cat:"IV Accessory" },
  { name:"Scalp Vein Set (Butterfly) 25G", cat:"IV Accessory" },
  { name:"IV Cannula 14G (Orange)", cat:"IV Cannula" },
  { name:"IV Cannula 16G (Grey)", cat:"IV Cannula" },
  { name:"IV Cannula 18G (Green)", cat:"IV Cannula" },
  { name:"IV Cannula 20G (Pink)", cat:"IV Cannula" },
  { name:"IV Cannula 22G (Blue)", cat:"IV Cannula" },
  { name:"IV Cannula 24G (Yellow) Paediatric", cat:"IV Cannula" },
  { name:"Spinal Needle 25G (Quincke)", cat:"Spinal Needle" },
  { name:"Spinal Needle 26G", cat:"Spinal Needle" },
  { name:"Spinal Needle 27G", cat:"Spinal Needle" },
  { name:"Epidural Needle 16G (Tuohy)", cat:"Epidural Needle" },
  { name:"Epidural Needle 17G (Tuohy)", cat:"Epidural Needle" },

  // ── INJECTIONS & AMPOULES ──────────────────────────────────────
  { name:"Lignocaine 2% with Adrenaline 1:80000 Cartridge (Dental)", cat:"Local Anaesthetic" },
  { name:"Lignocaine 2% with Adrenaline 1:100000 Cartridge", cat:"Local Anaesthetic" },
  { name:"Lignocaine 2% Plain Cartridge (Dental)", cat:"Local Anaesthetic" },
  { name:"Articaine 4% with Adrenaline 1:100000 Cartridge", cat:"Local Anaesthetic" },
  { name:"Articaine 4% with Adrenaline 1:200000 Cartridge", cat:"Local Anaesthetic" },
  { name:"Mepivacaine 3% Plain Cartridge", cat:"Local Anaesthetic" },
  { name:"Bupivacaine 0.5% Injection", cat:"Local Anaesthetic" },
  { name:"Bupivacaine 0.5% with Adrenaline", cat:"Local Anaesthetic" },
  { name:"Prilocaine 4% Plain Cartridge", cat:"Local Anaesthetic" },
  { name:"Benzocaine 20% Topical Gel (Dental)", cat:"Local Anaesthetic Topical" },
  { name:"Lidocaine 2% Topical Jelly", cat:"Local Anaesthetic Topical" },
  { name:"EMLA Cream (Lidocaine + Prilocaine)", cat:"Local Anaesthetic Topical" },
  { name:"Xylocaine 2% Jelly 30g", cat:"Local Anaesthetic Topical" },
  { name:"Dexamethasone 4mg Injection", cat:"Steroid Inj" },
  { name:"Dexamethasone 8mg Injection", cat:"Steroid Inj" },
  { name:"Hydrocortisone 100mg Injection", cat:"Steroid Inj" },
  { name:"Hydrocortisone 250mg Injection", cat:"Steroid Inj" },
  { name:"Methylprednisolone 40mg Injection", cat:"Steroid Inj" },
  { name:"Methylprednisolone 125mg Injection", cat:"Steroid Inj" },
  { name:"Ketorolac 30mg Injection", cat:"NSAID Inj" },
  { name:"Diclofenac 75mg Injection", cat:"NSAID Inj" },
  { name:"Tramadol 50mg Injection", cat:"Painkiller Inj" },
  { name:"Tramadol 100mg Injection", cat:"Painkiller Inj" },
  { name:"Morphine 10mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Pethidine 50mg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Fentanyl 50mcg Injection", cat:"Opioid Analgesic Inj" },
  { name:"Ondansetron 4mg Injection", cat:"Antiemetic Inj" },
  { name:"Metoclopramide 10mg Injection", cat:"Antiemetic Inj" },
  { name:"Promethazine 25mg Injection", cat:"Antiemetic Inj" },
  { name:"Chlorpheniramine 10mg Injection", cat:"Antihistamine Inj" },
  { name:"Pheniramine 22.75mg Injection", cat:"Antihistamine Inj" },
  { name:"Midazolam 1mg/ml Injection", cat:"Sedative" },
  { name:"Midazolam 5mg/ml Injection", cat:"Sedative" },
  { name:"Diazepam 5mg Injection", cat:"Sedative" },
  { name:"Propofol 10mg/ml Injection", cat:"General Anaesthesia" },
  { name:"Ketamine 200mg Injection", cat:"General Anaesthesia" },
  { name:"Atropine 0.6mg Injection", cat:"Anticholinergic" },
  { name:"Neostigmine 0.5mg Injection", cat:"Reversal Agent" },
  { name:"Succinylcholine 100mg Injection", cat:"Muscle Relaxant" },
  { name:"Vecuronium 4mg Injection", cat:"Muscle Relaxant" },
  { name:"Atracurium 25mg Injection", cat:"Muscle Relaxant" },
  { name:"Furosemide 20mg Injection", cat:"Diuretic Inj" },
  { name:"Furosemide 40mg Injection", cat:"Diuretic Inj" },
  { name:"Ranitidine 50mg Injection", cat:"Antacid Inj" },
  { name:"Pantoprazole 40mg Injection", cat:"Antacid Inj" },
  { name:"Omeprazole 40mg Injection", cat:"Antacid Inj" },
  { name:"Phytomenadione (Vitamin K1) 10mg Injection", cat:"Haemostatic Inj" },
  { name:"Tranexamic Acid 500mg Injection", cat:"Haemostatic Inj" },
  { name:"Etamsylate 250mg Injection", cat:"Haemostatic Inj" },
  { name:"Oxytocin 10 IU Injection", cat:"Haemostatic Inj" },
  { name:"Dextrose 50% 50ml Push", cat:"Emergency Drug Inj" },
  { name:"Naloxone 0.4mg Injection", cat:"Reversal Agent" },
  { name:"Flumazenil 0.5mg Injection", cat:"Reversal Agent" },
  { name:"Calcium Gluconate 1g Injection", cat:"Emergency Drug Inj" },

  // ── SURGICAL INSTRUMENTS ───────────────────────────────────────
  { name:"Scalpel Handle No. 3", cat:"Surgical Instrument" },
  { name:"Scalpel Handle No. 4", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 11", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 12", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 15", cat:"Surgical Instrument" },
  { name:"Scalpel Blade No. 22", cat:"Surgical Instrument" },
  { name:"Surgical Scissors Straight (Mayo)", cat:"Surgical Instrument" },
  { name:"Surgical Scissors Curved (Mayo)", cat:"Surgical Instrument" },
  { name:"Metzenbaum Scissors", cat:"Surgical Instrument" },
  { name:"Iris Scissors", cat:"Surgical Instrument" },
  { name:"Dissecting Forceps (Toothed) Adson", cat:"Surgical Instrument" },
  { name:"Dissecting Forceps (Non-Toothed)", cat:"Surgical Instrument" },
  { name:"Haemostat (Mosquito Forceps) Straight", cat:"Surgical Instrument" },
  { name:"Haemostat (Mosquito Forceps) Curved", cat:"Surgical Instrument" },
  { name:"Artery Forceps (Kocher) Straight", cat:"Surgical Instrument" },
  { name:"Artery Forceps (Kocher) Curved", cat:"Surgical Instrument" },
  { name:"Needle Holder (Mayo-Hegar)", cat:"Surgical Instrument" },
  { name:"Retractor (Langenbeck) Small", cat:"Surgical Instrument" },
  { name:"Retractor (Langenbeck) Large", cat:"Surgical Instrument" },
  { name:"Self-Retaining Retractor (Weitlaner)", cat:"Surgical Instrument" },
  { name:"Bone Rongeur Forceps", cat:"Surgical Instrument" },
  { name:"Curette Small", cat:"Surgical Instrument" },
  { name:"Curette Large", cat:"Surgical Instrument" },
  { name:"Periosteal Elevator (Molt No.9)", cat:"Dental Instrument" },
  { name:"Periosteal Elevator (Freer)", cat:"Dental Instrument" },
  { name:"Luxator (Periotome)", cat:"Dental Instrument" },
  { name:"Dental Elevator (Straight)", cat:"Dental Instrument" },
  { name:"Dental Elevator (Cryer)", cat:"Dental Instrument" },
  { name:"Dental Elevator (Warwick James)", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Anteriors", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Premolars", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Molars (Cowhorn)", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Anteriors", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Molars", cat:"Dental Instrument" },
  { name:"Extraction Forceps Upper Wisdom", cat:"Dental Instrument" },
  { name:"Extraction Forceps Lower Wisdom", cat:"Dental Instrument" },
  { name:"Bone File (Dental)", cat:"Dental Instrument" },
  { name:"Bone Chisel (Dental)", cat:"Dental Instrument" },
  { name:"Mallet (Surgical)", cat:"Dental Instrument" },
  { name:"Rongeur Forceps (Dental)", cat:"Dental Instrument" },
  { name:"Tissue Scissors (Dental)", cat:"Dental Instrument" },
  { name:"Tongue Retractor", cat:"Dental Instrument" },
  { name:"Cheek Retractor (Minnesota)", cat:"Dental Instrument" },
  { name:"Austin/Channel Retractor", cat:"Dental Instrument" },
  { name:"Dental Mirror No. 5", cat:"Dental Instrument" },
  { name:"Dental Probe (CPI/UNC-15)", cat:"Dental Instrument" },
  { name:"Dental Tweezers (College Pliers)", cat:"Dental Instrument" },
  { name:"Dental Excavator Double Ended", cat:"Dental Instrument" },
  { name:"Spoon Excavator Small", cat:"Dental Instrument" },
  { name:"Spoon Excavator Medium", cat:"Dental Instrument" },
  { name:"Amalgam Plugger", cat:"Dental Instrument" },
  { name:"Composite Placement Instrument", cat:"Dental Instrument" },
  { name:"Burnisher Ball", cat:"Dental Instrument" },
  { name:"Burnisher Acorn", cat:"Dental Instrument" },
  { name:"Sickle Scaler (H6/H7)", cat:"Periodontal Instrument" },
  { name:"Gracey Curette No. 1/2", cat:"Periodontal Instrument" },
  { name:"Gracey Curette No. 7/8", cat:"Periodontal Instrument" },
  { name:"Gracey Curette No. 11/12", cat:"Periodontal Instrument" },
  { name:"Gracey Curette No. 13/14", cat:"Periodontal Instrument" },
  { name:"Columbia Curette", cat:"Periodontal Instrument" },
  { name:"Hoe Scaler", cat:"Periodontal Instrument" },
  { name:"File Scaler", cat:"Periodontal Instrument" },
  { name:"Ultrasonic Scaler Tip (Slim)", cat:"Periodontal Instrument" },
  { name:"Ultrasonic Scaler Tip (Universal)", cat:"Periodontal Instrument" },

  // ── SUTURES ─────────────────────────────────────────────────────
  { name:"Vicryl 3-0 (Polyglactin) Absorbable", cat:"Suture" },
  { name:"Vicryl 4-0 Absorbable", cat:"Suture" },
  { name:"Vicryl 5-0 Absorbable", cat:"Suture" },
  { name:"Catgut Plain 2-0", cat:"Suture" },
  { name:"Catgut Plain 3-0", cat:"Suture" },
  { name:"Catgut Chromic 2-0", cat:"Suture" },
  { name:"Catgut Chromic 3-0", cat:"Suture" },
  { name:"Catgut Chromic 4-0", cat:"Suture" },
  { name:"Silk 2-0 Non-Absorbable", cat:"Suture" },
  { name:"Silk 3-0 Non-Absorbable (Dental)", cat:"Suture" },
  { name:"Silk 4-0 Non-Absorbable", cat:"Suture" },
  { name:"Prolene 4-0 (Polypropylene)", cat:"Suture" },
  { name:"Prolene 5-0", cat:"Suture" },
  { name:"Prolene 6-0", cat:"Suture" },
  { name:"Nylon 3-0 Monofilament", cat:"Suture" },
  { name:"Nylon 4-0 Monofilament", cat:"Suture" },
  { name:"Nylon 5-0 Monofilament", cat:"Suture" },
  { name:"PDS II 3-0 (Polydioxanone)", cat:"Suture" },
  { name:"PDS II 4-0", cat:"Suture" },
  { name:"Monocryl 4-0 (Poliglecaprone)", cat:"Suture" },
  { name:"Monocryl 5-0", cat:"Suture" },
  { name:"Ethibond 0 (Polyester)", cat:"Suture" },
  { name:"Ethibond 2-0", cat:"Suture" },
  { name:"Stapler (Skin Staples)", cat:"Surgical Closure" },
  { name:"Steri-Strip Wound Closure 6mm", cat:"Surgical Closure" },
  { name:"Steri-Strip Wound Closure 12mm", cat:"Surgical Closure" },
  { name:"Tissue Glue (Dermabond/Histoacryl)", cat:"Surgical Closure" },

  // ── IV DRIP ACCESSORIES ────────────────────────────────────────
  { name:"IV Infusion Set (Standard)", cat:"IV Accessory" },
  { name:"IV Infusion Set (Burette 100ml Paediatric)", cat:"IV Accessory" },
  { name:"Blood Transfusion Set", cat:"IV Accessory" },
  { name:"Extension Tubing (IV Line)", cat:"IV Accessory" },
  { name:"Three-Way Stopcock", cat:"IV Accessory" },
  { name:"Tegaderm IV Dressing 6x7cm", cat:"IV Accessory" },
  { name:"Transparent Dressing IV Site", cat:"IV Accessory" },
  { name:"IV Arm Board (Splint)", cat:"IV Accessory" },
  { name:"Normal Saline Flush 10ml Pre-filled", cat:"IV Accessory" },
  { name:"Heparin Flush 10 IU/ml", cat:"IV Accessory" },

  // ── DRESSINGS & WOUND CARE ─────────────────────────────────────
  { name:"Adhesive Plaster Roll 1 inch", cat:"Wound Care" },
  { name:"Adhesive Plaster Roll 2 inch", cat:"Wound Care" },
  { name:"Band-Aid Fabric 1 inch", cat:"Wound Care" },
  { name:"Crepe Bandage 4 inch", cat:"Bandage" },
  { name:"Crepe Bandage 6 inch", cat:"Bandage" },
  { name:"Crepe Bandage 8 inch", cat:"Bandage" },
  { name:"Elastic Adhesive Bandage 4 inch", cat:"Bandage" },
  { name:"Cotton Bandage 4 inch", cat:"Bandage" },
  { name:"Plaster of Paris (POP) Bandage 4 inch", cat:"Bandage" },
  { name:"Plaster of Paris Bandage 6 inch", cat:"Bandage" },
  { name:"Zinc Oxide Adhesive Plaster 1 inch", cat:"Wound Care" },
  { name:"Wound Dressing Large (10x10)", cat:"Dressing" },
  { name:"Wound Dressing Medium (7.5x7.5)", cat:"Dressing" },
  { name:"Hydrocolloid Dressing", cat:"Wound Care" },
  { name:"Foam Dressing", cat:"Wound Care" },
  { name:"Silver Sulfadiazine 1% Cream (Burns)", cat:"Burns Dressing" },
  { name:"Bactigras (Chlorhexidine Tulle)", cat:"Dressing" },

  // ── ANTISEPTICS & DISINFECTANTS ────────────────────────────────
  { name:"Povidone Iodine 5% Solution (Betadine)", cat:"Antiseptic" },
  { name:"Povidone Iodine 10% Solution", cat:"Antiseptic" },
  { name:"Povidone Iodine Surgical Scrub", cat:"Antiseptic" },
  { name:"Chlorhexidine Gluconate 2% Solution", cat:"Antiseptic" },
  { name:"Chlorhexidine Gluconate 4% Surgical Scrub", cat:"Antiseptic" },
  { name:"Chlorhexidine 0.2% Mouthwash (Dental)", cat:"Dental Antiseptic" },
  { name:"Chlorhexidine 0.12% Mouthwash", cat:"Dental Antiseptic" },
  { name:"Hydrogen Peroxide 3% Solution", cat:"Antiseptic" },
  { name:"Hydrogen Peroxide 6% (Dental Irrigation)", cat:"Dental Antiseptic" },
  { name:"Isopropyl Alcohol 70% (Spirit Swabs)", cat:"Antiseptic" },
  { name:"Alcohol Swabs (Pre-injection)", cat:"Antiseptic" },
  { name:"Cetrimide + Chlorhexidine Solution", cat:"Antiseptic" },
  { name:"Sodium Hypochlorite 2.5% (NaOCl - Root Canal)", cat:"Endodontic" },
  { name:"Sodium Hypochlorite 5.25% (NaOCl)", cat:"Endodontic" },
  { name:"EDTA Solution 17% (Root Canal)", cat:"Endodontic" },
  { name:"EDTA Gel (RC Prep)", cat:"Endodontic" },
  { name:"Saline Irrigation Solution 500ml", cat:"IV Fluid" },
  { name:"Saline Nasal Drops", cat:"Consumable" },
  { name:"Savlon (Cetrimide + Chlorhexidine)", cat:"Antiseptic" },
  { name:"Dettol Liquid Antiseptic", cat:"Antiseptic" },

  // ── DENTAL MATERIALS (EXPANDED) ────────────────────────────────
  { name:"Zinc Oxide Eugenol (ZOE) Cement Base", cat:"Dental Material" },
  { name:"Zinc Oxide Eugenol Impression Paste", cat:"Dental Material" },
  { name:"Zinc Phosphate Cement", cat:"Dental Material" },
  { name:"Zinc Polycarboxylate Cement", cat:"Dental Material" },
  { name:"Glass Ionomer Cement Type I (Luting)", cat:"Dental Material" },
  { name:"Glass Ionomer Cement Type II (Restorative)", cat:"Dental Material" },
  { name:"Glass Ionomer Cement Type III (Lining)", cat:"Dental Material" },
  { name:"RMGIC (Resin Modified GIC)", cat:"Dental Material" },
  { name:"Composite Resin Shade A1", cat:"Dental Material" },
  { name:"Composite Resin Shade A2", cat:"Dental Material" },
  { name:"Composite Resin Shade A3", cat:"Dental Material" },
  { name:"Composite Resin Shade A3.5", cat:"Dental Material" },
  { name:"Composite Resin Shade B1", cat:"Dental Material" },
  { name:"Flowable Composite Shade A2", cat:"Dental Material" },
  { name:"Flowable Composite Shade A3", cat:"Dental Material" },
  { name:"Bonding Agent (5th Generation)", cat:"Dental Material" },
  { name:"Bonding Agent (7th Generation Self-Etch)", cat:"Dental Material" },
  { name:"Acid Etchant 37% Phosphoric Acid Gel", cat:"Dental Material" },
  { name:"Calcium Hydroxide Paste (Pulp Capping)", cat:"Dental Material" },
  { name:"Calcium Hydroxide Powder", cat:"Dental Material" },
  { name:"MTA (Mineral Trioxide Aggregate)", cat:"Dental Material" },
  { name:"Biodentine (Calcium Silicate)", cat:"Dental Material" },
  { name:"Cavity Liner (Dycal)", cat:"Dental Material" },
  { name:"Temporary Restoration Material (Cavit)", cat:"Dental Material" },
  { name:"IRM Temporary Cement", cat:"Dental Material" },
  { name:"Zinc Oxide Temp Fill", cat:"Dental Material" },
  { name:"Alginate Impression Material (Chromatic)", cat:"Dental Material" },
  { name:"Irreversible Hydrocolloid (Alginate) 500g", cat:"Dental Material" },
  { name:"Polyvinyl Siloxane (PVS) Impression Light Body", cat:"Dental Material" },
  { name:"PVS Impression Heavy Body", cat:"Dental Material" },
  { name:"Polyether Impression Material", cat:"Dental Material" },
  { name:"Zinc Oxide Impression Paste (ZO Paste)", cat:"Dental Material" },
  { name:"Plaster of Paris Dental Grade", cat:"Dental Material" },
  { name:"Type III Dental Stone", cat:"Dental Material" },
  { name:"Type IV Dental Stone (Die Stone)", cat:"Dental Material" },
  { name:"Dental Wax (Modelling Wax)", cat:"Dental Material" },
  { name:"Baseplate Wax", cat:"Dental Material" },
  { name:"Sticky Wax", cat:"Dental Material" },
  { name:"Bite Registration Paste", cat:"Dental Material" },
  { name:"Separating Liquid (Sodium Alginate)", cat:"Dental Material" },
  { name:"Denture Base Resin (Heat Cure)", cat:"Dental Material" },
  { name:"Denture Base Resin (Cold Cure)", cat:"Dental Material" },
  { name:"Denture Repair Resin", cat:"Dental Material" },
  { name:"Acrylic Teeth Set (Upper)", cat:"Dental Material" },
  { name:"Acrylic Teeth Set (Lower)", cat:"Dental Material" },
  { name:"Porcelain Teeth", cat:"Dental Material" },
  { name:"Chromium Cobalt Alloy (Partial Denture)", cat:"Dental Material" },
  { name:"Amalgam Alloy Capsules (Pre-dosed)", cat:"Dental Material" },
  { name:"Mercury (Dental Grade)", cat:"Dental Material" },
  { name:"Amalgam Capsule Activator", cat:"Dental Accessory" },
  { name:"Light Cure Composite Bleaching Gel 35%", cat:"Dental Material" },
  { name:"Carbamide Peroxide 10% (Home Bleaching)", cat:"Dental Material" },
  { name:"Carbamide Peroxide 16%", cat:"Dental Material" },
  { name:"Carbamide Peroxide 22%", cat:"Dental Material" },
  { name:"Hydrogen Peroxide 35% (In-office Bleaching)", cat:"Dental Material" },
  { name:"Desensitising Agent (Gluma)", cat:"Dental Material" },
  { name:"Fluoride Varnish 5% NaF (Duraphat)", cat:"Dental Fluoride" },
  { name:"Fluoride Gel APF 1.23%", cat:"Fluoride Gel" },
  { name:"Silver Diamine Fluoride 38%", cat:"Dental Fluoride" },
  { name:"Pit & Fissure Sealant (Light Cure)", cat:"Dental Material" },
  { name:"Pit & Fissure Sealant (Self-Cure)", cat:"Dental Material" },
  { name:"Crown & Bridge Temporary Cement", cat:"Dental Material" },
  { name:"Permanent Crown Cement (Ketac Cem)", cat:"Dental Material" },
  { name:"Resin Cement (Panavia F)", cat:"Dental Material" },
  { name:"Post & Core Material", cat:"Dental Material" },
  { name:"Fibre Post (Glass Fibre)", cat:"Dental Material" },
  { name:"Gutta Percha Points ISO Size 15", cat:"Endodontic" },
  { name:"Gutta Percha Points ISO Size 20", cat:"Endodontic" },
  { name:"Gutta Percha Points ISO Size 25", cat:"Endodontic" },
  { name:"Gutta Percha Points ISO Size 30", cat:"Endodontic" },
  { name:"Gutta Percha Points ISO Size 35", cat:"Endodontic" },
  { name:"Gutta Percha Points ISO Size 40", cat:"Endodontic" },
  { name:"Gutta Percha Points Standardised Large", cat:"Endodontic" },
  { name:"Gutta Percha Points Accessory Fine", cat:"Endodontic" },
  { name:"Root Canal Sealer (AH Plus)", cat:"Endodontic" },
  { name:"Root Canal Sealer (Apexit Plus)", cat:"Endodontic" },
  { name:"Root Canal Sealer (Zinc Oxide Eugenol)", cat:"Endodontic" },
  { name:"K-File ISO 15 (Root Canal File)", cat:"Endodontic Instrument" },
  { name:"K-File ISO 20", cat:"Endodontic Instrument" },
  { name:"K-File ISO 25", cat:"Endodontic Instrument" },
  { name:"K-File ISO 30", cat:"Endodontic Instrument" },
  { name:"K-File ISO 35", cat:"Endodontic Instrument" },
  { name:"K-File ISO 40", cat:"Endodontic Instrument" },
  { name:"K-File ISO 45", cat:"Endodontic Instrument" },
  { name:"K-File ISO 50", cat:"Endodontic Instrument" },
  { name:"K-File ISO 60", cat:"Endodontic Instrument" },
  { name:"K-File ISO 80", cat:"Endodontic Instrument" },
  { name:"H-File (Hedstroem) ISO 20", cat:"Endodontic Instrument" },
  { name:"H-File ISO 25", cat:"Endodontic Instrument" },
  { name:"H-File ISO 30", cat:"Endodontic Instrument" },
  { name:"Reamer ISO 15-40 Set", cat:"Endodontic Instrument" },
  { name:"ProTaper Next Rotary File Set", cat:"Endodontic Instrument" },
  { name:"WaveOne Gold Primary (Reciprocating)", cat:"Endodontic Instrument" },
  { name:"Reciproc Blue R25", cat:"Endodontic Instrument" },
  { name:"Lentulo Spiral Filler", cat:"Endodontic Instrument" },
  { name:"Plugger Spreader (Gutta Percha)", cat:"Endodontic Instrument" },
  { name:"Barbed Broach Assorted", cat:"Endodontic Instrument" },
  { name:"Paper Points ISO 20", cat:"Endodontic Accessory" },
  { name:"Paper Points ISO 25", cat:"Endodontic Accessory" },
  { name:"Paper Points ISO 30", cat:"Endodontic Accessory" },
  { name:"Paper Points ISO 40", cat:"Endodontic Accessory" },
  { name:"Paper Points Fine (Accessory)", cat:"Endodontic Accessory" },
  { name:"Apex Locator Tips", cat:"Endodontic Accessory" },
  { name:"Rubber Dam Sheet (Latex)", cat:"Dental Accessory" },
  { name:"Rubber Dam Frame (Ostby)", cat:"Dental Accessory" },
  { name:"Rubber Dam Clamp Kit", cat:"Dental Accessory" },
  { name:"Rubber Dam Punch", cat:"Dental Accessory" },
  { name:"Saliva Ejector Tips (Disposable)", cat:"Dental Accessory" },
  { name:"High Volume Evacuation Tip (HVE)", cat:"Dental Accessory" },
  { name:"Matrix Band (Tofflemire Universal)", cat:"Dental Accessory" },
  { name:"Sectional Matrix System (Palodent)", cat:"Dental Accessory" },
  { name:"Wooden Wedge Assorted", cat:"Dental Accessory" },
  { name:"Interproximal Plastic Wedge", cat:"Dental Accessory" },
  { name:"Celluloid Crown Form (Anterior)", cat:"Dental Accessory" },
  { name:"Stainless Steel Crown (Molar Paediatric)", cat:"Paediatric Dental" },
  { name:"Stainless Steel Crown Kit", cat:"Paediatric Dental" },
  { name:"Pulpotomy Agent (Formocresol)", cat:"Paediatric Dental" },
  { name:"Pulpotomy Agent (Ferric Sulphate 15.5%)", cat:"Paediatric Dental" },
  { name:"Zinc Oxide Eugenol Paediatric Filling", cat:"Paediatric Dental" },

  // ── ORTHO MATERIALS ────────────────────────────────────────────
  { name:"Orthodontic Bands (Molar) Upper", cat:"Dental Ortho" },
  { name:"Orthodontic Bands (Molar) Lower", cat:"Dental Ortho" },
  { name:"Orthodontic Brackets (Metal Roth)", cat:"Dental Ortho" },
  { name:"Orthodontic Brackets (Ceramic)", cat:"Dental Ortho" },
  { name:"Archwire NiTi Round 0.014", cat:"Dental Ortho" },
  { name:"Archwire NiTi Round 0.016", cat:"Dental Ortho" },
  { name:"Archwire NiTi Round 0.018", cat:"Dental Ortho" },
  { name:"Archwire SS Rectangular 0.019x0.025", cat:"Dental Ortho" },
  { name:"Archwire SS Rectangular 0.021x0.025", cat:"Dental Ortho" },
  { name:"Ligature Wire (Stainless Steel)", cat:"Dental Ortho" },
  { name:"Elastic Ligature Ties Assorted", cat:"Dental Ortho" },
  { name:"Power Chain Elastic", cat:"Dental Ortho" },
  { name:"Separating Elastics (Orthodontic)", cat:"Dental Ortho" },
  { name:"Molar Tube (Buccal Tube)", cat:"Dental Ortho" },
  { name:"Ortho Bracket Adhesive (Light Cure)", cat:"Dental Ortho" },
  { name:"Band Cement (Glass Ionomer Ortho)", cat:"Dental Ortho" },
  { name:"Debonding Pliers", cat:"Dental Ortho" },
  { name:"Ligature Tying Pliers", cat:"Dental Ortho" },
  { name:"How Pliers", cat:"Dental Ortho" },
  { name:"Cinching Pliers", cat:"Dental Ortho" },
  { name:"Wire Cutters (Distal End Cutter)", cat:"Dental Ortho" },
  { name:"Invisalign Chewies (Aligner Seater)", cat:"Dental Ortho" },
  { name:"Retainer (Hawley Plate)", cat:"Dental Ortho" },

  // ── PPE & INFECTION CONTROL ────────────────────────────────────
  { name:"Nitrile Gloves Small (Powder-Free)", cat:"PPE" },
  { name:"Nitrile Gloves Medium (Powder-Free)", cat:"PPE" },
  { name:"Nitrile Gloves Large (Powder-Free)", cat:"PPE" },
  { name:"Latex Surgical Gloves Size 6.5", cat:"PPE" },
  { name:"Latex Surgical Gloves Size 7", cat:"PPE" },
  { name:"Latex Surgical Gloves Size 7.5", cat:"PPE" },
  { name:"Latex Surgical Gloves Size 8", cat:"PPE" },
  { name:"Examination Gloves (Vinyl) Medium", cat:"PPE" },
  { name:"3-Ply Surgical Face Mask", cat:"PPE" },
  { name:"N95 Respirator (NIOSH Approved)", cat:"PPE" },
  { name:"Surgical Gown (Non-Woven Sterile)", cat:"PPE" },
  { name:"Disposable Apron (Polythene)", cat:"PPE" },
  { name:"Shoe Cover (Disposable)", cat:"PPE" },
  { name:"Head Cover / Surgical Cap", cat:"PPE" },
  { name:"Face Shield (Dental)", cat:"PPE" },
  { name:"Safety Goggles", cat:"PPE" },
  { name:"Bib (Dental Patient)", cat:"Dental Accessory" },
  { name:"Bib Clips", cat:"Dental Accessory" },
  { name:"Autoclave Pouches (Self-Seal)", cat:"PPE" },
  { name:"Sharps Container 5L", cat:"Waste Disposal" },
  { name:"Sharps Container 1L", cat:"Waste Disposal" },
  { name:"Biomedical Waste Bag Yellow", cat:"Waste Disposal" },
  { name:"Biomedical Waste Bag Red", cat:"Waste Disposal" },

  // ── COMMON OTC / PRESCRIPTION TABLETS ─────────────────────────
  { name:"Paracetamol 325mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 500mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 650mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 1000mg Tablet", cat:"Painkiller" },
  { name:"Paracetamol 120mg/5ml Syrup", cat:"Painkiller" },
  { name:"Paracetamol 250mg/5ml Syrup", cat:"Painkiller" },
  { name:"Ibuprofen 200mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 400mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 600mg Tablet", cat:"NSAID" },
  { name:"Ibuprofen 100mg/5ml Syrup", cat:"NSAID" },
  { name:"Diclofenac 50mg Tablet", cat:"NSAID" },
  { name:"Diclofenac 100mg SR Tablet", cat:"NSAID" },
  { name:"Diclofenac + Paracetamol Tablet", cat:"NSAID Combo" },
  { name:"Aceclofenac 100mg Tablet", cat:"NSAID" },
  { name:"Aceclofenac + Paracetamol Tablet", cat:"NSAID Combo" },
  { name:"Aceclofenac + Paracetamol + Serratiopeptidase", cat:"NSAID Combo" },
  { name:"Nimesulide 100mg Tablet", cat:"NSAID" },
  { name:"Nimesulide + Paracetamol Tablet", cat:"NSAID Combo" },
  { name:"Naproxen 250mg Tablet", cat:"NSAID" },
  { name:"Naproxen 500mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 60mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 90mg Tablet", cat:"NSAID" },
  { name:"Etoricoxib 120mg Tablet", cat:"NSAID" },
  { name:"Celecoxib 100mg Capsule", cat:"NSAID" },
  { name:"Celecoxib 200mg Capsule", cat:"NSAID" },
  { name:"Mefenamic Acid 250mg Capsule", cat:"NSAID" },
  { name:"Mefenamic Acid 500mg Tablet", cat:"NSAID" },
  { name:"Trypsin + Chymotrypsin Tablet (Antiflam)", cat:"Enzyme Combination" },
  { name:"Serratiopeptidase 10mg Tablet", cat:"Enzyme Combination" },
  { name:"Serratiopeptidase 20mg Tablet", cat:"Enzyme Combination" },
  { name:"Deflazacort 6mg Tablet", cat:"Steroid" },
  { name:"Deflazacort 12mg Tablet", cat:"Steroid" },
  { name:"Deflazacort 30mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 5mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 10mg Tablet", cat:"Steroid" },
  { name:"Prednisolone 20mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 4mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 8mg Tablet", cat:"Steroid" },
  { name:"Methylprednisolone 16mg Tablet", cat:"Steroid" },
  { name:"Betamethasone 0.5mg Tablet", cat:"Steroid" },
  { name:"Tramadol 50mg Capsule", cat:"Opioid Analgesic" },
  { name:"Tramadol + Paracetamol Tablet", cat:"Analgesic Combo" },
  { name:"Pantoprazole 20mg Tablet", cat:"Antacid / PPI" },
  { name:"Pantoprazole 40mg Tablet", cat:"Antacid / PPI" },
  { name:"Omeprazole 10mg Capsule", cat:"Antacid / PPI" },
  { name:"Omeprazole 20mg Capsule", cat:"Antacid / PPI" },
  { name:"Omeprazole 40mg Capsule", cat:"Antacid / PPI" },
  { name:"Rabeprazole 10mg Tablet", cat:"Antacid / PPI" },
  { name:"Rabeprazole 20mg Tablet", cat:"Antacid / PPI" },
  { name:"Esomeprazole 20mg Tablet", cat:"Antacid / PPI" },
  { name:"Esomeprazole 40mg Tablet", cat:"Antacid / PPI" },
  { name:"Ranitidine 150mg Tablet", cat:"Antacid / H2 Blocker" },
  { name:"Ranitidine 300mg Tablet", cat:"Antacid / H2 Blocker" },
  { name:"Ondansetron 4mg Tablet", cat:"Antiemetic" },
  { name:"Ondansetron 8mg Tablet", cat:"Antiemetic" },
  { name:"Ondansetron 4mg/5ml Syrup", cat:"Antiemetic" },
  { name:"Domperidone 10mg Tablet", cat:"Antiemetic" },
  { name:"Domperidone 1mg/ml Suspension", cat:"Antiemetic" },
  { name:"Metoclopramide 10mg Tablet", cat:"Antiemetic" },
  { name:"Promethazine 10mg Tablet", cat:"Antiemetic / Antihistamine" },
  { name:"Cetirizine 5mg Tablet", cat:"Antihistamine" },
  { name:"Cetirizine 10mg Tablet", cat:"Antihistamine" },
  { name:"Cetirizine 5mg/5ml Syrup", cat:"Antihistamine" },
  { name:"Loratadine 10mg Tablet", cat:"Antihistamine" },
  { name:"Fexofenadine 120mg Tablet", cat:"Antihistamine" },
  { name:"Fexofenadine 180mg Tablet", cat:"Antihistamine" },
  { name:"Levocetirizine 2.5mg Tablet", cat:"Antihistamine" },
  { name:"Levocetirizine 5mg Tablet", cat:"Antihistamine" },
  { name:"Chlorpheniramine 4mg Tablet", cat:"Antihistamine" },
  { name:"Vitamin C 500mg Tablet", cat:"Vitamin" },
  { name:"Vitamin C 1000mg Tablet", cat:"Vitamin" },
  { name:"Vitamin B Complex Tablet", cat:"Vitamin" },
  { name:"Vitamin B Complex + Zinc Capsule", cat:"Vitamin" },
  { name:"Vitamin D3 60000 IU Capsule", cat:"Vitamin" },
  { name:"Vitamin D3 1000 IU Tablet", cat:"Vitamin" },
  { name:"Vitamin E 400mg Capsule", cat:"Vitamin" },
  { name:"Calcium + Vitamin D3 Tablet", cat:"Calcium Supplement" },
  { name:"Calcium Carbonate 500mg Tablet", cat:"Calcium Supplement" },
  { name:"Zinc Sulphate 20mg Tablet", cat:"Mineral Supplement" },
  { name:"Ferrous Sulphate 200mg Tablet", cat:"Iron Supplement" },
  { name:"Ferrous Ascorbate + Folic Acid Tablet", cat:"Iron Supplement" },

  // ── TOPICAL MEDICATIONS ────────────────────────────────────────
  { name:"Triamcinolone Acetonide 0.1% Oral Paste (Kenacort)", cat:"Steroid Topical" },
  { name:"Triamcinolone Acetonide 0.025% Cream", cat:"Steroid Topical" },
  { name:"Betamethasone 0.05% Cream", cat:"Steroid Topical" },
  { name:"Clotrimazole 1% Cream", cat:"Antifungal Topical" },
  { name:"Miconazole 2% Oral Gel", cat:"Antifungal Topical" },
  { name:"Nystatin Oral Suspension", cat:"Antifungal" },
  { name:"Nystatin 100000 IU Tablet", cat:"Antifungal" },
  { name:"Fluconazole 50mg Tablet", cat:"Antifungal" },
  { name:"Fluconazole 150mg Tablet", cat:"Antifungal" },
  { name:"Fluconazole 200mg Tablet", cat:"Antifungal" },
  { name:"Mupirocin 2% Ointment (Bactroban)", cat:"Topical Antibiotic" },
  { name:"Neomycin + Bacitracin Ointment", cat:"Topical Antibiotic" },
  { name:"Tetracycline 3% Ointment", cat:"Topical Antibiotic" },
  { name:"Fusidic Acid 2% Cream", cat:"Topical Antibiotic" },
  { name:"Lignocaine Viscous 2% Mouthwash", cat:"Local Anaesthetic Topical" },
  { name:"Magic Mouthwash (Lignocaine + Diphenhydramine + Antacid)", cat:"Local Anaesthetic Topical" },
  { name:"Amlexanox 5% Paste (Aphthous Ulcer)", cat:"Oral Care" },
  { name:"Benzydamine 0.15% Mouthwash (Tantum Verde)", cat:"Oral Care" },
  { name:"Glycerine + Thymol Mouthwash", cat:"Oral Care" },
  { name:"Hexidine Mouthwash (Hexetidine 0.1%)", cat:"Dental Antiseptic" },
  { name:"Listerine Mouthwash (OTC)", cat:"Oral Care" },
  { name:"Colgate Peroxyl Mouthwash", cat:"Oral Care" },
  { name:"Orajel (Benzocaine 10%) Topical", cat:"Local Anaesthetic Topical" },
  { name:"Ulcerex Gel (Choline Salicylate)", cat:"Oral Care" },
  { name:"Dologel CT (Clove Oil Gel)", cat:"Oral Care" },
  { name:"Clove Oil (Eugenol)", cat:"Dental Material" },

  // ── DENTAL IMPLANT MATERIALS ───────────────────────────────────
  { name:"Titanium Implant Fixture (3.3mm)", cat:"Dental Implant" },
  { name:"Titanium Implant Fixture (3.5mm)", cat:"Dental Implant" },
  { name:"Titanium Implant Fixture (4.0mm)", cat:"Dental Implant" },
  { name:"Titanium Implant Fixture (4.5mm)", cat:"Dental Implant" },
  { name:"Implant Cover Screw", cat:"Dental Implant" },
  { name:"Implant Healing Abutment", cat:"Dental Implant" },
  { name:"Implant Final Abutment", cat:"Dental Implant" },
  { name:"Implant Impression Coping", cat:"Dental Implant" },
  { name:"Bone Graft (Autograft)", cat:"Dental Surgical" },
  { name:"Bone Graft (Xenograft - Bio-Oss)", cat:"Dental Surgical" },
  { name:"Collagen Membrane (Bio-Gide)", cat:"Dental Surgical" },
  { name:"PRF (Platelet Rich Fibrin) Kit", cat:"Dental Surgical" },
  { name:"Haemostatic Agent (Surgicel - Oxidised Cellulose)", cat:"Haemostatic Surgical" },
  { name:"Haemostatic Foam (Gelfoam)", cat:"Haemostatic" },
  { name:"Bone Wax", cat:"Haemostatic Surgical" },
  { name:"Surgical Suction Tip (Frazier)", cat:"Dental Instrument" },

  // ── LAB INVESTIGATIONS ─────────────────────────────────────────
  { name:"CBC (Complete Blood Count)", cat:"Lab Test" },
  { name:"RBS (Random Blood Sugar)", cat:"Lab Test" },
  { name:"FBS (Fasting Blood Sugar)", cat:"Lab Test" },
  { name:"HbA1c (Glycated Haemoglobin)", cat:"Lab Test" },
  { name:"Blood Group & Rh Typing", cat:"Lab Test" },
  { name:"BT (Bleeding Time) & CT (Clotting Time)", cat:"Lab Test" },
  { name:"PT/INR (Prothrombin Time)", cat:"Lab Test" },
  { name:"APTT (Activated Partial Thromboplastin Time)", cat:"Lab Test" },
  { name:"LFT (Liver Function Test)", cat:"Lab Test" },
  { name:"KFT (Kidney Function Test)", cat:"Lab Test" },
  { name:"Serum Creatinine", cat:"Lab Test" },
  { name:"Urine Routine Examination", cat:"Lab Test" },
  { name:"HBsAg (Hepatitis B Surface Antigen)", cat:"Lab Test" },
  { name:"Anti-HIV (ELISA)", cat:"Lab Test" },
  { name:"VDRL (Syphilis Test)", cat:"Lab Test" },
  { name:"Dental Radiograph (IOPA X-ray)", cat:"Dental Investigation" },
  { name:"Orthopantomogram (OPG) X-ray", cat:"Dental Investigation" },
  { name:"Lateral Cephalogram X-ray", cat:"Dental Investigation" },
  { name:"Occlusal X-ray (Maxillary/Mandibular)", cat:"Dental Investigation" },
  { name:"Bitewing Radiograph", cat:"Dental Investigation" },
  { name:"CBCT Scan (Dental 3D)", cat:"Dental Investigation" },

  // ── COMMON BRAND NAMES (INDIA) ─────────────────────────────────
  { name:"Augmentin 625mg Tablet (Amoxicillin+Clavulanate)", cat:"Antibiotic" },
  { name:"Azithral 500mg Tablet (Azithromycin)", cat:"Antibiotic" },
  { name:"Cifran 500mg Tablet (Ciprofloxacin)", cat:"Antibiotic" },
  { name:"Flagyl 400mg Tablet (Metronidazole)", cat:"Antibiotic" },
  { name:"Doxy 100mg Capsule (Doxycycline)", cat:"Antibiotic" },
  { name:"Calpol 650mg Tablet (Paracetamol)", cat:"Painkiller" },
  { name:"Dolo 650 Tablet (Paracetamol)", cat:"Painkiller" },
  { name:"Combiflam Tablet (Ibuprofen+Paracetamol)", cat:"NSAID Combo" },
  { name:"Voveran 50mg Tablet (Diclofenac)", cat:"NSAID" },
  { name:"Brufen 400mg Tablet (Ibuprofen)", cat:"NSAID" },
  { name:"Ultracet Tablet (Tramadol+Paracetamol)", cat:"Analgesic Combo" },
  { name:"Pan 40mg Tablet (Pantoprazole)", cat:"Antacid / PPI" },
  { name:"Omez 20mg Capsule (Omeprazole)", cat:"Antacid / PPI" },
  { name:"Ondem 4mg Tablet (Ondansetron)", cat:"Antiemetic" },
  { name:"Stemetil 5mg Tablet (Prochlorperazine)", cat:"Antiemetic" },
  { name:"Sinarest Tablet (Paracetamol+Phenylephrine)", cat:"Antihistamine" },
  { name:"Allegra 120mg Tablet (Fexofenadine)", cat:"Antihistamine" },
  { name:"Montair-LC Tablet (Montelukast+Levocetirizine)", cat:"Antihistamine" },
  { name:"Calpol Syrup (Paracetamol 120mg)", cat:"Painkiller" },
  { name:"Pyrimon Syrup (Mefenamic+Paracetamol Paediatric)", cat:"Painkiller" },
  { name:"Perinorm 10mg Tablet (Metoclopramide)", cat:"Antiemetic" },
  { name:"Rantac 150mg Tablet (Ranitidine)", cat:"Antacid / H2 Blocker" },
  { name:"Kenacort Oral Paste (Triamcinolone)", cat:"Steroid Topical" },
  { name:"Kenalog Injection 40mg (Triamcinolone)", cat:"Steroid Inj" },
  { name:"Depo-Medrol 40mg Injection", cat:"Steroid Inj" },
  { name:"Betnesol 0.5mg Tablet (Betamethasone)", cat:"Steroid" },
  { name:"Wysolone 5mg Tablet (Prednisolone)", cat:"Steroid" },
  { name:"Defcort 6mg Tablet (Deflazacort)", cat:"Steroid" },
  { name:"Dexona 0.5mg Tablet (Dexamethasone)", cat:"Steroid" },
  { name:"Mox 500mg Capsule (Amoxicillin)", cat:"Antibiotic" },
  { name:"Sporanox 100mg Capsule (Itraconazole)", cat:"Antifungal" },
  { name:"Zovirax 400mg Tablet (Acyclovir)", cat:"Antiviral" },
  { name:"Valcivir 500mg Tablet (Valacyclovir)", cat:"Antiviral" },
  { name:"Neosporin Powder (Neomycin+Bacitracin)", cat:"Topical Antibiotic" },
  { name:"Betadine Ointment 5%", cat:"Antiseptic Topical" },
  { name:"Borax Glycerine (Oral Ulcer)", cat:"Oral Care" },
  { name:"Tantum Verde Mouthwash (Benzydamine)", cat:"Oral Care" },
  { name:"Hexidine Mouthwash", cat:"Dental Antiseptic" },
  { name:"Recaldent (CPP-ACP Paste)", cat:"Dental Fluoride" },
  { name:"Tooth Mousse Plus (GC)", cat:"Dental Fluoride" },
  { name:"Sensodyne Toothpaste", cat:"Dental Brand" },
  { name:"Sensodyne Repair & Protect", cat:"Dental Brand" },
  { name:"Colgate Sensitive Pro-Relief", cat:"Dental Brand" },
  { name:"Pepsodent Germicheck", cat:"Dental Brand" },
  { name:"Oral-B Toothbrush Indicator", cat:"Dental Brand" },
  { name:"GUM Soft-Picks Interdental", cat:"Dental Brand" },
  { name:"Floss (Oral-B Satin)", cat:"Dental Brand" },
  { name:"Water Flosser", cat:"Dental Brand" },
  { name:"Tongue Cleaner (Metal)", cat:"Dental Brand" },
  { name:"Mouth Guard (Bruxism)", cat:"Dental Brand" },
];

// ── Save a custom medicine to backend API (shared across all devices/doctors)
// Uses fetch directly so no import() needed — fire and forget
function saveCustomMed(name) {
  if (!name || name.trim().length < 2) return;
  // Check not already in built-in DB (case-insensitive)
  const nameLow = name.trim().toLowerCase();
  const already = MEDICINE_DB.some(m => m.name.toLowerCase() === nameLow);
  if (already) return;
  // Get base URL and token same way api.js does
  const BASE_URL = process.env.REACT_APP_API_URL || "https://pearlsmile-backend.onrender.com/api";
  const token = localStorage.getItem("pearlsmile_token");
  fetch(BASE_URL + "/custommeds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify({ name: name.trim(), cat: "Custom" }),
  }).catch(() => {});
}

// ── Google-style multi-word search — uses combined DB + custom meds from state
// customMeds is passed in from component state (fetched from backend)
function googleSearch(query, customMeds = []) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
  if (!words.length) return [];

  // Filter out any malformed entries (no name field)
  const safeMeds = Array.isArray(customMeds)
    ? customMeds.filter(m => m && typeof m.name === "string" && m.name.trim().length > 0)
    : [];

  const combined = [
    ...MEDICINE_DB,
    ...safeMeds.map(m => ({ ...m, _custom: true })),
  ];

  const scored = combined.map(m => {
    // Guard against undefined name (safety check)
    if (!m || typeof m.name !== "string") return { m, score: 0 };
    const nameLow = m.name.toLowerCase();
    const catLow  = (m.cat || "").toLowerCase();
    let score = 0;
    for (const w of words) {
      if (nameLow.startsWith(w)) score += 5;
      else if (nameLow.includes(w)) score += 3;
      else if (catLow.includes(w)) score += 1;
    }
    // Boost custom medicines so doctor's own entries appear first
    if (m._custom) score += 2;
    return { m, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).map(x => x.m);

  return scored.slice(0, 12);
}

function highlightWords(text, query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
  let result = text;
  words.forEach(w => {
    const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","gi");
    result = result.replace(re,"<b>$1</b>");
  });
  return result;
}

// ── MedAutocomplete — Google-style medicine search ───────────
function MedAutocomplete({ value, onChange, customMeds = [], onCustomSaved }) {
  const taRef      = React.useRef(null);
  const wrapperRef = React.useRef(null);
  const [suggestions, setSuggestions] = React.useState([]);
  const [activeIdx,   setActiveIdx]   = React.useState(-1);
  const [currentQuery, setCurrentQuery] = React.useState("");
  const queryStartRef = React.useRef(0);
  const queryEndRef   = React.useRef(0);

  const hideSuggestions = () => { setSuggestions([]); setActiveIdx(-1); setCurrentQuery(""); };

  // Single onChange handler — no onInput conflict
  const handleChange = (e) => {
    const ta     = e.target;
    const val    = ta.value;
    const cursor = ta.selectionStart;
    onChange(val);

    // Find start of current line/word being typed
    let lineStart = cursor - 1;
    while (lineStart >= 0 && val[lineStart] !== "\n") lineStart--;
    lineStart++;

    const query = val.substring(lineStart, cursor);
    queryStartRef.current = lineStart;
    queryEndRef.current   = cursor;

    if (query.trim().length < 2) { hideSuggestions(); return; }
    const matches = googleSearch(query, customMeds);
    if (!matches.length) { hideSuggestions(); return; }
    setCurrentQuery(query);
    setSuggestions(matches);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if ((e.key === "Enter" || e.key === "Tab") && activeIdx >= 0 && suggestions[activeIdx]) {
      e.preventDefault();
      selectMed(suggestions[activeIdx].name);
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  };

  const selectMed = (name) => {
    const ta     = taRef.current;
    const val    = ta.value;
    const before = val.substring(0, queryStartRef.current);
    const after  = val.substring(queryEndRef.current);
    const newVal = before + name + after;
    onChange(newVal);
    hideSuggestions();
    // Save to custom medicines if not already in DB
    saveCustomMed(name);
    if (onCustomSaved) onCustomSaved(name);
    // Restore cursor position after React re-render
    setTimeout(() => {
      if (taRef.current) {
        const nc = queryStartRef.current + name.length;
        taRef.current.setSelectionRange(nc, nc);
        taRef.current.focus();
        queryEndRef.current = nc;
      }
    }, 0);
  };

  // Save each word/phrase on blur that looks like a medicine name
  const handleBlur = () => {
    if (!taRef.current) return;
    const val = taRef.current.value;
    // Save any line that looks like a medicine (>3 chars, not pure numbers)
    val.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 3 && !/^[0-9]+$/.test(trimmed)) {
        saveCustomMed(trimmed);
        if (onCustomSaved) onCustomSaved(trimmed);
      }
    });
  };

  // Click-outside handler using wrapperRef (not fixed id)
  React.useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        hideSuggestions();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        .med-suggestion-item{padding:8px 14px;cursor:pointer;font-size:13.5px;color:#1a1614;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f0eeeb;transition:background 0.12s;}
        .med-suggestion-item:last-child{border-bottom:none;}
        .med-suggestion-item:hover,.med-suggestion-item.med-active{background:#e8f7f7;}
        .med-sug-icon{font-size:14px;opacity:0.65;flex-shrink:0;}
        .med-sug-name{font-weight:500;flex:1;color:#1a1614;}
        .med-sug-name b{color:#0d7377;font-weight:700;}
        .med-sug-cat{font-size:11px;color:#9a9590;flex-shrink:0;background:#f0eeeb;padding:2px 7px;border-radius:20px;}
      `}</style>
      <div style={{ position:"relative" }} ref={wrapperRef}>
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoComplete="off"
          placeholder="Enter observations, treatment given, prescription, follow-up advice... (type name of medicine to get suggestions)"
        />
        {suggestions.length > 0 && (
          <div style={{
            position:"absolute", left:0, right:0, background:"#fff",
            border:"1.5px solid #0d7377", borderTop:"none",
            borderRadius:"0 0 12px 12px",
            boxShadow:"0 8px 32px rgba(13,115,119,0.18)",
            zIndex:99999, maxHeight:280, overflowY:"auto",
            fontFamily:"'DM Sans',sans-serif"
          }}>
            {suggestions.map((m, i) => (
              <div
                key={m.name + i}
                className={"med-suggestion-item" + (i === activeIdx ? " med-active" : "")}
                onMouseDown={(e) => { e.preventDefault(); selectMed(m.name); }}
              >
                <span className="med-sug-icon">💊</span>
                <span className="med-sug-name" dangerouslySetInnerHTML={{ __html: highlightWords(m.name, currentQuery) }} />
                <span className="med-sug-cat">{m.cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Prescription Modal — exact original PDF design ────────────
function PrescriptionModal({ visit, patient, doctor, onClose, showNotify }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [rxMobile, setRxMobile] = useState("");
  const [fileName, setFileName] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    generatePDF();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const fmtDateLocal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  };

  const fmtTimeLocal = (t) => {
    if (!t) return "";
    const parts = t.split(":");
    const hh = parseInt(parts[0]), mm = parts[1];
    return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
  };

  const generatePDF = () => {
    if (window.jspdf) { buildPDF(); return; }
    const existing = document.getElementById("jspdf-cdn");
    if (existing) { existing.addEventListener("load", buildPDF); return; }
    const script = document.createElement("script");
    script.id = "jspdf-cdn";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.crossOrigin = "anonymous";
    script.onload = buildPDF;
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
  };

  const buildPDF = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait" });
    const W = 210, H = 297;

    const sf = (c) => pdf.setFillColor(c[0],c[1],c[2]);
    const sd = (c) => pdf.setDrawColor(c[0],c[1],c[2]);
    const st = (c) => pdf.setTextColor(c[0],c[1],c[2]);

    const NAVY=[8,25,65], BLUE=[20,80,160], BLUE2=[40,110,190];
    const LBLUE=[210,228,248], LBLUE2=[232,242,252], MIDBLUE=[160,195,235];
    const TEAL=[0,130,130], TEAL2=[210,240,240];
    const WHITE=[255,255,255], LGRAY=[245,247,251], LGRAY2=[250,251,254], LGRAY3=[240,243,248];
    const GRAY=[115,118,130], GRAY2=[75,80,95];
    const GOLD=[170,130,40], GOLD2=[250,245,225];

    const today = new Date();
    const todayFmt = today.getDate() + " " + MONTHS[today.getMonth()] + " " + today.getFullYear();
    const rxNum = "PS-" + today.getFullYear() + ("0"+(today.getMonth()+1)).slice(-2) + ("0"+today.getDate()).slice(-2) + "-" + Math.floor(1000+Math.random()*8999);

    const visitDate = visit.visitDate || "";
    const visitTime = visit.visitTime || "";
    const notes = visit.notes || "";
    const nextDate = visit.nextVisitDate || "";
    const service = visit.service || "";
    const doc = { name: doctor?.name || "Doctor", qual:"", reg:"" };

    const visitDateFmt = fmtDateLocal(visitDate);
    const visitTimeFmt = fmtTimeLocal(visitTime);
    const nextDateFmt = fmtDateLocal(nextDate);

    // ── Outer border ─────────────────────────────────────────────
    sd(MIDBLUE); pdf.setLineWidth(0.8); pdf.rect(3.5,3.5,W-7,H-7,"S");
    sd(LBLUE); pdf.setLineWidth(0.3); pdf.rect(5.5,5.5,W-11,H-11,"S");

    // ── Header ───────────────────────────────────────────────────
    sf(NAVY); pdf.rect(3.5,3.5,W-7,46,"F");
    sf(BLUE); pdf.rect(3.5,43,W-7,10,"F");
    sf(LBLUE); pdf.rect(3.5,53,W-7,6,"F");

    st(WHITE); pdf.setFontSize(18); pdf.setFont("helvetica","bold");
    pdf.text(doc.name, 14, 19);
    st(LBLUE); pdf.setFontSize(8); pdf.setFont("helvetica","normal");
    pdf.text((doc.qual||"").toUpperCase(), 14, 26);
    sd(MIDBLUE); pdf.setLineWidth(0.25); pdf.line(14,28.5,W-40,28.5);
    st(LGRAY); pdf.setFontSize(7);
    pdf.text("Reg. No.:  " + (doc.reg||"—"), 14, 33.5);
    pdf.text("Specialisation:  Dental & Oral Health Care", 14, 38.5);

    st(WHITE); pdf.setFontSize(15); pdf.setFont("helvetica","bold");
    pdf.text("PEARLSMILE", W-10, 19, { align:"right" });
    st(LBLUE); pdf.setFontSize(7.5); pdf.setFont("helvetica","normal");
    pdf.text("DENTAL HOSPITAL", W-10, 25.5, { align:"right" });
    sd(MIDBLUE); pdf.setLineWidth(0.25); pdf.line(W-72,28.5,W-10,28.5);
    st(LGRAY); pdf.setFontSize(6.8);
    pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W-10, 33.5, { align:"right" });
    pdf.text("+91 87936 08083  |  care@pearlsmiledental.in", W-10, 38.5, { align:"right" });

    st(WHITE); pdf.setFontSize(9); pdf.setFont("helvetica","bold");
    pdf.text("DIGITAL PRESCRIPTION", W/2, 50, { align:"center" });
    st(LBLUE2); pdf.setFontSize(7); pdf.setFont("helvetica","normal");
    pdf.text("Rx No.: " + rxNum, 10, 50);
    pdf.text("Date: " + todayFmt, W-10, 50, { align:"right" });

    st(BLUE); pdf.setFontSize(7.5); pdf.setFont("helvetica","bold");
    pdf.text("PATIENT INFORMATION", W/2, 57, { align:"center" });

    // ── Patient info table ────────────────────────────────────────
    const infoTop = 61;
    sf(LGRAY3); pdf.rect(10,infoTop,W-20,44,"F");
    sd(LBLUE); pdf.setLineWidth(0.25); pdf.rect(10,infoTop,W-20,44,"S");
    sd(MIDBLUE); pdf.setLineWidth(0.2); pdf.line(W/2,infoTop,W/2,infoTop+44);
    let rdy = infoTop+11;
    for (let ri=0;ri<3;ri++){pdf.line(10,rdy,W-10,rdy);rdy+=11;}

    const drawCell = (label,value,x,y,maxW) => {
      st(GRAY2); pdf.setFont("helvetica","bold"); pdf.setFontSize(6.8);
      pdf.text(label, x+3, y+4);
      st(NAVY); pdf.setFont("helvetica","normal"); pdf.setFontSize(8.5);
      const val = pdf.splitTextToSize(String(value||"—"), maxW||75);
      pdf.text(val[0], x+3, y+9.5);
    };
    const cHalf = W/2;
    drawCell("PATIENT NAME", patient.name||"—", 10, infoTop, cHalf-16);
    drawCell("MOBILE", patient.mobile||"—", cHalf, infoTop, cHalf-16);
    drawCell("EMAIL", patient.email||"—", 10, infoTop+11, cHalf-16);
    drawCell("BLOOD GROUP", patient.blood||"—", cHalf, infoTop+11, cHalf-16);
    drawCell("AGE / GENDER", (patient.age||"—")+(patient.gender?"  |  "+patient.gender:""), 10, infoTop+22, cHalf-16);
    drawCell("VISIT DATE", visitDateFmt+(visitTimeFmt?" ("+visitTimeFmt+")":""), cHalf, infoTop+22, cHalf-16);
    drawCell("SERVICE/TREATMENT", service||"—", 10, infoTop+33, cHalf-16);
    drawCell("NEXT VISIT DATE", nextDateFmt||"—", cHalf, infoTop+33, cHalf-16);

    // ── Clinical Notes ────────────────────────────────────────────
    const diagTop = infoTop+50;
    sf(BLUE); pdf.rect(10,diagTop,W-20,8,"F");
    st(WHITE); pdf.setFont("helvetica","bold"); pdf.setFontSize(8.5);
    pdf.text("Rx   CLINICAL NOTES / DIAGNOSIS & PRESCRIPTION", 14, diagTop+5.5);
    st(GOLD); pdf.setFontSize(10); pdf.text("Rx", W-16, diagTop+5.5, { align:"right" });

    const notesBoxH = 56;
    sf(LGRAY2); pdf.rect(10,diagTop+8,W-20,notesBoxH,"F");
    sd(LBLUE); pdf.setLineWidth(0.25); pdf.rect(10,diagTop+8,W-20,notesBoxH,"S");
    sd([215,225,240]); pdf.setLineWidth(0.15);
    for (let rl=0;rl<7;rl++) pdf.line(14,diagTop+16+rl*7,W-14,diagTop+16+rl*7);
    st(NAVY); pdf.setFont("helvetica","normal"); pdf.setFontSize(9.5);
    const noteLines = pdf.splitTextToSize(notes||"No diagnosis or notes recorded for this visit.", W-30);
    pdf.text(noteLines, 14, diagTop+15);

    // ── Next appointment box ──────────────────────────────────────
    let afterY = diagTop+notesBoxH+10;
    if (nextDateFmt) {
      sf(TEAL2); pdf.roundedRect(10,afterY,W-20,13,2,2,"F");
      sd(TEAL); pdf.setLineWidth(0.4); pdf.roundedRect(10,afterY,W-20,13,2,2,"S");
      sf(TEAL); pdf.roundedRect(10,afterY,10,13,2,2,"F");
      st(WHITE); pdf.setFont("helvetica","bold"); pdf.setFontSize(6.5);
      pdf.text("NEXT",11.2,afterY+5.5); pdf.text("VISIT",11.0,afterY+10);
      st(TEAL); pdf.setFont("helvetica","bold"); pdf.setFontSize(9);
      pdf.text("Next Appointment:", 24, afterY+6.5);
      st(NAVY); pdf.setFontSize(10); pdf.setFont("helvetica","bold");
      pdf.text(nextDateFmt, 72, afterY+6.5);
      st(GRAY); pdf.setFontSize(7); pdf.setFont("helvetica","italic");
      pdf.text("Please arrive 10 minutes early and bring this prescription.", 24, afterY+11);
      afterY += 19;
    }

    // ── General advice box ────────────────────────────────────────
    const advY = afterY+4;
    sf(GOLD2); pdf.roundedRect(10,advY,W-20,20,2,2,"F");
    sd(GOLD); pdf.setLineWidth(0.35); pdf.roundedRect(10,advY,W-20,20,2,2,"S");
    sf(GOLD); pdf.roundedRect(10,advY,10,20,2,2,"F");
    st(WHITE); pdf.setFont("helvetica","bold"); pdf.setFontSize(6.2);
    pdf.text("GEN.",11.2,advY+8); pdf.text("ADV.",11.2,advY+13.5);
    st(GOLD); pdf.setFontSize(7.5); pdf.setFont("helvetica","bold");
    pdf.text("General Advice:", 24, advY+6.5);
    st(GRAY2); pdf.setFont("helvetica","normal"); pdf.setFontSize(7);
    pdf.text("1.  Follow all prescribed medicines on time and complete the full course.", 24, advY+11.5);
    pdf.text("2.  Maintain good oral hygiene. Brush gently twice daily.", 24, advY+15.5);
    pdf.text("3.  Avoid very hot, cold, or hard foods until fully healed.", 24, advY+19.2);

    // ── Watermark ─────────────────────────────────────────────────
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity:0.035 }));
    st(NAVY); pdf.setFont("helvetica","bold"); pdf.setFontSize(44);
    pdf.text("PEARLSMILE", W/2, H/2-5, { align:"center", angle:35 });
    pdf.restoreGraphicsState();

    // ── Doctor seal ───────────────────────────────────────────────
    const sigY = Math.max(advY+28, H-55);
    const INK=[28,52,140], INK2=[45,75,170];
    const cx=W-46, cy=sigY+13, R=18;

    sd(INK); pdf.setLineWidth(1.2); pdf.circle(cx,cy,R,"S");
    pdf.setLineWidth(0.4); pdf.circle(cx,cy,R-2.5,"S");

    const drawStar=(sx,sy,sr)=>{
      const pts=[];
      for(let si=0;si<5;si++){
        const ao=(si*4*Math.PI)/5-Math.PI/2, ai=ao+(2*Math.PI)/5;
        pts.push({x:sx+sr*Math.cos(ao),y:sy+sr*Math.sin(ao)});
        pts.push({x:sx+sr*0.4*Math.cos(ai),y:sy+sr*0.4*Math.sin(ai)});
      }
      pdf.setLineWidth(0.3); sd(INK); sf(INK);
      pdf.lines(pts.slice(1).map((pt,i)=>[pt.x-pts[i].x,pt.y-pts[i].y]),pts[0].x,pts[0].y,[1,1],"FD",true);
    };
    drawStar(cx-R+3.5,cy+1,2.2); drawStar(cx+R-3.5,cy+1,2.2);

    const docShort=(doc.name||"Doctor").toUpperCase();
    sd(INK); st(INK); pdf.setFont("helvetica","bold"); pdf.setFontSize(5.8);
    const topSpan=Math.min(docShort.length*0.19,1.3);
    const topStart=-Math.PI/2-topSpan/2;
    for(let ti=0;ti<docShort.length;ti++){
      const ta=topStart+(ti/Math.max(docShort.length-1,1))*topSpan;
      const tx=cx+(R-1.5)*Math.cos(ta), ty=cy+(R-1.5)*Math.sin(ta);
      const trot=((ta+Math.PI/2)*180)/Math.PI;
      pdf.text(docShort[ti],tx,ty,{align:"center",angle:-trot});
    }

    pdf.setFontSize(5.5);
    const botStr="PEARLSMILE DENTAL";
    const botSpan=Math.min(botStr.length*0.175,1.4);
    const botStart=Math.PI/2-botSpan/2;
    for(let bi=0;bi<botStr.length;bi++){
      const ba=botStart+(bi/Math.max(botStr.length-1,1))*botSpan;
      const bx=cx+(R-1.5)*Math.cos(ba), by=cy+(R-1.5)*Math.sin(ba);
      const brot=((ba-Math.PI/2)*180)/Math.PI;
      pdf.text(botStr[bi],bx,by,{align:"center",angle:-brot});
    }

    sd(INK); pdf.setLineWidth(0.8); pdf.line(cx,cy-8,cx,cy+7);
    pdf.setLineWidth(0.5);
    pdf.line(cx,cy-7.5,cx-4,cy-9.5); pdf.line(cx-4,cy-9.5,cx-6,cy-8); pdf.line(cx-6,cy-8,cx-3,cy-6.5);
    pdf.line(cx,cy-7.5,cx+4,cy-9.5); pdf.line(cx+4,cy-9.5,cx+6,cy-8); pdf.line(cx+6,cy-8,cx+3,cy-6.5);
    sf(INK); pdf.circle(cx,cy-8.2,1,"F");

    pdf.setLineWidth(0.6);
    pdf.lines([[2,-2],[2,-2],[0,-2]],cx-3,cy+5,[1,1],"S");
    pdf.lines([[-2,-2],[-2,-2],[0,-2]],cx+3,cy+1,[1,1],"S");
    pdf.lines([[2,-2],[2,-2]],cx-3,cy-3,[1,1],"S");
    pdf.lines([[-2,-2],[-2,-2],[0,-2]],cx+3,cy+5,[1,1],"S");
    pdf.lines([[2,-2],[2,-2],[0,-2]],cx-3,cy+1,[1,1],"S");

    st(INK); pdf.setFont("helvetica","normal"); pdf.setFontSize(4.5);
    pdf.text("Reg. "+(doc.reg||"—"), cx, cy+R-5.5, { align:"center" });
    st(INK2); pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5);
    pdf.text("Authorised Signatory", cx, cy+R+4, { align:"center" });

    st(GRAY); pdf.setFontSize(7); pdf.setFont("helvetica","normal");
    pdf.text("Rx No.: "+rxNum, 14, sigY+30);
    pdf.text("Date: "+todayFmt, W-14, sigY+30, { align:"right" });

    // ── Footer ────────────────────────────────────────────────────
    sf(NAVY); pdf.rect(3.5,H-21,W-7,17.5,"F");
    sf(BLUE); pdf.rect(3.5,H-7,W-7,3.5,"F");
    st(WHITE); pdf.setFont("helvetica","bold"); pdf.setFontSize(7.5);
    pdf.text("PearlSmile Dental Hospital", 10, H-14.5);
    st(LBLUE); pdf.setFont("helvetica","normal"); pdf.setFontSize(7);
    pdf.text("+91 87936 08083", 10, H-9.5);
    pdf.text("care@pearlsmiledental.in", W/2, H-9.5, { align:"center" });
    pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W-10, H-9.5, { align:"right" });
    st(LBLUE2); pdf.setFontSize(6); pdf.setFont("helvetica","italic");
    pdf.text("This is a computer-generated prescription from PearlSmile Dental Hospital. Valid only with authorised doctor details.", W/2, H-5.5, { align:"center" });

    // ── Output ────────────────────────────────────────────────────
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const name = "Prescription_"+(patient.name||"Patient").replace(/\s+/g,"_")+"_"+visitDate+".pdf";

    let rawMob = (patient.mobile||"").replace(/[\s\-\(\)\+]/g,"");
    if (!rawMob.startsWith("91") && rawMob.length===10) rawMob = "91"+rawMob;

    setPdfBlob(blob);
    setPdfUrl(url);
    setRxMobile(rawMob);
    setFileName(name);
    // Show native share button only if Web Share API supports files — exactly like original HTML
    const testFile = new File([blob], name, { type:"application/pdf" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files:[testFile] })) {
      setCanNativeShare(true);
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl; link.download = fileName; link.click();
  };

  const openFullPreview = () => { if (pdfUrl) window.open(pdfUrl, "_blank"); };

  const shareViaWhatsApp = () => {
    if (rxMobile) window.open("https://wa.me/"+rxMobile, "_blank");
    showNotify("WhatsApp Opened!", "Attach the PDF from the preview and send to patient.");
  };

  const nativeShare = async () => {
    if (!pdfBlob) return;
    const file = new File([pdfBlob], fileName, { type:"application/pdf" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files:[file] })) {
      navigator.share({ title:"Digital Prescription — PearlSmile Dental Hospital", text:"", files:[file] })
        .then(() => { showNotify("Shared!", "Prescription shared successfully."); onClose(); })
        .catch(err => { if (err.name !== "AbortError") showNotify("Share Failed", err.message, true); });
    } else {
      showNotify("Not Supported", "Native share not supported on this device/browser.", true);
    }
  };

  return (
    <div className="rx-share-overlay open" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:540,
        boxShadow:"0 24px 80px rgba(0,0,0,0.45)", overflow:"hidden",
        display:"flex", flexDirection:"column", maxHeight:"92vh" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#0a1628,#1a3a6b)", padding:"18px 22px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>📄</span>
            <div>
              <div style={{ color:"#fff", fontWeight:600, fontSize:15, fontFamily:"DM Sans,sans-serif" }}>Digital Prescription Ready</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12, fontFamily:"DM Sans,sans-serif" }}>
                {patient.name} · {visit.visitDate}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"none",
            color:"#fff", width:32, height:32, borderRadius:"50%", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* PDF Preview */}
        <div style={{ flex:1, overflow:"hidden", background:"#f0eeeb", minHeight:340, position:"relative" }}>
          {loading && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", background:"#f0eeeb", gap:10 }}>
              <div style={{ width:36, height:36, border:"3px solid #0d7377", borderTopColor:"transparent",
                borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <div style={{ fontSize:13, color:"#5a5550", fontFamily:"DM Sans,sans-serif" }}>Generating PDF…</div>
            </div>
          )}
          {pdfUrl && <iframe title="prescription" src={pdfUrl} style={{ width:"100%", height:420, border:"none" }} />}
        </div>

        {/* Action buttons — exactly like original HTML */}
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10, background:"#fff" }}>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={openFullPreview}
              onMouseOver={e => e.currentTarget.style.background="#e5e0d8"}
              onMouseOut={e => e.currentTarget.style.background="#f0eeeb"}
              style={{ flex:1, background:"#f0eeeb", color:"#0a1628", border:"1.5px solid #ddd9d3",
                borderRadius:10, padding:10, fontSize:13, fontWeight:500, cursor:"pointer",
                fontFamily:"DM Sans,sans-serif", transition:"background 0.2s" }}>
              🔍 Open Full PDF
            </button>
            {canNativeShare && (
              <button onClick={nativeShare}
                onMouseOver={e => e.currentTarget.style.background="#e5e0d8"}
                onMouseOut={e => e.currentTarget.style.background="#f0eeeb"}
                style={{ flex:1, background:"#f0eeeb", color:"#0a1628", border:"1.5px solid #ddd9d3",
                  borderRadius:10, padding:10, fontSize:13, fontWeight:500, cursor:"pointer",
                  fontFamily:"DM Sans,sans-serif", transition:"background 0.2s" }}>
                📤 Share (Device)
              </button>
            )}
          </div>
          <p style={{ fontSize:11, color:"#9a9590", textAlign:"center", margin:0,
            fontFamily:"DM Sans,sans-serif", lineHeight:1.5 }}>
            On mobile: tap "Share (Device)" to send directly via WhatsApp.<br />
            On desktop: use "Open Full PDF" to view, then share manually.
          </p>
        </div>
      </div>
    </div>
  );
}
