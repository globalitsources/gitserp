import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";


import axiosInstance from "../../axiosInstance";
import { Users, Plus, FileText, X, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [projectCounts, setProjectCounts] = useState({});
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [showProjectsPopup, setShowProjectsPopup] = useState(false);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [hoveredProjects, setHoveredProjects] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [projectCosts, setProjectCosts] = useState({});
  const [taskCounts, setTaskCounts] = useState({});
  const [userTotals, setUserTotals] = useState({ backline: 0, tasks: 0 });
  const [userProgress, setUserProgress] = useState({});
  const [todayBLs, setTodayBLs] = useState({});
  const [blSortOrder, setBlSortOrder] = useState('desc');

  // const fetchUsers = async () => {
  //   try {
  //     const res = await axiosInstance.get("/v1/admin/users");
  //     const fetchedUsers = res.data.filter(
  //       (user) => user.name !== "Admin" && user.name !== "admin"
  //     );
  //     console.log(fetchedUsers, 'users')
  //     setUsers(fetchedUsers);
  //     setLoading(false);

  //     const counts = {};
  //     const costs = {};

  //     await Promise.all(
  //       fetchedUsers.map(async (user) => {
  //         try {
  //           const projectRes = await axiosInstance.get(
  //             `/v1/admin/assigned-projects/${user._id}`
  //           );
  //           console.log(projectRes.data, "projectres")
  //           const activeProjects = projectRes.data.filter((p) => !p.paused);

  //           counts[user._id] = activeProjects.length;

  //           costs[user._id] = activeProjects.reduce((sum, project) => {
  //             const totalCost = Number(project.costing?.$numberDecimal || 0);
  //             const assignedCount = project.assignedUsers?.length || 1;
  //             console.log(assignedCount, "assigned counts")
  //             return sum + totalCost / assignedCount;
  //           }, 0);

  //         } catch (err) {
  //           console.error(`Error loading projects for ${user.name}`, err);
  //           counts[user._id] = 0;
  //           costs[user._id] = 0;
  //         }
  //       })
  //     );

  //     setProjectCounts(counts);
  //     setProjectCosts(costs);

  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to load users");
  //     setLoading(false);
  //   }
  // };

  const toggleBLSort = () => {
    setBlSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const cacheKey = 'userDataCache';
      const cachedData = JSON.parse(localStorage.getItem(cacheKey));

      // Use cached data if available and not expired
      if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) { // 5-minute cache
        setUsers(cachedData.users);
        setProjectCounts(cachedData.counts);
        setProjectCosts(cachedData.costs);
        setUserProgress(cachedData.progress);
        setTodayBLs(cachedData.todayBLs || {});
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get("/v1/admin/users");
      const fetchedUsers = res.data.filter(
        (user) => user.name !== "Admin" && user.name !== "admin"
      );
      setUsers(fetchedUsers);

      const counts = {};
      const costs = {};
      const progress = {};
      const todayBLsTop = {};

      // Fetch all projects and reports concurrently
      const projectPromises = fetchedUsers.map(user =>
        axiosInstance.get(`/v1/admin/assigned-projects/${user._id}`)
          .then(res => ({ userId: user._id, projects: res.data }))
          .catch(() => ({ userId: user._id, projects: [] }))
      );

      const reportPromises = fetchedUsers.map(user =>
        axiosInstance.get(`/v1/admin/user/${user._id}/reports`)
          .then(res => ({ userId: user._id, reports: res.data }))
          .catch(() => ({ userId: user._id, reports: [] }))
      );

      const [projectResults, reportResults] = await Promise.all([
        Promise.all(projectPromises),
        Promise.all(reportPromises)
      ]);

      // Process data efficiently
      fetchedUsers.forEach(user => {
        const userProjects = projectResults.find(p => p.userId === user._id)?.projects || [];
        const activeProjects = userProjects.filter(p => !p.paused);

        counts[user._id] = activeProjects.length;
        costs[user._id] = activeProjects.reduce((sum, project) => {
          return sum + (Number(project.costing?.$numberDecimal || 0) / (project.assignedUsers?.length || 1));
        }, 0);

        // ✅ Declare once at the top
        const userReports = reportResults.find(r => r.userId === user._id)?.reports || [];

        const projectTaskCounts = {};
        userReports.forEach(entry => {
          if (entry.projectId) {
            projectTaskCounts[entry.projectId] = (projectTaskCounts[entry.projectId] || 0) +
              entry.reports.reduce((sum, rep) => sum + (Number(rep.taskNumber) || 0), 0);
          }
        });

        const totalBackline = activeProjects.reduce(
          (sum, project) => sum + (Number(project.backline) || 0),
          0
        );
        const totalTasks = Object.values(projectTaskCounts).reduce(
          (sum, count) => sum + count,
          0
        );

        progress[user._id] = { tasks: totalTasks, backline: totalBackline };

        // compute today's executed backline in IST
        const todayDateStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
        let todaySum = 0;

        userReports.forEach(entry => {
          const entryDateStr = new Date(entry.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
          if (entryDateStr === todayDateStr) {
            todaySum += entry.reports.reduce((sum, rep) => sum + (Number(rep.taskNumber) || 0), 0);
          }
        });

        todayBLsTop[user._id] = todaySum;
      });


      // Cache the results
      const cacheData = {
        users: fetchedUsers,
        counts,
        costs,
        progress,
        todayBLs: todayBLsTop,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

      setProjectCounts(counts);
      setProjectCosts(costs);
      setUserProgress(progress);
      setTodayBLs(todayBLsTop);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleProjectHover = async (userId) => {
    setHoveredUserId(userId);
    try {
      const res = await axiosInstance.get(
        `/v1/admin/assigned-projects/${userId}`
      );

      setHoveredProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch hovered projects", err);
      setHoveredProjects([]);
    }
  };

  const clearHover = () => {
    setHoveredUserId(null);
    setHoveredProjects([]);
  };
  const openReportPopup = async (user) => {
    setSelectedUser(user);
    setShowProjectsPopup(false);
    setShowReportPopup(true);
    setReportLoading(true);
    try {
      const res = await axiosInstance.get(`/v1/admin/user/${user._id}/reports`);

      const flattenedReports = res.data.flatMap((entry) =>
        entry.reports.map((rep) => ({
          ...rep,
          projectName: entry.projectName,
          createdAt: entry.createdAt,
        }))
      );

      setReports(flattenedReports);
      // console.log("Flattened reports:", flattenedReports);
    } catch (err) {
      console.error("Error loading reports", err);
      setReports([]);
    } finally {
      setReportLoading(false);
    }
  };

  const openAssignedProjectsPopup = async (user) => {
    setSelectedUser(user);
    setShowReportPopup(false);
    setReportLoading(false);
    setReports([]);
    try {
      const res = await axiosInstance.get(
        `/v1/admin/assigned-projects/${user._id}`
      );
      const projects = res.data || [];
      const activeProjects = projects.filter((p) => !p.paused);

      const total = activeProjects.reduce((sum, project) => {
        const cost = Number(project.costing?.$numberDecimal || 0);
        const assignedCount = project.assignedUsers?.length || 1;
        return sum + cost / assignedCount;
      }, 0);

      const reportsRes = await axiosInstance.get(
        `/v1/admin/user/${user._id}/reports`
      );

      const projectTaskCounts = {};

      reportsRes.data.forEach((entry) => {
        if (!projectTaskCounts[entry.projectId]) {
          projectTaskCounts[entry.projectId] = 0;
        }

        const taskSum = entry.reports.reduce(
          (sum, rep) => sum + (Number(rep.taskNumber) || 0),
          0
        );

        projectTaskCounts[entry.projectId] += taskSum;
      });

      setTaskCounts(projectTaskCounts);

      const totalBackline = activeProjects.reduce(
        (sum, project) => sum + (Number(project.backline) || 0),
        0
      );

      const totalTasks = Object.values(projectTaskCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      setUserTotals({ backline: totalBackline, tasks: totalTasks });


      setAssignedProjects(activeProjects);
      setTotalCost(total);
      setShowProjectsPopup(true);
    } catch (err) {
      console.error("Failed to fetch assigned projects", err);
      setAssignedProjects([]);
      setTotalCost(0);
      setTaskCounts({});
      setShowProjectsPopup(true);
    }
  };


  const closePopup = () => {
    setSelectedUser(null);
    setReports([]);
    setAssignedProjects([]);
    setShowProjectsPopup(false);
    setShowReportPopup(false);
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`))
      return;

    try {
      await axiosInstance.delete(`/v1/admin/user/${user._id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user");
    }
  };
  const handleDelete = async (projectId, userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This assigned project will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        console.log(userId, projectId);
        await axiosInstance.delete(`/v1/admin/assigned/${userId}/${projectId}`);

        await openAssignedProjectsPopup(selectedUser);

        Swal.fire({
          title: "Deleted!",
          text: "The project has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete the project.",
          icon: "error",
        });
      }
    }
  };
  const filteredUsers = users.filter((user) => user.name !== "Admin" && user.name !== "admin");

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aBL = Number(todayBLs[a._id] || 0);
    const bBL = Number(todayBLs[b._id] || 0);

    if (aBL === bBL) {
      return (a.name || "").localeCompare(b.name || "");
    }
    return blSortOrder === 'desc' ? bBL - aBL : aBL - bBL;
  });

  return (
    <>
      <AdminNav />
      <div className="p-6 md:mt-24 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Users className="text-green-600" />
            <h2 className="text-2xl font-bold text-green-600">
              All Users - {users.length}
            </h2>
          </div>
          <Link to="/adduser">
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer">
              <Plus size={18} />
              Add User
            </button>
          </Link>
        </div>

        <table className="table-auto w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-green-200 text-gray-900 font-bold text-center">
              <th className="border border-gray-300 px-4 py-2">User Name</th>
              <th className="border border-gray-300 px-4 py-2">
                <button
                  type="button"
                  onClick={toggleBLSort}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700"
                  aria-label="Toggle Today BL sort"
                >
                  Today BL
                  {blSortOrder === 'desc' ? (
                    <ArrowDown size={18} className="text-black" />
                  ) : (
                    <ArrowUp size={18} className="text-black" />
                  )}
                </button>
              </th>

              <th className="border border-gray-300 px-4 py-2">Rating</th>
              <th className="border border-gray-300 px-4 py-2">Progress</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-600">Loading users...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-red-500">{error}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-600">No users found.</td>
              </tr>
            ) : (

              sortedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">

                  <td className="border border-gray-300 px-4 py-2">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => openAssignedProjectsPopup(user)}
                      title="Click to view assigned projects"
                    >
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <Users size={20} />
                      </div>
                      <p className="font-semibold text-lg capitalize hover:underline">
                        {user.name}
                      </p>
                      {projectCounts[user._id] !== undefined && (
                        <div
                          className="relative text-xs ml-8 text-green-600 hover:underline cursor-pointer"
                          onMouseEnter={() => handleProjectHover(user._id)}
                          onMouseLeave={clearHover}
                        >
                          ({projectCounts[user._id]} projects)
                          {hoveredUserId === user._id &&
                            hoveredProjects.length > 0 && (
                              <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 shadow-xl rounded-md p-4 w-64 text-gray-800 text-sm">
                                <ol className="list-decimal list-inside max-h-40 overflow-y-auto">
                                  {[...hoveredProjects]
                                    .filter((proj) => !proj.paused)
                                    .sort((a, b) =>
                                      (a.name || "").localeCompare(b.name || "")
                                    )
                                    .map((proj, i) => (
                                      <Link
                                        to={`/projectDetails/${proj.id}`}
                                        key={i}
                                      >
                                        <li className="py-2">
                                          {proj.name || " "}
                                        </li>
                                      </Link>
                                    ))}
                                </ol>
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                  </td>

                  {/* Today BL */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {todayBLs[user._id] ?? 0}
                  </td>

                  {/* Rating */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {(projectCosts[user._id] || 0).toFixed(2)}
                  </td>

                  {/* Progress */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {userProgress[user._id] ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 h-12">
                          <CircularProgressbar
                            value={
                              userProgress[user._id].backline > 0
                                ? (userProgress[user._id].tasks /
                                  userProgress[user._id].backline) * 100
                                : 0
                            }
                            text={`${userProgress[user._id].backline > 0
                              ? ((userProgress[user._id].tasks /
                                userProgress[user._id].backline) * 100).toFixed(0)
                              : 0
                              }%`}
                            styles={buildStyles({
                              textSize: "24px",
                              pathColor: "green",
                              trailColor: "yellow",
                              textColor: "green",
                            })}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {userProgress[user._id].tasks}/{userProgress[user._id].backline}
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        onClick={() => openReportPopup(user)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 transition cursor-pointer"
                        title="View Reports"
                      >
                        <FileText size={18} />
                        <span className="text-sm font-medium">Reports</span>
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 transition cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-2 bg-gray-100 rounded-lg text-center mb-4 mt-4">
          <h1 className="text-xl font-bold text-gray-800">
            Total -{" "}
            <span className="text-green-700 font-semibold">
              ₹{Object.values(projectCosts).reduce((acc, cost) => acc + cost, 0)}
            </span>
          </h1>
        </div>
      </div>



      {/* Report Modal */}
      <AnimatePresence>
        {selectedUser && showReportPopup && (
          <motion.div
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-full max-w-5xl relative shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={closePopup}
              >
                <X />
              </button>

              <h3 className="text-xl font-semibold mb-4">
                Reports for {selectedUser.name}
              </h3>

              {reportLoading ? (
                <p>Loading reports...</p>
              ) : reports.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-12">
                  No reports submitted.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full border border-gray-200 text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 border-b">Project Name</th>
                        <th className="px-4 py-2 border-b">Task No.</th>
                        <th className="px-4 py-2 border-b">Work Type</th>
                        <th className="px-4 py-2 border-b">Work Description</th>
                        <th className="px-4 py-2 border-b">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report, index) => (
                        <motion.tr
                          key={index}
                          className="hover:bg-gray-50 transition"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-4 py-2 border-b font-medium">
                            {report.projectName || "Untitled"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {report.taskNumber || "N/A"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {report.workType || "N/A"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {report.workDescription || "N/A"}
                          </td>
                          <td className="px-4 py-2 border-b text-xs text-gray-500">
                            {report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                              : "N/A"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assigned Projects Modal */}
      <AnimatePresence>
        {selectedUser && showProjectsPopup && (
          <motion.div
            className="fixed inset-0 bg-black/70  flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            pointer
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl h-auto w-full  max-w-6xl  relative shadow-2xl border border-gray-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition cursor-pointer"
                onClick={closePopup}
              >
                <X />
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Users className="text-green-600" size={20} />
                Assigned Projects for {selectedUser.name}
                {totalCost > 0 && (
                  <span className="text-green-700 font-semibold">
                    (Total Rating: {totalCost.toFixed(2)})

                  </span>

                )}
                <span className="ml-2 text-blue-600 font-semibold">
                  {userTotals.tasks}/{userTotals.backline}
                  {" "}
                </span>
                <div className="w-14 h-14 ml-3">
                  <CircularProgressbar
                    value={
                      userTotals.backline > 0
                        ? (userTotals.tasks / userTotals.backline) * 100
                        : 0
                    }
                    text={`${userTotals.backline > 0
                      ? ((userTotals.tasks / userTotals.backline) * 100).toFixed(0)
                      : 0
                      }%`}
                    styles={buildStyles({
                      textSize: "24px",
                      pathColor: "green",
                      trailColor: "yellow",
                      textColor: "green",
                    })}
                  />
                </div>
              </h3>

              {assignedProjects.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No projects assigned.
                </div>
              ) : (
                <ul className="pl-1 pr-2 md:mt-10 overflow-y-auto space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {assignedProjects.filter((project) => !project.paused).map((project, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 hover:bg-green-50 transition text-sm text-gray-800 shadow-sm"
                    >
                      <span className="text-green-600">
                        <FileText size={16} />
                      </span>
                      <Link to="/todayReport" className="cursor-pointer">
                        <span>{project.name || " "}</span>
                      </Link>
                      {project.costing?.$numberDecimal && (
                        <span className="text-green-700 font-semibold">
                          {(Number(project.costing.$numberDecimal) / (project.assignedUsers?.length || 1)).toFixed(2)}
                        </span>
                      )}

                      {/* <span className="text-blue-500">{project.backline}BL</span>
                        {taskCounts[project._id] !== undefined && (
                          <span className="text-blue-500">
                            {taskCounts[project._id]}EB
                          </span>
                        )} */}
                      <span className="px-6">
                        {taskCounts[project._id] || 0}/{project.backline}
                      </span>
                      <span className="px-6">
                        {((taskCounts[project._id] || 0) / project.backline * 100).toFixed(2)}%
                      </span>
                      <div className="w-12 h-12 flex-shrink-0">
                        <CircularProgressbar
                          value={((taskCounts[project._id] || 0) / project.backline) * 100}
                          text={`${(((taskCounts[project._id] || 0) / project.backline) * 100).toFixed(0)}%`}
                          styles={buildStyles({
                            textSize: "28px",
                            pathColor: "green",
                            trailColor: "yellow",
                            textColor: "green",
                          })}
                        />
                      </div>

                      <button
                        className="text-red-500 hover:text-red-700 cursor-pointer px-6"
                        onClick={() =>
                          handleDelete(project._id, selectedUser._id)
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="top-right" />
    </>
  );
};
