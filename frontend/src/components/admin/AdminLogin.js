// ============================================================
// src/components/admin/AdminLogin.js
// ============================================================
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function AdminLogin({ showToast }) {
  const { login } = useAuth();
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!doctorId.trim() || !password) {
      setError("Please enter Doctor ID and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { doctorId: doctorId.trim(), password });
      login(res.token, res.doctor);
      showToast?.("✅ Logged in as " + res.doctor.name);
    } catch (err) {
      setError(err.message || "Incorrect credentials. Please try again.");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-gate">
      <div className="admin-lock-icon">🔒</div>
      <h2>Doctor Admin Panel</h2>
      <p>This area is restricted to authorised medical staff only. Please enter your credentials to continue.</p>
      <div className="admin-login-form">
        <div className="admin-input-group">
          <label>Doctor ID</label>
          <input
            type="text"
            placeholder="Enter your Doctor ID"
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="admin-input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>
        <button className="admin-login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Authenticating..." : "Access Admin Panel →"}
        </button>
        {error && <div className="admin-err">{error}</div>}
      </div>
    </div>
  );
}
