import React, { useState, useEffect } from "react";
import AdminNav from "./AdminNav";
import {
  FaTrash,
  FaEdit,
  FaPauseCircle,
  FaPlayCircle,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import axiosInstance from "../../axiosInstance";
import { motion, AnimatePresence, acceleratedValues } from "framer-motion";
import { toast } from "react-toastify";
import { FiLink } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const AddProject = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [monthlyReport, setMonthlyReport] = useState("");
  const [assignedBackline, setAssignedBackline] = useState("");
  const [costing, setCosting] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [allReports, setAllReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  // const fetchProjects = async () => {
  //   try {
  //     const res = await axiosInstance.get("/v1/admin");
  //     setProjects(res.data);
  //     // console.log("Projects fetched:", res.data);
  //   } catch (error) {
  //     console.error("Error fetching projects:", error);
  //   }
  // };
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await axiosInstance.get("/v1/admin/projects-with-user");
      setProjects(res.data);
      // console.log(res.data, "projects with user");
    };

    fetchProjects();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get("/v1/admin/reports");
      setAllReports(res.data || []);
      // console.log("All reports fetched:", res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const openAddModal = () => {
    setProjectName("");
    setProjectUrl("");
    setMonthlyReport("");
    setAssignedBackline("");
    setCosting("");
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setProjectName(project.projectName);
    setProjectUrl(project.url || "");
    setCosting(
      project.costing?.$numberDecimal || project.costing?.toString() || ""
    );

    let formattedDate = "";
    if (project.monthlyReport) {
      const [day, month, year] = project.monthlyReport.split("/");
      formattedDate = `${year}-${month}-${day}`;
    }

    setMonthlyReport(formattedDate);
    setAssignedBackline(project.backline?.toString() || "");
    setIsEditMode(true);
    setEditProjectId(project._id || project.projectId);

    setShowModal(true);
  };


  const handleAddOrUpdateProject = async (e) => {
    e.preventDefault();
    const trimmedName = projectName.trim().toLowerCase();
    if (!trimmedName) return;

    const duplicate = projects.some((proj) => {
      const pname = (proj.projectName || proj.name || "")
        .toString()
        .trim()
        .toLowerCase();
      return pname === trimmedName;
    });

    if (!isEditMode && duplicate) {
      toast.warning("Project already exists!");
      return;
    }

    try {
      const payload = {
        name: (projectName || "").trim(),
        url: (projectUrl || "").trim() || null,
        costing: costing ? String(Number(costing)) : null,

        assignedBackline: assignedBackline
          ? assignedBackline.toString().trim()
          : null,
        monthlyReport: monthlyReport ? monthlyReport.toString().trim() : null,
      };

      if (isEditMode) {
        await axiosInstance.put(`/v1/admin/${editProjectId}`, payload);
        setProjects((prev) =>
          prev.map((proj) =>
            proj.projectId === editProjectId || proj._id === editProjectId
              ? { ...proj, ...payload }
              : proj
          )
        );

      } else {
        const res = await axiosInstance.post("/v1/admin", payload);
        setProjects((prev) => [...prev, res.data]);
      }

      toast.success(
        isEditMode
          ? "Project updated successfully"
          : "Project added successfully"
      );
      setProjectName("");
      setProjectUrl("");
      setCosting("");
      setMonthlyReport("");
      setIsEditMode(false);
      setEditProjectId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving project:", error);
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      if (message.toLowerCase().includes("already exists")) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/v1/admin/${id}`);
        setProjects((prev) =>
          prev.filter(
            (proj) =>
              proj.projectId !== id && proj._id !== id
          )
        );


        Swal.fire("Deleted!", "The project has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire(
          "Error",
          "There was a problem deleting the project.",
          "error"
        );
      }
    }
  };

  const togglePause = async (project) => {
    try {
      const updated = { paused: !project.paused };

      await axiosInstance.put(`/v1/admin/${project.projectId}`, updated);

      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === project.projectId
            ? { ...p, paused: updated.paused }
            : p
        )
      );

      toast.success(
        updated.paused
          ? "Project paused successfully"
          : "Project resumed successfully"
      );
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Failed to update project status");
    }
  };

  const pausedCount = projects.filter((p) => p.paused).length;
  const activeCount = projects.filter((p) => !p.paused).length;

  return (
    <>
      <AdminNav />
      <div className="md:mt-15"></div>
      <div className="min-h-screen bg-green-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-800 flex gap-4">
              <span>All Projects ({projects.length})</span>
              <span className="text-green-600">Active ({activeCount})</span>
              <span className="text-red-600">Paused ({pausedCount})</span>
            </h1>

            <motion.button
              onClick={openAddModal}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition cursor-pointer"
            >
              + Add Project
            </motion.button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow">
              <p className="text-lg">No projects added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-green rounded-xl shadow text-sm">
                <thead className="bg-green-100 text-green-700">
                  <tr>
                    <th className="py-3 px-2 text-center">#</th>
                    <th className="py-3 px-2 text-left">Project</th>
                    <th className="py-3 px-1 text-center">Sheet</th>
                    <th className="py-3 px-2 text-center">Rating</th>
                    <th className="py-3 px-0 text-left">User</th>
                    <th className="py-3 px-0 text-center">Rank Check</th>
                    <th className="py-3 px-0 text-center">Assigned</th>
                    <th className="py-3 px-0 text-center">Executed</th>
                    <th className="py-3 px-4 text-center">Progress</th>
                    <th className="py-3 px-0 text-center">Reporting Date</th>
                    <th className="py-3 px-0 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...projects]
                    .sort((a, b) =>
                      (a.projectName || "")
                        .toLowerCase()
                        .localeCompare((b.projectName || "").toLowerCase())
                    )
                    .map((project, index) => {
                      const matchedReports = allReports.filter(
                        (report) => report.projectId?._id === project.projectId
                      );

                      const taskCount = matchedReports.reduce(
                        (total, report) => {
                          const sumOfTasks = report.reports?.reduce(
                            (sum, r) => sum + (parseInt(r.taskNumber) || 0),
                            0
                          );
                          return total + (sumOfTasks || 0);
                        },
                        0
                      );

                      const rankingCount = matchedReports.reduce(
                        (total, report) => {
                          const count =
                            report.reports?.filter(
                              (r) => r.workType === "Ranking update"
                            ).length || 0;
                          return total + count;
                        },
                        0
                      );

                      return (
                        <tr
                          key={project._id}
                          className={`border-b transition ${project.paused
                            ? "text-red-600 bg-red-300 hover:bg-red-200"
                            : "hover:bg-gray-50"
                            }`}
                        >

                          <td className="py-2 px-2 text-center">{index + 1}</td>
                          <td className="py-2 px-1 font-semibold  text-gray-800 ">
                            <Link
                              to={`/projectDetails/${project.projectId}`}
                              className="hover:underline"
                            >
                              {project.projectName}
                            </Link>
                          </td>
                          <td className="py-2 px-1 text-center">
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline flex items-center gap-1"
                              >
                                <FiLink /> Open
                              </a>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {parseFloat(project.costing?.$numberDecimal || project.costing || 0)}
                          </td>

                          <td className="py-2 px-0 ">
                            {project.assignedUsers
                              ?.map((user) => user.name)
                              .join(", ") || "No Users"}
                          </td>

                          <td className="py-2 px-0 text-center text-blue-600 font-semibold">
                            {rankingCount > 0 ? rankingCount : ""}
                          </td>

                          <td className="py-2 px-1 text-center">
                            {project.backline || ""}
                          </td>

                          <td className="py-2 px-1 text-green-700 font-medium text-center">
                            {taskCount}
                          </td>

                          <td className="py-2 px-2 text-center">
                            {project.backline && taskCount !== undefined ? (
                              <div className="flex items-center gap-2 text-center">
                                <div className="w-12 h-12">
                                  <CircularProgressbar
                                    value={project.backline > 0 ? (taskCount / project.backline) * 100 : 0}
                                    text={`${project.backline > 0 ? ((taskCount / project.backline) * 100).toFixed(0) : 0}%`}
                                    styles={buildStyles({
                                      textSize: "24px",
                                      pathColor: "green",
                                      trailColor: "yellow",
                                      textColor: "green",
                                    })}
                                  />
                                </div>
                                <div className="text-sm font-medium">
                                  <span className="text-gray-800 text-center">{taskCount}/{project.backline}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">No data</span>
                            )}
                          </td>



                          <td className="py-2 px-2 text-center">
                            {project.monthlyReport ? project.monthlyReport : ""}
                          </td>


                          <td className="py-2 px-2 text-center">
                            {project.paused ? (
                              <span className="flex items-center gap-1 text-red-600 font-semibold">
                                <FaPauseCircle className="text-lg" />
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <FaPlayCircle className="text-lg" />
                              </span>
                            )}
                          </td>

                          <td className="py-6 px-2 flex gap-2 text-center">
                            <button
                              onClick={() => openEditModal(project)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded cursor-pointer"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(project.projectId)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
                            >
                              <FaTrash />
                            </button>

                            <button
                              onClick={() => togglePause(project)}
                              className={`${project.paused
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-500 hover:bg-gray-600"
                                } text-white px-2 py-1 rounded cursor-pointer`}
                            >
                              {project.paused ? <FaPlay /> : <FaPause />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-green-200 font-bold text-green-900">
                  <tr>
                    <td colSpan="2" className="py-2 px-2 text-right">Total : </td>
                    <td className="py-2 px-2">
                      {projects.reduce((total, p) => {
                        const cost = parseFloat(p.costing?.$numberDecimal || p.costing || 0);
                        return total + (isNaN(cost) ? 0 : cost);
                      }, 0).toLocaleString("en-IN")}
                    </td>
                    <td colSpan="8"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>


      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-green-800 mb-4 text-center">
                {isEditMode ? "Edit Project" : "Add New Project"}
              </h2>
              <form onSubmit={handleAddOrUpdateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Sheet URL
                  </label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://google.com/sheet"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1 ">
                    Assigned
                  </label>
                  <input
                    type="number"
                    value={assignedBackline}
                    onChange={(e) => setAssignedBackline(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1 ">
                    Costing
                  </label>
                  <input
                    type="number"
                    value={costing}
                    onChange={(e) => setCosting(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Monthly Report Date
                  </label>
                  <input
                    type="date"
                    value={monthlyReport}
                    onChange={(e) => setMonthlyReport(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition duration-300 cursor-pointer"
                >
                  {isEditMode ? "Update Project" : "Add Project"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default AddProject;
