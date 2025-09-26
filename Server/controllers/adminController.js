import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import Project from "../models/projectModel.js";
import assignmentModels from "../models/assignmentModels.js";
import Report from "../models/reportModel.js";
import moment from "moment";

// register
const register = async (req, res) => {
  try {
    const { userId, password, role, name } = req.body;

    const existingUser = await Admin.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Admin({
      userId,
      name,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Registration Error:", err);

    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: err.message || "Validation error" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, url, assignedBackline, monthlyReport, costing } = req.body;

    console.log("Create project request:", req.body);
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const existingProject = await Project.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProject) {
      return res.status(400).json({ message: "Project already exists" });
    }

    const newProject = new Project({ name, url: url || null, costing: costing || null, backline: assignedBackline || null, monthlyReport: monthlyReport || null });
    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update project by ID
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, assignedBackline, monthlyReport, paused, costing } = req.body;
    console.log(req.body)
    const updated = await Project.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(url !== undefined && { url }),
        ...(assignedBackline !== undefined && { backline: assignedBackline }),
        ...(monthlyReport !== undefined && { monthlyReport }),
        ...(paused !== undefined && { paused }),
        ...(costing !== undefined && { costing }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// Delete project by ID
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await Admin.find({}, "_id name role").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

// delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await Admin.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};

// assign project
const assignProject = async (req, res) => {
  const { name, projects } = req.body;

  console.log("Backend received:", req.body);

  if (!name || !projects || !Array.isArray(projects) || projects.length === 0) {
    return res
      .status(400)
      .json({ message: "User ID and at least one Project ID are required." });
  }
  try {
    const assignments = projects.map((projectId) => ({
      name,
      project: projectId,
    }));

    await assignmentModels.insertMany(assignments);

    res.status(201).json({ message: "Projects assigned successfully." });
  } catch (error) {
    console.error("Assignment error:", error);
    res.status(500).json({ message: "❗ Server error during assignment." });
  }
};

// Get today's reports

// const getTodayReports = async (req, res) => {
//   try {
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const reports = await Report.find({
//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//     })
//       .populate({ path: "userId", select: "name", strictPopulate: false })
//       .sort({ createdAt: -1 });

//     const assignments = await assignmentModels.find()
//       .populate({ path: "name", select: "name", strictPopulate: false })
//       .populate({ path: "project", select: "name url", strictPopulate: false });

//     const userMap = {};

//     assignments.forEach((assignment) => {
//       if (!assignment.name || !assignment.project) return;

//       const userId = assignment.name._id.toString();
//       const userName = assignment.name.name;
//       const projectName = assignment.project.name || "Unnamed Project";
//       const projectUrl = assignment.project.url || "";

//       if (!userMap[userId]) {
//         userMap[userId] = {
//           name: userName,
//           reports: [],
//           assignedProjects: [],
//         };
//       }

//       if (!userMap[userId].assignedProjects.includes(projectName)) {
//         userMap[userId].assignedProjects.push(projectName);
//       }
//     });
//     reports.forEach((report) => {
//       if (!report.userId) return;

//       const userId = report.userId._id.toString();
//       if (userMap[userId]) {
//         report.reports.forEach((entry) => {
//           userMap[userId].reports.push({
//             projectName: report.projectName,
//             taskNumber: entry.taskNumber,
//             workType: entry.workType,
//             workDescription: entry.workDescription,
//           });
//         });
//       }
//     });


//     const userData = Object.values(userMap).map((user) => {
//       const combined = user.assignedProjects.flatMap((projectName) => {
//         const reportsForProject = user.reports.filter(
//           (r) => r.projectName === projectName
//         );

//         return reportsForProject.length > 0
//           ? reportsForProject
//           : [
//             {
//               projectName,
//               projectUrl: "",
//               taskNumber: null,
//               workType: null,
//               workDescription: null,
//             },
//           ];
//       });

//       return {
//         name: user.name,
//         reports: combined,
//       };
//     });

//     res.status(200).json(userData);
//   } catch (error) {
//     console.error("Today report error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
const getTodayReports = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Populate user + project in reports
    const reports = await Report.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate({ path: "userId", select: "name", strictPopulate: false })
      .populate({ path: "projectId", model: "Project" }) // populate project in report
      .sort({ createdAt: -1 });

    // Populate user + project in assignments
    const assignments = await assignmentModels.find()
      .populate({ path: "name", select: "name", strictPopulate: false })
      .populate({ path: "project", model: "Project" }); // full project model

    const userMap = {};

    assignments.forEach((assignment) => {
      if (!assignment.name || !assignment.project) return;

      const userId = assignment.name._id.toString();
      const userName = assignment.name.name;

      if (!userMap[userId]) {
        userMap[userId] = {
          name: userName,
          reports: [],
          assignedProjects: [],
        };
      }

      // store full project object instead of just name
      const projectObj = assignment.project.toObject();
      if (
        !userMap[userId].assignedProjects.some(
          (p) => p._id.toString() === projectObj._id.toString()
        )
      ) {
        userMap[userId].assignedProjects.push(projectObj);
      }
    });

    reports.forEach((report) => {
      if (!report.userId || !report.projectId) return;

      const userId = report.userId._id.toString();
      if (userMap[userId]) {
        const projectObj = report.projectId.toObject();
        report.reports.forEach((entry) => {
          userMap[userId].reports.push({
            project: projectObj, // full project info
            taskNumber: entry.taskNumber,
            workType: entry.workType,
            workDescription: entry.workDescription,
          });
        });
      }
    });

    const userData = Object.values(userMap).map((user) => {
      const combined = user.assignedProjects.flatMap((projectObj) => {
        const reportsForProject = user.reports.filter(
          (r) => r.project._id.toString() === projectObj._id.toString()
        );

        return reportsForProject.length > 0
          ? reportsForProject
          : [
            {
              project: projectObj,
              taskNumber: null,
              workType: null,
              workDescription: null,
            },
          ];
      });

      return {
        name: user.name,
        reports: combined,
      };
    });

    res.status(200).json(userData);
  } catch (error) {
    console.error("Today report error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all reports

const allReports = async (req, res) => {
  try {

    const startDate = moment().startOf("month").toDate();
    const endDate = moment().endOf("month").toDate();
    const reports = await Report.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate("userId")
      .populate("projectId")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Get reports by user ID
const getReportsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;


    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const reports = await Report.find({
      userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// const getReportsByUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const reports = await Report.find({ userId }).sort({ createdAt: -1 });
//     res.json(reports);
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// const getAssignedProjectsByAdmin = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const assignments = await assignmentModels
//       .find({ name: userId })
//       .populate("project")
//       .sort({ createdAt: -1 });

//     const projectList = assignments
//       .filter(a => a.project)
//       .map(a => a.project);

//     res.json(projectList);
//   } catch (error) {
//     console.error("Error fetching assigned projects:", error);
//     res.status(500).json({ message: "Error fetching assigned projects" });
//   }
// };
const getAssignedProjectsByAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const assignments = await assignmentModels
      .find({ name: userId })
      .populate("project")
      .sort({ createdAt: -1 });

    const projectList = await Promise.all(
      assignments
        .filter(a => a.project)
        .map(async a => {
          const allAssignments = await assignmentModels
            .find({ project: a.project._id })
            .populate("name");

          return {
            ...a.project.toObject(),
            assignedUsers: allAssignments
              .filter(assn => assn.name)
              .map(assn => ({
                assignmentId: assn._id,
                userId: assn.name.userId,
                name: assn.name.name,
                role: assn.name.role,
                assignedAt: assn.assignedAt,
              }))
          };
        })
    );

    res.json(projectList);
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    res.status(500).json({ message: "Error fetching assigned projects" });
  }
};

const deleteAssignedProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const assignment = await assignmentModels.findOneAndDelete({
      project: projectId,
      name: userId,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assigned project deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Server error while deleting assignment" });
  }
};


const getProjectsWithAssignedUsers = async (req, res) => {
  try {
    const data = await assignmentModels.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      {
        $unwind: "$projectDetails",
      },
      {
        $lookup: {
          from: "admins",
          localField: "name",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $group: {
          _id: "$project",
          projectInfo: { $first: "$projectDetails" },
          assignedUsers: {
            $push: {
              _id: "$userDetails._id",
              name: "$userDetails.name",
              email: "$userDetails.email",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          projectId: "$projectInfo._id",
          projectName: "$projectInfo.name",
          url: "$projectInfo.url",
          backline: "$projectInfo.backline",
          monthlyReport: "$projectInfo.monthlyReport",
          paused: "$projectInfo.paused",
          costing: "$projectInfo.costing",
          assignedUsers: 1,
        },
      }
    ]);

    const now = moment().tz("Asia/Kolkata");

    for (let d of data) {
      if (d.monthlyReport) {
        let nextDate = moment(d.monthlyReport).tz("Asia/Kolkata");
        while (nextDate.isBefore(now, "day")) {
          nextDate.add(1, "month");
        }

        if (nextDate.toDate().getTime() !== new Date(d.monthlyReport).getTime()) {
          await Project.findByIdAndUpdate(d.projectId, {
            monthlyReport: nextDate.toDate(),
          });
        }

        d.monthlyReport = nextDate.format("DD/MM/YYYY");
      } else {
        d.monthlyReport = null;
      }
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching projects with users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export {
  deleteProject,
  register,
  updateProject,
  getAllProjects,
  createProject,
  getAllUsers,
  assignProject,
  getTodayReports,
  allReports,
  getReportsByUser,
  getAssignedProjectsByAdmin,
  deleteUser,
  deleteAssignedProject,
  getProjectsWithAssignedUsers,
};
