// ============================================================
// src/App.js
// ============================================================
import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import Services from "./components/Services";
import Pricing from "./components/Pricing";
import WhyUs from "./components/WhyUs";
import Doctors from "./components/Doctors";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Appointment from "./components/Appointment";
import Insurance from "./components/Insurance";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import AdminModal from "./components/admin/AdminModal";
import BackToTop from "./components/BackToTop";
import Toast from "./components/Toast";
import "./styles/global.css";

export const ToastContext = React.createContext(null);

function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  return (
    <AuthProvider>
      <ToastContext.Provider value={{ showToast }}>
        <div className="App">
          <Navbar onAdminClick={() => setAdminOpen(true)} />
          <Hero />
          <Ticker />
          <Services />
          <Pricing />
          <WhyUs />
          <Doctors />
          <Gallery />
          <Testimonials />
          <Appointment showToast={showToast} />
          <Insurance />
          <FAQ />
          <Footer />

          {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} showToast={showToast} />}
          <BackToTop />
          <Toast show={toast.show} message={toast.message} />
        </div>
      </ToastContext.Provider>
    </AuthProvider>
  );
}

export default App;
