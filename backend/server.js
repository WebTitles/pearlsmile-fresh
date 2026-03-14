// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
// console.log("  PearlSmile Backend Starting...");
// console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// if (!process.env.MONGO_URI) {
//   console.error("❌ MONGO_URI missing! Check your .env file.");
//   process.exit(1);
// }

// console.log("✅ .env loaded | PORT:", process.env.PORT || 5000);

// const authRoutes = require("./routes/auth");
// const servicesRoutes = require("./routes/services");
// const pricingRoutes = require("./routes/pricing");
// const patientsRoutes = require("./routes/patients");
// const appointmentsRoutes = require("./routes/appointments");

// const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   }),
// );
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/services", servicesRoutes);
// app.use("/api/pricing", pricingRoutes);
// app.use("/api/patients", patientsRoutes);
// app.use("/api/appointments", appointmentsRoutes);

// app.get("/api/health", (req, res) =>
//   res.json({ status: "ok", message: "PearlSmile API running" }),
// );
// app.use((req, res) => res.status(404).json({ message: "Route not found" }));
// app.use((err, req, res, next) =>
//   res.status(500).json({ message: err.message }),
// );

// console.log("⏳ Connecting to MongoDB Atlas...\n");

// mongoose
//   .connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 15000,
//     socketTimeoutMS: 45000,
//   })
//   .then(() => {
//     console.log("✅ MongoDB connected!\n");
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🚀 PearlSmile API → http://localhost:" + PORT);
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
//       console.log(
//         "NEXT STEP: Open browser → http://localhost:5000/api/auth/seed-doctors",
//       );
//       console.log("(Do this only once to create doctor login accounts)\n");
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection FAILED:", err.message);
//     console.error("\n👉 Fix: Go to Atlas → Network Access → Add IP 0.0.0.0/0");
//     process.exit(1);
//   });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
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

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
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
