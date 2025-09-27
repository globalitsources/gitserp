// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./utils/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import accountRoutes from "./routes/accountRoutes.js";
// import ipCheck from "./middlewares/ipCheck.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import http from "http";
// import { Server } from "socket.io";
// import chatEvents from "./socket/chatEvents.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.set("trust proxy", true);

// app.use(
//   cors({
//     origin: ['http://46.202.167.114', 'https://gitserp.in', 'http://localhost:5173'],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(ipCheck);
// app.use("/api/v2/user", userRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v3/attendance", attendanceRoutes);
// app.use("/api/v4/chat", chatRoutes);
// app.use("/api/v5/accounts", accountRoutes);

// const PORT = process.env.PORT || 8000;
// const server = http.createServer(app);
// const io = new Server(server, {
//   pingTimeout: 10000,
//   pingInterval: 20000,
//   transports: ["websocket", "polling"],
//   cors: {
//     origin: ['http://46.202.167.114', 'https://gitserp.in', 'http://localhost:5173'],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   }
// });
// chatEvents(io);

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT} at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
//   mongoose.connection.on("connected", () => {
//     console.log("Connected to MongoDB");
//   });
// });


// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./utils/db.js";

// // Routes
// import userRoutes from "./routes/userRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import accountRoutes from "./routes/accountRoutes.js";
// import ipCheck from "./middlewares/ipCheck.js";
// import chatRoutes from "./routes/chatRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.set("trust proxy", true);

// // ✅ Enable CORS
// app.use(
//   cors({
//     origin: [
//       "http://46.202.167.114",
//       "https://gitserp.in",
//       "http://localhost:5173"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(ipCheck);

// // ✅ API Routes
// app.use("/api/v2/user", userRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v3/attendance", attendanceRoutes);
// app.use("/api/v4/chat", chatRoutes);
// app.use("/api/v5/accounts", accountRoutes);

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("🚀 API is running on Vercel!");
// });

// // ❌ Remove app.listen (not supported in Vercel)
// // ✅ Just export the app
// export default app;

// // ✅ Keep MongoDB connection logging
// mongoose.connection.on("connected", () => {
//   console.log("✅ Connected to MongoDB");
// });
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import ipCheck from "./middlewares/ipCheck.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", true);

// ✅ Enable CORS
app.use(
  cors({
    origin: [
      "https://gitserp.in",                                   // Custom domain
      "https://gitserp-r3vy5w01o-gits-baea7f60.vercel.app",   // Vercel frontend domain
      "http://localhost:5173"                                // Local frontend dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ipCheck);

// ✅ API Routes
app.use("/api/v2/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v3/attendance", attendanceRoutes);
app.use("/api/v4/chat", chatRoutes);
app.use("/api/v5/accounts", accountRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 API is running on Render!");
});

// ✅ Start server (Render requires this)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ MongoDB connection log
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});
