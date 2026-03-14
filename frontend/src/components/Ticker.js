// ============================================================
// src/components/Ticker.js
// ============================================================
import React from "react";

const items = [
  "Painless Procedures","Cosmetic Dentistry","Award-Winning Care",
  "Same-Day Appointments","All Insurance Accepted","20+ Years Experience",
  "Advanced Anesthesia","State-of-the-Art Facility",
];

export default function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span className="ticker-item">{item}</span>
            <span className="ticker-sep">·</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
