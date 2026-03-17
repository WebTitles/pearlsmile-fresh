require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PearlSmile Backend Starting...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (!process.env.MONGO_URI) {
  console.error("\n❌ MONGO_URI missing from .env file!");
  console.error("   1. Create a file called .env inside the /backend folder");
  console.error(
    "   2. Add:  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pearlsmile",
  );
  console.error("   3. Also add:  JWT_SECRET=pearlsmile_secret_123\n");
  process.exit(1);
}

console.log("✅ .env loaded | PORT:", process.env.PORT || 5000);
console.log(
  "✅ MONGO_URI:",
  process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@"),
);

const authRoutes = require("./routes/auth");
const servicesRoutes = require("./routes/services");
const pricingRoutes = require("./routes/pricing");
const patientsRoutes = require("./routes/patients");
const appointmentsRoutes = require("./routes/appointments");
const billingRoutes = require("./routes/billing");

const app = express();

// ✅ CORS — manual headers, no cors() package, guaranteed to work
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://pearl-smile-dental.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/billing", billingRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) =>
  res.status(500).json({ message: err.message }),
);

console.log("⏳ Connecting to MongoDB Atlas...");
console.log("   (this can take up to 15 seconds)\n");

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB connected!\n");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 PearlSmile API → http://localhost:" + PORT);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  })
  .catch((err) => {
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ MongoDB connection FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Error:", err.message);
    console.error("\n👉 THE FIX — do ALL of these in MongoDB Atlas:");
    console.error("   1. Network Access → + ADD IP ADDRESS");
    console.error('      → click "Allow Access from Anywhere" → Confirm');
    console.error("   2. Database Access → check your user exists");
    console.error(
      "   3. Make sure password in .env matches Atlas user password",
    );
    console.error("   4. Check your cluster is Active (not paused)");
    console.error("\n   Your URI (password hidden):");
    console.error("  ", process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@"));
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
  });
