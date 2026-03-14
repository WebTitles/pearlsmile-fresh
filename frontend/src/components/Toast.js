// ============================================================
// src/components/Toast.js
// ============================================================
import React from "react";

export default function Toast({ show, message }) {
  return (
    <div className={`toast-msg${show ? " show" : ""}`}>
      {message}
    </div>
  );
}
