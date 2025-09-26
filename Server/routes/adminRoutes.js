import express from "express";
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  register,
  getAllUsers,
  assignProject,
  getTodayReports,
  allReports,
  getReportsByUser,
  getAssignedProjectsByAdmin,
  deleteUser,
  deleteAssignedProject,
  getProjectsWithAssignedUsers,
} from "../controllers/adminController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();


router.post("/register", auth, register);
router.get("/", auth, getAllProjects);
router.post("/", auth, createProject);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);
router.get("/users", auth, getAllUsers);
router.post("/assign", auth, assignProject);
router.get("/reports/today", auth, getTodayReports);
router.get("/reports", auth, allReports);
router.get("/user/:userId/reports", auth, getReportsByUser);
router.get("/assigned-projects/:userId", getAssignedProjectsByAdmin);
router.delete("/user/:userId", auth, deleteUser);
router.delete("/assigned/:userId/:projectId", deleteAssignedProject);
router.get("/projects-with-user", getProjectsWithAssignedUsers)





export default router;
