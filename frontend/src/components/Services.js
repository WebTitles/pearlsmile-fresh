// ============================================================
// src/components/Services.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const DEFAULT_SERVICES = [
  {
    icon: "🦷",
    name: "General Dentistry & Cleaning",
    desc: "Comprehensive oral examinations, professional cleanings, cavity detection, and preventive care for lasting dental health.",
    price: "Rs. 500",
    from: true,
  },
  {
    icon: "✨",
    name: "Cosmetic Dentistry & Smile Makeover",
    desc: "Transform your smile with veneers, bonding, whitening, and complete makeover packages designed to perfection.",
    price: "Rs. 3,500",
    from: true,
  },
  {
    icon: "🔩",
    name: "Dental Implants",
    desc: "Permanent tooth replacements using titanium implants — the gold standard for missing teeth, built to last decades.",
    price: "Rs. 25,000",
    from: true,
  },
  {
    icon: "📐",
    name: "Orthodontics & Invisalign",
    desc: "Traditional braces and clear aligner solutions to straighten teeth and correct bite issues at any age.",
    price: "Rs. 18,000",
    from: true,
  },
  {
    icon: "💉",
    name: "Root Canal Therapy",
    desc: "Painless, single-appointment root canal treatments using rotary endodontics and advanced anesthesia techniques.",
    price: "Rs. 4,000",
    from: true,
  },
  {
    icon: "👶",
    name: "Pediatric Dentistry",
    desc: "Gentle, child-friendly dental care from infancy through adolescence in our specially designed kids' suite.",
    price: "Rs. 400",
    from: true,
  },
];

export default function Services() {
  const [services, setServices] = useState(DEFAULT_SERVICES);

  const fetchServices = useCallback(() => {
    api
      .get("/services")
      .then((data) => {
        if (data && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchServices();
    // Refetch whenever the window regains focus (e.g. after saving in admin panel)
    window.addEventListener("focus", fetchServices);
    return () => window.removeEventListener("focus", fetchServices);
  }, [fetchServices]);

  // Also expose a global trigger so AdminDashboard can call it after save
  useEffect(() => {
    window.__refreshServices = fetchServices;
    return () => {
      delete window.__refreshServices;
    };
  }, [fetchServices]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="services" id="services">
      <div className="services-header">
        <div>
          <div className="section-tag">Our Services</div>
          <h2 className="section-title">
            Everything Your
            <br />
            <em>Smile Needs</em>
          </h2>
        </div>
        <div className="section-desc">
          Comprehensive dental care under one roof — from preventive treatments
          to advanced cosmetic procedures, delivered with cutting-edge
          technology.
        </div>
      </div>
      <div className="services-grid">
        {services.map((s, i) => (
          <div className="service-card" key={i}>
            <div className="service-icon">{s.icon}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="service-price-tag">
              <span className="price-from">{s.from ? "from " : ""}</span>
              {s.price}
            </div>
            <button
              className="service-link"
              onClick={() => scrollTo("appointment")}
            >
              Book Now →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
