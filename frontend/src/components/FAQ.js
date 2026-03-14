// ============================================================
// src/components/FAQ.js
// ============================================================
import React, { useState } from "react";

const faqs = [
  { q: "What are your clinic timings?", a: "We are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sundays from 9:00 AM to 5:00 PM. Emergency services are available 24/7 by calling our helpline." },
  { q: "Is dental treatment painful?", a: "At PearlSmile, we use advanced pain management techniques including topical anaesthetics, buffered anaesthesia, and sedation options. The vast majority of our patients report zero to minimal discomfort during treatment." },
  { q: "Do you accept dental insurance?", a: "Yes! We are empanelled with all major health insurance providers including Star Health, HDFC ERGO, ICICI Lombard, Bajaj Allianz, and more. Cashless treatment is available. We also offer EMI options for larger treatments." },
  { q: "How long does a dental implant procedure take?", a: "The complete implant process typically takes 3–6 months, but only 2–3 actual appointments. The surgical placement takes about 60 minutes. Most patients can return to work the next day." },
  { q: "Are your sterilisation standards up to international norms?", a: "Absolutely. We follow hospital-grade sterilisation protocols and hold ISO certification for infection control. All instruments are autoclaved and single-use items are never reused." },
  { q: "Do you treat children? From what age?", a: "Yes! Our pediatric dental team works with children from infancy. We recommend the first visit by age 1 or when the first tooth appears. Our child-friendly rooms make visits fun for kids." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq" id="faq">
      <div className="faq-inner">
        <div className="faq-header">
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Frequently <em>Asked</em> Questions</h2>
          <p className="section-desc" style={{ margin: "0 auto" }}>
            Everything you need to know before your visit.
          </p>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
            <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <div className="faq-toggle">+</div>
            </div>
            <div className="faq-a">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
