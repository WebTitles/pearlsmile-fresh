// ============================================================
// src/components/Testimonials.js
// ============================================================
import React from "react";

const testimonials = [
  { avatar: "a", init: "A", name: "Aisha Mehta", role: "Software Engineer, Pune", quote: "Dr. Sharma's implant work is absolutely outstanding. I can't believe how natural my new tooth feels — zero pain and completed in just two visits.", stars: "★★★★★" },
  { avatar: "b", init: "R", name: "Raj Patel", role: "Business Owner, Mumbai", quote: "The smile makeover transformed my confidence completely. Dr. Priya's artistry with veneers is incredible — every detail is perfect.", stars: "★★★★★" },
  { avatar: "c", init: "S", name: "Sunita Krishnan", role: "School Teacher, Pune", quote: "Took my 5-year-old to the kids' suite and she actually enjoyed her first dental visit! The team was incredibly patient and gentle.", stars: "★★★★★" },
  { avatar: "d", init: "M", name: "Mohammed Qureshi", role: "CA, Pune", quote: "Invisalign results exceeded my expectations. Dr. Rahul monitored every step. My teeth are perfectly aligned in under 14 months!", stars: "★★★★★" },
  { avatar: "e", init: "P", name: "Preeti Sharma", role: "Homemaker, Nashik", quote: "Root canal with zero pain? I didn't believe it until it happened. The anesthesia was so effective I barely felt anything. Highly recommend!", stars: "★★★★★" },
  { avatar: "f", init: "V", name: "Vikram Iyer", role: "Marketing Manager, Pune", quote: "Premium experience from start to finish. Clean, modern, professional. The digital X-rays and 3D scans gave me full confidence in the diagnosis.", stars: "★★★★★" },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <div className="section-tag">Patient Stories</div>
        <h2 className="section-title">What Our Patients <em>Say</em></h2>
        <p className="section-desc" style={{ margin: "0 auto" }}>
          Real stories from real patients. Over 18,000 smiles transformed and counting.
        </p>
      </div>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div className="t-card" key={i}>
            <div className="t-stars">{t.stars}</div>
            <div className="t-quote">"{t.quote}"</div>
            <div className="t-author">
              <div className={`t-avatar ${t.avatar}`}>{t.init}</div>
              <div>
                <div className="t-name">{t.name}</div>
                <div className="t-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
