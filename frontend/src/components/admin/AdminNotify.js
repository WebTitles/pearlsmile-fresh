// ============================================================
// src/components/admin/AdminNotify.js
// ============================================================
import React from "react";

export default function AdminNotify({ show, title, msg, error, onClose }) {
  return (
    <div className={`admin-notify-popup${show ? " show" : ""}${error ? " error" : ""}`}>
      <div style={{ fontSize:20 }}>{error ? "❌" : "✅"}</div>
      <div>
        <div className="admin-notify-title">{title}</div>
        {msg && <div className="admin-notify-msg">{msg}</div>}
      </div>
      <button className="admin-notify-close" onClick={onClose}>✕</button>
      {show && <div className="admin-notify-bar" />}
    </div>
  );
}
