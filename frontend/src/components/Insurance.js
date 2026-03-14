// ============================================================
// src/components/Insurance.js
// ============================================================
import React from "react";

const insurers = ["Star Health","New India","HDFC ERGO","ICICI Lombard","Bajaj Allianz","Niva Bupa","Aditya Birla"];

export default function Insurance() {
  return (
    <section className="insurance">
      <div className="insurance-inner">
        <h3>We Accept All Major Insurance Plans</h3>
        <p>Cashless treatment available at our clinic. We're empanelled with leading health insurers.</p>
        <div className="insurance-logos">
          {insurers.map(name => (
            <div key={name} className="ins-logo">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
