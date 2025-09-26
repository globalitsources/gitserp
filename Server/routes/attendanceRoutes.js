import express from "express";
import { addHoliday, getAllAttendance, getAttendanceById, getHolidays, getStatus, markTimeIn, markTimeOut } from "../controllers/attendanceController.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

// Define routes
router.get("/status/:userId", auth, getStatus);
router.post("/time-in", auth, markTimeIn);
router.post("/time-out", auth, markTimeOut);
router.get("/allAttendance", auth, getAllAttendance)
router.get("/attendanceById/:id", auth, getAttendanceById);
router.post("/addHoliday", auth, addHoliday);
router.get("/allHoliday", auth, getHolidays);


export default router;
