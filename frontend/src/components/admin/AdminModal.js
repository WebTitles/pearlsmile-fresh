// ============================================================
// src/components/admin/AdminModal.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminModal({ onClose, showToast }) {
  const { isLoggedIn } = useAuth();

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="admin-modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="admin-modal-box">
        <div className="admin-modal-header">
          <span>Doctor Admin Panel</span>
          <button className="admin-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          {!isLoggedIn ? (
            <AdminLogin showToast={showToast} />
          ) : (
            <AdminDashboard showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
}
