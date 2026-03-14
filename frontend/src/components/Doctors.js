// ============================================================
// src/components/Doctors.js
// ============================================================
import React from "react";

const doctors = [
  { emoji: "👨‍⚕️", color: "teal", badge: "Chief Surgeon", name: "Dr. Arjun Sharma", specialty: "Chief Dental Surgeon", desc: "BDS, MDS (Oral & Maxillofacial Surgery). 18 years of experience in complex implant surgeries and full-mouth rehabilitations.", exp: "18 yrs exp.", rating: "4.9 ★" },
  { emoji: "👩‍⚕️", color: "navy", badge: "Cosmetic Expert", name: "Dr. Priya Nair", specialty: "Cosmetic & Aesthetic Dentist", desc: "BDS, MDS (Prosthodontics). Specialist in smile design, veneers, and complete aesthetic transformations.", exp: "12 yrs exp.", rating: "4.8 ★" },
  { emoji: "👨‍⚕️", color: "gold", badge: "Orthodontist", name: "Dr. Rahul Verma", specialty: "Orthodontics & Invisalign", desc: "BDS, MDS (Orthodontics). Certified Invisalign provider. Specialises in complex bite corrections and teen orthodontics.", exp: "10 yrs exp.", rating: "4.9 ★" },
];

export default function Doctors() {
  return (
    <section className="doctors" id="doctors">
      <div className="doctors-header">
        <div className="section-tag">Our Specialists</div>
        <h2 className="section-title">Meet Your <em>Care Team</em></h2>
        <p className="section-desc">
          Our highly qualified specialists bring decades of combined experience and a genuine passion
          for creating beautiful, healthy smiles.
        </p>
      </div>
      <div className="doctors-grid">
        {doctors.map((d, i) => (
          <div className="doctor-card" key={i}>
            <div className={`doctor-img ${d.color}`}>
              {d.emoji}
              <div className="doctor-badge">{d.badge}</div>
            </div>
            <div className="doctor-body">
              <h3>{d.name}</h3>
              <div className="doctor-specialty">{d.specialty}</div>
              <p>{d.desc}</p>
              <div className="doctor-meta">
                <span>🎓 {d.exp}</span>
                <span>⭐ {d.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
