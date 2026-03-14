// ============================================================
// src/components/WhyUs.js
// ============================================================
import React from "react";

export default function WhyUs() {
  return (
    <section className="why-us" id="about">
      <div className="why-us-bg" />
      <div className="why-us-inner">
        <div>
          <div className="section-tag">Why PearlSmile</div>
          <h2 className="section-title">Care You Can<br /><em>Trust Completely</em></h2>
          <p className="section-desc">
            We combine advanced technology with genuine compassion, ensuring every visit is
            comfortable, efficient, and stress-free.
          </p>
          <div className="features-list">
            {[
              { icon: "🏆", title: "Award-Winning Specialists", desc: "Our team of 20+ specialists hold advanced certifications from top dental institutes and international bodies." },
              { icon: "🤖", title: "Latest Technology", desc: "3D X-rays, digital impressions, laser dentistry, and same-day crowns using our in-house CEREC system." },
              { icon: "😌", title: "Pain-Free Guarantee", desc: "Advanced sedation options and gentle techniques ensure you never feel a thing. Zero-anxiety dentistry." },
              { icon: "⏰", title: "Same-Day Appointments", desc: "Emergency dental care available 7 days a week. Walk-ins welcome. No waiting for weeks." },
            ].map((f, i) => (
              <div className="feature-item" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="why-visual">
          {[
            { num: "18,000+", label: "Smiles Transformed" },
            { num: "20+", label: "Specialist Doctors" },
            { num: "4.9★", label: "Average Patient Rating" },
            { num: "98%", label: "Would Recommend Us" },
          ].map((s, i) => (
            <div className="why-stat-card" key={i}>
              <div className="wsc-num">{s.num}</div>
              <div className="wsc-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
