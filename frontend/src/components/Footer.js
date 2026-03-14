// ============================================================
// src/components/Footer.js
// ============================================================
import React from "react";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const hours = ["9am – 8pm","9am – 8pm","9am – 8pm","9am – 8pm","9am – 8pm","9am – 6pm","9am – 5pm"];
const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-col">
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:36,height:36,background:"linear-gradient(135deg,var(--teal),var(--teal-light))",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🦷</div>
            <div>
              <div style={{ fontFamily:"Cormorant Garamond,serif",fontSize:20,fontWeight:600,color:"white" }}>PearlSmile</div>
              <div style={{ fontSize:9,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase" }}>Dental Hospital</div>
            </div>
          </div>
          <p className="footer-desc">
            Pune's most trusted dental care centre. Transforming smiles with compassion, expertise, and cutting-edge technology since 2005.
          </p>
          <div className="social-links">
            {["📘","📸","🐦","▶️"].map((icon,i) => (
              <a key={i} className="social-link" href="#!">{icon}</a>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {["General Dentistry","Cosmetic Dentistry","Dental Implants","Orthodontics","Root Canal","Pediatric Dentistry"].map(s => (
              <li key={s}><a onClick={() => scrollTo("services")}>{s}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {[["About Us","about"],["Our Doctors","doctors"],["Pricing","pricing"],["Reviews","testimonials"],["FAQ","faq"],["Book Appointment","appointment"]].map(([label,id]) => (
              <li key={id}><a onClick={() => scrollTo(id)}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Clinic Hours</h4>
          <div className="footer-hours">
            {days.map((day, i) => (
              <div key={day} className={`hour-row${i === todayIdx ? " today" : ""}`}>
                <span>{day}{i === todayIdx ? " (Today)" : ""}</span>
                <span>{hours[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 PearlSmile Dental Hospital. All rights reserved.</p>
        <div style={{ display:"flex", gap:24 }}>
          <a href="#!">Privacy Policy</a>
          <a href="#!">Terms of Service</a>
          <a href="#!">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
