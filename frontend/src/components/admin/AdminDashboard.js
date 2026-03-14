// // ============================================================
// // src/components/admin/AdminDashboard.js
// // ============================================================
// import React, { useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import ServicesTab from "./ServicesTab";
// import PricingTab from "./PricingTab";
// import PatientsTab from "./PatientsTab";
// import AdminNotify from "./AdminNotify";

// export default function AdminDashboard({ showToast }) {
//   const { doctor, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState("services");
//   const [notify, setNotify] = useState({ show: false, title: "", msg: "", error: false });

//   const showNotify = (title, msg, isError = false) => {
//     setNotify({ show: true, title, msg, error: isError });
//     setTimeout(() => setNotify(n => ({ ...n, show: false })), 3500);
//   };

//   const tabs = [
//     { id: "services", label: "Manage Services" },
//     { id: "pricing", label: "Manage Pricing" },
//     { id: "patients", label: "👥 Patient Profiles" },
//   ];

//   return (
//     <>
//       <div className="admin-topbar">
//         <div>
//           <h3>Doctor Admin Panel</h3>
//           <p>Welcome, {doctor?.name} — changes reflect live on the website instantly.</p>
//         </div>
//         <button className="admin-logout" onClick={logout}>Logout</button>
//       </div>

//       <div className="admin-tabs">
//         {tabs.map(t => (
//           <button
//             key={t.id}
//             className={`admin-tab${activeTab === t.id ? " active" : ""}`}
//             onClick={() => setActiveTab(t.id)}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {activeTab === "services" && <ServicesTab showNotify={showNotify} />}
//       {activeTab === "pricing" && <PricingTab showNotify={showNotify} />}
//       {activeTab === "patients" && <PatientsTab showNotify={showNotify} doctor={doctor} />}

//       <AdminNotify
//         show={notify.show}
//         title={notify.title}
//         msg={notify.msg}
//         error={notify.error}
//         onClose={() => setNotify(n => ({ ...n, show: false }))}
//       />
//     </>
//   );
// }

// // ============================================================
// // src/components/admin/AdminDashboard.js
// // ============================================================
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import ServicesTab from "./ServicesTab";
// import PricingTab from "./PricingTab";
// import PatientsTab from "./PatientsTab";
// import AppointmentsTab from "./AppointmentsTab";
// import AdminNotify from "./AdminNotify";
// import api from "../../utils/api";

// export default function AdminDashboard({ showToast }) {
//   const { doctor, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState("services");
//   const [notify, setNotify] = useState({
//     show: false,
//     title: "",
//     msg: "",
//     error: false,
//   });
//   const [pendingCount, setPendingCount] = useState(0);

//   const showNotify = (title, msg, isError = false) => {
//     setNotify({ show: true, title, msg, error: isError });
//     setTimeout(() => setNotify((n) => ({ ...n, show: false })), 3500);
//   };

//   // Fetch pending appointment count for badge
//   useEffect(() => {
//     async function fetchBadge() {
//       try {
//         const data = await api.get("/appointments");
//         if (Array.isArray(data)) {
//           const today = new Date();
//           const yyyy = today.getFullYear();
//           const mm = String(today.getMonth() + 1).padStart(2, "0");
//           const dd = String(today.getDate()).padStart(2, "0");
//           const todayStr = `${yyyy}-${mm}-${dd}`;
//           // count pending + today/upcoming
//           const active = data.filter(
//             (a) => a.status === "pending" && a.date >= todayStr,
//           ).length;
//           setPendingCount(active);
//         }
//       } catch (_) {}
//     }
//     fetchBadge();
//     const t = setInterval(fetchBadge, 60000);
//     return () => clearInterval(t);
//   }, []);

//   const tabs = [
//     { id: "services", label: "Manage Services" },
//     { id: "pricing", label: "Manage Pricing" },
//     { id: "patients", label: "👥 Patient Profiles" },
//     { id: "appointments", label: "📅 Appointments", badge: pendingCount },
//   ];

//   return (
//     <>
//       <div className="admin-topbar">
//         <div>
//           <h3>Doctor Admin Panel</h3>
//           <p>
//             Welcome, {doctor?.name} — changes reflect live on the website
//             instantly.
//           </p>
//         </div>
//         <button className="admin-logout" onClick={logout}>
//           Logout
//         </button>
//       </div>

//       <div className="admin-tabs">
//         {tabs.map((t) => (
//           <button
//             key={t.id}
//             className={`admin-tab${activeTab === t.id ? " active" : ""}`}
//             onClick={() => setActiveTab(t.id)}
//             style={{ position: "relative" }}
//           >
//             {t.label}
//             {t.badge > 0 && (
//               <span
//                 style={{
//                   position: "absolute",
//                   top: "-6px",
//                   right: "-6px",
//                   background: "#ef4444",
//                   color: "#fff",
//                   borderRadius: "50%",
//                   width: "18px",
//                   height: "18px",
//                   fontSize: "10px",
//                   fontWeight: 700,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   lineHeight: 1,
//                 }}
//               >
//                 {t.badge > 99 ? "99+" : t.badge}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {activeTab === "services" && <ServicesTab showNotify={showNotify} />}
//       {activeTab === "pricing" && <PricingTab showNotify={showNotify} />}
//       {activeTab === "patients" && (
//         <PatientsTab showNotify={showNotify} doctor={doctor} />
//       )}
//       {activeTab === "appointments" && (
//         <AppointmentsTab showNotify={showNotify} />
//       )}

//       <AdminNotify
//         show={notify.show}
//         title={notify.title}
//         msg={notify.msg}
//         error={notify.error}
//         onClose={() => setNotify((n) => ({ ...n, show: false }))}
//       />
//     </>
//   );
// }

// ============================================================
// src/components/admin/AdminDashboard.js
// ============================================================
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ServicesTab from "./ServicesTab";
import PricingTab from "./PricingTab";
import PatientsTab from "./PatientsTab";
import AppointmentsTab from "./AppointmentsTab";
import BillingTab from "./BillingTab";
import AdminNotify from "./AdminNotify";
import api from "../../utils/api";

export default function AdminDashboard({ showToast }) {
  const { doctor, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("services");
  const [notify, setNotify] = useState({
    show: false,
    title: "",
    msg: "",
    error: false,
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);

  const showNotify = (title, msg, isError = false) => {
    setNotify({ show: true, title, msg, error: isError });
    setTimeout(() => setNotify((n) => ({ ...n, show: false })), 3500);
  };

  // Badge: pending appointments
  useEffect(() => {
    async function fetchBadge() {
      try {
        const data = await api.get("/appointments");
        if (Array.isArray(data)) {
          const today = new Date();
          const yy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          const ts = `${yy}-${mm}-${dd}`;
          setPendingCount(
            data.filter((a) => a.status === "pending" && a.date >= ts).length,
          );
        }
      } catch (_) {}
    }
    fetchBadge();
    const t = setInterval(fetchBadge, 60000);
    return () => clearInterval(t);
  }, []);

  // Badge: unpaid invoices
  useEffect(() => {
    async function fetchUnpaid() {
      try {
        const data = await api.get("/billing");
        if (Array.isArray(data)) {
          setUnpaidCount(data.filter((i) => i.paymentStatus !== "paid").length);
        }
      } catch (_) {}
    }
    fetchUnpaid();
    const t = setInterval(fetchUnpaid, 60000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "services", label: "Manage Services" },
    { id: "pricing", label: "Manage Pricing" },
    { id: "patients", label: "Patient Profiles" },
    { id: "appointments", label: "Appointments", badge: pendingCount },
    { id: "billing", label: "Billings", badge: unpaidCount },
  ];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h3>Doctor Admin Panel</h3>
          <p>
            Welcome, {doctor?.name} — changes reflect live on the website
            instantly.
          </p>
        </div>
        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`admin-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
            style={{ position: "relative" }}
          >
            {t.label}
            {t.badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {t.badge > 99 ? "99+" : t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "services" && <ServicesTab showNotify={showNotify} />}
      {activeTab === "pricing" && <PricingTab showNotify={showNotify} />}
      {activeTab === "patients" && (
        <PatientsTab showNotify={showNotify} doctor={doctor} />
      )}
      {activeTab === "appointments" && (
        <AppointmentsTab showNotify={showNotify} />
      )}
      {activeTab === "billing" && (
        <BillingTab showNotify={showNotify} doctor={doctor} />
      )}

      <AdminNotify
        show={notify.show}
        title={notify.title}
        msg={notify.msg}
        error={notify.error}
        onClose={() => setNotify((n) => ({ ...n, show: false }))}
      />
    </>
  );
}
