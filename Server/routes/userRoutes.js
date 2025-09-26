import express from "express";
import {
  getCurrentISTStatus,
  getReportById,
  getReportByProjectAndUser,
  getReports,
  getUserProjects,
  login,
  submitReport,
} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import { createQuery, getAllQueries, getUserQueries, updateQueryStatus, deleteQuery } from "../controllers/queryController.js"


const router = express.Router();

// login route
router.post("/login", login);
router.post("/projects", auth, getUserProjects);
router.post("/submit", auth, submitReport);
router.get("/get", auth, getReports);
router.get("/report/details/:projectId", auth, getReportById);
router.get("/report/:projectId/:userId", auth, getReportByProjectAndUser);
router.get("/currentTime", auth, getCurrentISTStatus);

router.post("/create", auth, createQuery);
router.get("/all", auth, getAllQueries);
router.get("/:userId", auth, getUserQueries);
router.put("/:id", auth, updateQueryStatus);
router.delete("/:id", auth, deleteQuery);

export default router;
