// ============================================================
// src/components/Hero.js
// ============================================================
import React from "react";

export default function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero" id="home">
      <div className="hero-bg-pattern" />
      <div className="hero-glow" />
      <div className="hero-glow-2" />
      <div className="hero-content">
        <div className="hero-badge">✦ Trusted Since 2005 · ISO Certified</div>
        <h1>
          Your <em>Perfect</em><br />Smile Starts<br />Here<span className="gold">.</span>
        </h1>
        <p>
          World-class dental care in a calm, compassionate environment. From
          routine checkups to advanced cosmetic procedures — we deliver results
          that last a lifetime.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => scrollTo("appointment")}>
            Book Appointment →
          </button>
          <button className="btn-outline" onClick={() => scrollTo("services")}>
            Explore Services
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-number">18K+</div>
            <div className="stat-label">Happy Patients</div>
          </div>
          <div className="stat">
            <div className="stat-number">20+</div>
            <div className="stat-label">Expert Doctors</div>
          </div>
          <div className="stat">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-card">
          <div className="hero-card-top">
            <div className="doctor-avatar">👨‍⚕️</div>
            <div className="doctor-info">
              <h4>Dr. Arjun Sharma</h4>
              <p>Chief Dental Surgeon · 18 yrs exp.</p>
            </div>
          </div>
          <div className="card-rating">
            <div className="stars">★★★★★</div>
            <div className="rating-text">4.9 (2,100+ reviews)</div>
          </div>
          <div className="card-services">
            <div className="service-item">
              <div className="service-dot" />
              <span>General Dentistry</span>
              <div className="service-tag">Available</div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <span>Cosmetic Dentistry</span>
              <div className="service-tag">Available</div>
            </div>
            <div className="service-item">
              <div className="service-dot" style={{ background: "var(--gold)" }} />
              <span>Dental Implants</span>
              <div className="service-tag" style={{ background: "rgba(201,168,76,0.2)", color: "var(--gold)" }}>
                Specialist
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
