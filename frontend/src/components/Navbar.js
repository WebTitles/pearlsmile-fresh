// ============================================================
// src/components/Navbar.js
// ============================================================
import React, { useState } from "react";

export default function Navbar({ onAdminClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <nav>
        <a className="nav-logo" onClick={() => scrollTo("home")}>
          <div className="logo-icon">🦷</div>
          <div>
            <div className="logo-text">PearlSmile</div>
            <div className="logo-sub">Dental Hospital</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => scrollTo("services")}>Services</a></li>
          <li><a onClick={() => scrollTo("pricing")}>Pricing</a></li>
          <li><a onClick={() => scrollTo("about")}>About</a></li>
          <li><a onClick={() => scrollTo("doctors")}>Doctors</a></li>
          <li><a onClick={() => scrollTo("testimonials")}>Reviews</a></li>
          <li><a onClick={() => scrollTo("faq")}>FAQ</a></li>
          <li>
            <a
              onClick={onAdminClick}
              style={{ color: "var(--gold)", fontWeight: 500 }}
            >
              Doctor Admin Panel
            </a>
          </li>
          <li>
            <a
              className="nav-cta"
              onClick={() => scrollTo("appointment")}
            >
              Book Appointment
            </a>
          </li>
        </ul>
        <button
          className="hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-nav${mobileOpen ? " open" : ""}`}>
        <a onClick={() => scrollTo("services")}>Services</a>
        <a onClick={() => scrollTo("pricing")}>Pricing</a>
        <a onClick={() => scrollTo("about")}>About</a>
        <a onClick={() => scrollTo("doctors")}>Our Doctors</a>
        <a onClick={() => scrollTo("gallery")}>Clinic</a>
        <a onClick={() => scrollTo("testimonials")}>Reviews</a>
        <a onClick={() => scrollTo("faq")}>FAQ</a>
        <a
          onClick={() => { setMobileOpen(false); onAdminClick(); }}
          style={{ color: "var(--gold)", fontWeight: 500 }}
        >
          Doctor Admin Panel
        </a>
        <a
          onClick={() => scrollTo("appointment")}
          style={{ color: "var(--teal-light)", fontWeight: 500 }}
        >
          Book Appointment →
        </a>
      </div>
    </>
  );
}
