// // ============================================================
// // src/components/Appointment.js
// // ============================================================
// import React, { useState } from "react";
// import api from "../utils/api";

// const PHONE = "+91 87936 08083";
// const WA_NUMBER = "918793608083";

// export default function Appointment({ showToast }) {
//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     service: "",
//     date: "",
//     time: "",
//     message: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

//   const handleWhatsApp = async (e) => {
//     e.preventDefault();
//     if (
//       !form.name.trim() ||
//       !form.phone.trim() ||
//       !form.service ||
//       !form.date
//     ) {
//       alert("Please fill in Name, Phone, Service, and Date.");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await api.post("/appointments", form);
//       const msg = encodeURIComponent(
//         `*PearlSmile Dental Hospital* — New Appointment Request\n\n` +
//           `*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Service:* ${form.service}\n` +
//           `*Date:* ${form.date}${form.time ? "\n*Time:* " + form.time : ""}\n` +
//           (form.message ? `*Message:* ${form.message}` : ""),
//       );
//       window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
//       showToast?.("✅ Appointment sent via WhatsApp!");
//       setForm({
//         name: "",
//         phone: "",
//         service: "",
//         date: "",
//         time: "",
//         message: "",
//       });
//     } catch (err) {
//       showToast?.("❌ " + err.message);
//     }
//     setSubmitting(false);
//   };

//   return (
//     <section className="appointment" id="appointment">
//       <div className="appointment-inner">
//         <div className="appointment-left">
//           <div className="section-tag">Book Appointment</div>
//           <h2 className="section-title">
//             Let's Fix Your
//             <br />
//             <em>Smile Today</em>
//           </h2>
//           <p className="section-desc">
//             Fill in your details and we'll confirm your appointment via WhatsApp
//             within 30 minutes.
//           </p>
//           <div className="contact-info">
//             <div className="contact-item">
//               <div className="contact-icon">📞</div>
//               <div>
//                 <strong>{PHONE}</strong>
//                 <span>Mon–Sat 8am–8pm, Sun 9am–5pm</span>
//               </div>
//             </div>
//             <div className="contact-item">
//               <div className="contact-icon">📍</div>
//               <div>
//                 <strong>12, Dental Plaza, MG Road</strong>
//                 <span>Pune, Maharashtra 411001</span>
//               </div>
//             </div>
//             <div className="contact-item">
//               <div className="contact-icon">✉️</div>
//               <div>
//                 <strong>care@pearlsmiledental.in</strong>
//                 <span>Response within 2 hours</span>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div>
//           <div className="form-card">
//             <div className="form-title">Request Appointment</div>
//             <div className="form-subtitle">
//               Form fills your WhatsApp with appointment details
//               <span className="wa-badge">WhatsApp</span>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Full Name *</label>
//                 <input
//                   type="text"
//                   placeholder="Your name"
//                   value={form.name}
//                   onChange={(e) => set("name", e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Phone Number *</label>
//                 <input
//                   type="tel"
//                   placeholder="+91 98765 43210"
//                   value={form.phone}
//                   onChange={(e) => set("phone", e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Service Required *</label>
//               <select
//                 value={form.service}
//                 onChange={(e) => set("service", e.target.value)}
//               >
//                 <option value="">Select a service</option>
//                 {[
//                   "General Checkup & Cleaning",
//                   "Teeth Whitening",
//                   "Dental Implants",
//                   "Root Canal",
//                   "Orthodontics / Invisalign",
//                   "Cosmetic Dentistry",
//                   "Pediatric Dentistry",
//                   "Emergency Care",
//                   "Other",
//                 ].map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Preferred Date *</label>
//                 <input
//                   type="date"
//                   value={form.date}
//                   onChange={(e) => set("date", e.target.value)}
//                   min={new Date().toISOString().split("T")[0]}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Preferred Time</label>
//                 <select
//                   value={form.time}
//                   onChange={(e) => set("time", e.target.value)}
//                 >
//                   <option value="">Any time</option>
//                   {[
//                     "9:00 AM",
//                     "9:30 AM",
//                     "10:00 AM",
//                     "10:30 AM",
//                     "11:00 AM",
//                     "11:30 AM",
//                     "12:00 PM",
//                     "2:00 PM",
//                     "2:30 PM",
//                     "3:00 PM",
//                     "3:30 PM",
//                     "4:00 PM",
//                     "4:30 PM",
//                     "5:00 PM",
//                     "5:30 PM",
//                     "6:00 PM",
//                     "6:30 PM",
//                     "7:00 PM",
//                   ].map((t) => (
//                     <option key={t} value={t}>
//                       {t}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Message / Concern (Optional)</label>
//               <textarea
//                 placeholder="Describe your dental concern or any special instructions..."
//                 value={form.message}
//                 onChange={(e) => set("message", e.target.value)}
//               />
//             </div>
//             <button
//               className="form-submit"
//               onClick={handleWhatsApp}
//               disabled={submitting}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
//                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
//                 <path d="M11.982 0C5.364 0 0 5.373 0 11.999c0 2.119.554 4.11 1.523 5.838L0 24l6.335-1.617A11.939 11.939 0 0011.982 24C18.6 24 24 18.627 24 12c0-6.627-5.4-12-12.018-12zm0 21.818a9.818 9.818 0 01-4.978-1.354l-.357-.213-3.705.948.983-3.596-.235-.37A9.791 9.791 0 012.182 12C2.182 6.582 6.573 2.182 11.982 2.182 17.4 2.182 21.818 6.582 21.818 12c0 5.418-4.418 9.818-9.836 9.818z" />
//               </svg>
//               {submitting ? "Sending..." : "Send via WhatsApp →"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



// ============================================================
// src/components/Appointment.js
// ============================================================
import React, { useState, useEffect } from "react";
import api from "../utils/api";

const PHONE     = "+91 87936 08083";
const WA_NUMBER = "918793608083";

export default function Appointment({ showToast }) {
  const [form, setForm] = useState({
    name: "", phone: "", service: "", date: "", time: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [doctors,    setDoctors]    = useState([]);

  // Fetch doctor availability on mount
  useEffect(() => {
    api.get("/auth/doctors")
      .then(data => { if (Array.isArray(data)) setDoctors(data); })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleWhatsApp = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.service || !form.date) {
      alert("Please fill in Name, Phone, Service, and Date.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/appointments", form);
      const msg = encodeURIComponent(
        `*PearlSmile Dental Hospital* — New Appointment Request\n\n` +
        `*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Service:* ${form.service}\n` +
        `*Date:* ${form.date}${form.time ? "\n*Time:* " + form.time : ""}\n` +
        (form.message ? `*Message:* ${form.message}` : "")
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
      showToast?.("✅ Appointment sent via WhatsApp!");
      setForm({ name: "", phone: "", service: "", date: "", time: "", message: "" });
    } catch (err) {
      showToast?.("❌ " + err.message);
    }
    setSubmitting(false);
  };

  return (
    <section className="appointment" id="appointment">
      <div className="appointment-inner">
        <div className="appointment-left">
          <div className="section-tag">Book Appointment</div>
          <h2 className="section-title">Let's Fix Your<br /><em>Smile Today</em></h2>
          <p className="section-desc">
            Fill in your details and we'll confirm your appointment via WhatsApp within 30 minutes.
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <strong>{PHONE}</strong>
                <span>Mon–Sat 8am–8pm, Sun 9am–5pm</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <strong>12, Dental Plaza, MG Road</strong>
                <span>Pune, Maharashtra 411001</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <strong>care@pearlsmiledental.in</strong>
                <span>Response within 2 hours</span>
              </div>
            </div>
          </div>

          {/* ── Doctor Availability Section ────────────────── */}
          {doctors.length > 0 && (
            <div style={{ marginTop: "28px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "#1e293b",
                textTransform: "uppercase", letterSpacing: "0.5px",
                marginBottom: "12px",
              }}>
                🩺 Doctors Available Today
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {doctors.map(doc => (
                  <div
                    key={doc._id}
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${doc.isAvailable ? "#bbf7d0" : "#fecaca"}`,
                      background: doc.isAvailable ? "#f0fdf4" : "#fef2f2",
                      opacity: doc.isAvailable ? 1 : 0.6,
                      transition: "all 0.2s",
                    }}
                  >
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: "14px",
                        color: doc.isAvailable ? "#166534" : "#991b1b",
                      }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {doc.specialty || "General Dentist"}
                      </div>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: "12px",
                      fontSize: "11px", fontWeight: 700,
                      background: doc.isAvailable ? "#dcfce7" : "#fee2e2",
                      color:      doc.isAvailable ? "#16a34a" : "#dc2626",
                      border:     `1px solid ${doc.isAvailable ? "#16a34a" : "#dc2626"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {doc.isAvailable ? "✅ Available" : "❌ Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ── End Doctor Availability ───────────────────── */}

        </div>
        <div>
          <div className="form-card">
            <div className="form-title">Request Appointment</div>
            <div className="form-subtitle">
              Form fills your WhatsApp with appointment details
              <span className="wa-badge">WhatsApp</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Service Required *</label>
              <select value={form.service} onChange={e => set("service", e.target.value)}>
                <option value="">Select a service</option>
                {[
                  "General Checkup & Cleaning","Teeth Whitening","Dental Implants",
                  "Root Canal","Orthodontics / Invisalign","Cosmetic Dentistry",
                  "Pediatric Dentistry","Emergency Care","Other",
                ].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select value={form.time} onChange={e => set("time", e.target.value)}>
                  <option value="">Any time</option>
                  {[
                    "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
                    "12:00 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM",
                    "4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM",
                  ].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Message / Concern (Optional)</label>
              <textarea
                placeholder="Describe your dental concern or any special instructions..."
                value={form.message}
                onChange={e => set("message", e.target.value)}
              />
            </div>
            <button
              className="form-submit"
              onClick={handleWhatsApp}
              disabled={submitting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.982 0C5.364 0 0 5.373 0 11.999c0 2.119.554 4.11 1.523 5.838L0 24l6.335-1.617A11.939 11.939 0 0011.982 24C18.6 24 24 18.627 24 12c0-6.627-5.4-12-12.018-12zm0 21.818a9.818 9.818 0 01-4.978-1.354l-.357-.213-3.705.948.983-3.596-.235-.37A9.791 9.791 0 012.182 12C2.182 6.582 6.573 2.182 11.982 2.182 17.4 2.182 21.818 6.582 21.818 12c0 5.418-4.418 9.818-9.836 9.818z"/>
              </svg>
              {submitting ? "Sending..." : "Send via WhatsApp →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
