import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// ✅ Routes
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import remarkRoutes from "./routes/remarkRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

// ✅ Connect Database
connectDB();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("HRMS Backend Running 🚀");
});




// ✅ API Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salary",salaryRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/remarks", remarkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/documents", documentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// ✅ Port from .env
const PORT = process.env.PORT || 5000;

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});