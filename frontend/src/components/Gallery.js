// ============================================================
// src/components/Gallery.js
// ============================================================
import React from "react";

const galleryItems = [
  { emoji: "🏥", bg: "linear-gradient(135deg,#0a1628,#1a3a6b)", cls: "span2", label: "Reception & Lobby" },
  { emoji: "🦷", bg: "linear-gradient(135deg,#0d7377,#14a0a5)", cls: "", label: "Treatment Room" },
  { emoji: "💺", bg: "linear-gradient(135deg,#8b6914,#c9a84c)", cls: "r2", label: "Dental Suite" },
  { emoji: "🔬", bg: "linear-gradient(135deg,#1e3a5f,#2a5298)", cls: "", label: "Digital X-Ray Lab" },
  { emoji: "😁", bg: "linear-gradient(135deg,#0a1628,#0d7377)", cls: "", label: "Smile Gallery" },
  { emoji: "👶", bg: "linear-gradient(135deg,#5b3a8b,#9b59b6)", cls: "", label: "Kids' Zone" },
];

export default function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <div className="gallery-header">
        <div className="section-tag">Our Clinic</div>
        <h2 className="section-title">A Calm &amp; <em>Healing Space</em></h2>
        <p className="section-desc" style={{ margin: "0 auto" }}>
          Designed for comfort and confidence — our clinic is equipped with the latest technology
          in a warm, welcoming environment.
        </p>
      </div>
      <div className="gallery-grid">
        {galleryItems.map((g, i) => (
          <div
            key={i}
            className={`gallery-item ${g.cls}`}
            style={{ background: g.bg, flexDirection: "column", gap: 8 }}
          >
            <span style={{ fontSize: g.cls === "span2" ? 72 : 48 }}>{g.emoji}</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{g.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
