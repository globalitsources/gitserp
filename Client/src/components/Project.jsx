import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../axiosInstance";
import { Link } from "react-router-dom";
import { FileText, LinkIcon, MessageCircle } from "lucide-react";
import moment from "moment";
import { FaCalendarAlt } from "react-icons/fa";
import UserNav from "./UserNav";
import Swal from "sweetalert2";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const addDaysSkippingSundays = (date, daysToAdd) => {
  let result = moment(date);
  let added = 0;

  while (added < daysToAdd) {
    result = result.add(1, "day");
    if (result.day() !== 0) {
      added++;
    }
  }
  return result;
};

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [queries, setQueries] = useState([]);
  const [isHolidayOpen, setIsHolidayOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);


  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    const userId = getUserIdFromToken();

    try {
      await axiosInstance.post("/v2/user/create", {
        userId,
        message: queryText,
      });

      // console.log("Query Submitted:", queryText);
      setIsQueryOpen(false);
      setQueryText("");
      fetchUserQueries();
    } catch (err) {
      console.error("Error submitting query:", err);
    }
  };

  const fetchUserQueries = async () => {
    try {
      const res = await axiosInstance.get(`/v2/user/${userId}`);
      setQueries(res.data || []);
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
  };
  const fetchHolidays = async () => {
    try {
      const res = await axiosInstance.get("v3/attendance/allHoliday");
      setHolidays(res.data || []);
      console.log(res.data, "holidays");
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setHolidays([]);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.id || payload.sub;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };
  const userId = getUserIdFromToken();
  useEffect(() => {
    if (projects.length > 0 && allReports.length > 0) {
      checkRankingUpdates(allReports);
    }
  }, [projects, allReports]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.post("/v2/user/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(res.data, "projects dev");
        const uniqueProjectsMap = new Map();
        res.data.forEach((project) => {
          if (!uniqueProjectsMap.has(project.name)) {
            uniqueProjectsMap.set(project.name, project);
          }
        });

        setProjects(
          Array.from(uniqueProjectsMap.values()).filter(
            (p) => p.name && p.name.trim() !== "" && p.name !== "Unnamed"
          )
        );

        // console.log(res);
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get("/v1/admin/reports");
        setAllReports(res.data || []);
        // console.log("report", res.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchProjects();
    fetchReports();
    fetchUserQueries();
    fetchHolidays();
  }, []);

  const getExecutedBacklinks = (projectId) => {
    const projectReports = allReports.filter(
      (report) =>
        report.projectId &&
        (report.projectId._id === projectId ||
          report.projectId === projectId) &&
        report.userId &&
        (report.userId._id === userId || report.userId === userId)
    );

    let total = 0;
    for (const report of projectReports) {
      if (Array.isArray(report.reports)) {
        total += report.reports.reduce(
          (sum, r) => sum + (r.taskNumber || 0),
          0
        );
      } else if (report.taskNumber) {
        total += report.taskNumber;
      }
    }

    return total;
  };

  // const checkRankingUpdates = (reports) => {
  //   projects.forEach((project) => {

  //     const projectReports = reports.filter(
  //       (r) =>
  //         (r.projectId?._id === project._id ||
  //           r.projectId === project._id ||
  //           r.projectName === project.name) &&
  //         r.userId &&
  //         (r.userId._id === userId || r.userId === userId)
  //     );

  //     let rankingUpdates = [];
  //     projectReports.forEach((r) => {
  //       if (Array.isArray(r.reports)) {
  //         rankingUpdates.push(
  //           ...r.reports
  //             .filter((rep) => rep.workType?.toLowerCase() == "ranking update")
  //             .map((rep) => ({ ...rep, createdAt: r.createdAt }))
  //         );
  //       }
  //     });

  //     const key = `rankingAlert_${project._id || project.id || project.name}`;
  //     let count = parseInt(localStorage.getItem(key) || "0", 10);

  //     if (rankingUpdates.length === 0) {
  //       if (count < 3) {
  //         Swal.fire({
  //           icon: "error",
  //           title: "Ranking Update Missing",
  //           html: `<b>${project.name}</b><br/>
  //                No Ranking Update has been submitted yet.<br/>
  //                Please submit a Ranking Update report.`,
  //           confirmButtonColor: "#d33",
  //         });
  //         localStorage.setItem(key, count + 1);
  //       }
  //       return;
  //     }
  //     const lastUpdate = moment(
  //       rankingUpdates[rankingUpdates.length - 1].createdAt
  //     ).tz("Asia/Kolkata");

  //     const nextDue = addDaysSkippingSundays(lastUpdate, 7);
  //     const now = moment().tz("Asia/Kolkata");

  //     if (now.isSameOrAfter(nextDue, "day")) {
  //       if (count < 3) {
  //         Swal.fire({
  //           icon: "warning",
  //           title: "Ranking Update Due",
  //           html: `<b>${project.name}</b><br/>
  //                Last update: ${lastUpdate.format("DD/MM/YYYY")}<br/>
  //                Next update due: ${nextDue.format("DD/MM/YYYY")}`,
  //           confirmButtonColor: "#16a34a",
  //         });
  //         localStorage.setItem(key, count + 1);
  //       }
  //     }
  //   });
  // };
  const checkRankingUpdates = (reports) => {
    const projectsToAlert = [];

    projects.forEach((project) => {
      const projectReports = reports.filter(
        (r) =>
          (r.projectId?._id === project._id ||
            r.projectId === project._id ||
            r.projectName === project.name) &&
          r.userId &&
          (r.userId._id === userId || r.userId === userId)
      );

      let rankingUpdates = [];
      projectReports.forEach((r) => {
        if (Array.isArray(r.reports)) {
          rankingUpdates.push(
            ...r.reports
              .filter((rep) => rep.workType?.toLowerCase() === "ranking update")
              .map((rep) => ({ ...rep, createdAt: r.createdAt }))
          );
        }
      });

      const key = `rankingAlert_${project._id || project.id || project.name}`;
      const lastAlert = JSON.parse(localStorage.getItem(key)) || {};

      // Clear old alerts after 3 days
      if (lastAlert.date && moment().diff(moment(lastAlert.date), "days") >= 3) {
        localStorage.removeItem(key);
      }

      if (rankingUpdates.length === 0) {
        if (!lastAlert.count || lastAlert.count < 3) {
          projectsToAlert.push({
            project,
            type: "missing",
          });
          localStorage.setItem(
            key,
            JSON.stringify({ count: (lastAlert.count || 0) + 1, date: new Date() })
          );
        }
        return;
      }

      const lastUpdate = moment(rankingUpdates[rankingUpdates.length - 1].createdAt);
      const nextDue = addDaysSkippingSundays(lastUpdate, 7);
      const now = moment();

      if (now.isSameOrAfter(nextDue, "day")) {
        if (!lastAlert.count || lastAlert.count < 3) {
          projectsToAlert.push({
            project,
            type: "due",
            lastUpdate,
            nextDue,
          });
          localStorage.setItem(
            key,
            JSON.stringify({ count: (lastAlert.count || 0) + 1, date: new Date() })
          );
        }
      }
    });

    // Show a single alert for all projects
    if (projectsToAlert.length > 0) {
      const missingProjects = projectsToAlert
        .filter((p) => p.type === "missing")
        .map((p) => `❌ ${p.project.name}`)
        .join("<br/>");
      const dueProjects = projectsToAlert
        .filter((p) => p.type === "due")
        .map(
          (p) =>
            `⚠️ ${p.project.name} (Last: ${p.lastUpdate.format(
              "DD/MM/YYYY"
            )}, Due: ${p.nextDue.format("DD/MM/YYYY")})`
        )
        .join("<br/>");

      Swal.fire({
        icon: "warning",
        title: "Ranking Updates Reminder",
        html: [missingProjects, dueProjects].filter(Boolean).join("<br/><br/>"),
        confirmButtonColor: "#16a34a",
      });
    }
  };


  return (
    <>
      <UserNav />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" bg-gradient-to-br from-white to-green-200 min-h-screen overflow-x-hidden"
      >

        <div className="flex justify-end gap-4 px-4 py-4">
          <motion.button
            onClick={() => {
              fetchHolidays();
              setIsHolidayOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-6 py-2.5 rounded-full font-semibold text-white  bg-gradient-to-r from-green-500 to-green-700  shadow-lg hover:shadow-xl transition duration-300  flex items-center gap-2 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5" />
              View Holiday
            </span>

            <span className="absolute inset-0 bg-white opacity-10 blur-lg rounded-full"></span>
          </motion.button>


          <motion.button
            onClick={() => setIsQueryOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-6 py-2.5 rounded-full font-semibold text-white 
      bg-gradient-to-r from-green-500 to-green-700 
      shadow-lg hover:shadow-xl transition duration-300 
      flex items-center gap-2 overflow-hidden cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Query ?</span>
            <span className="absolute inset-0 bg-white opacity-10 blur-lg rounded-full"></span>
          </motion.button>
        </div>
        <AnimatePresence>
          {isHolidayOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg w-[420px] p-6 max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
                  📅 Holiday List
                </h2>

                {holidays.length === 0 ? (
                  <p className="text-gray-500 text-center">No holidays found.</p>
                ) : (
                  <ul className="space-y-4">
                    {/* 🔹 Upcoming Holidays */}
                    {holidays
                      .slice()
                      .sort((a, b) => new Date(a.from) - new Date(b.from))
                      .filter(
                        (h) =>
                          moment(h.from).isAfter(moment(), "day") ||
                          moment(h.from).isSame(moment(), "day")
                      ).length > 0 && (
                        <h3 className="text-lg font-bold text-green-700 mt-2">Upcoming Holidays</h3>
                      )}

                    {holidays
                      .slice()
                      .sort((a, b) => new Date(a.from) - new Date(b.from))
                      .filter(
                        (h) =>
                          moment(h.from).isAfter(moment(), "day") ||
                          moment(h.from).isSame(moment(), "day")
                      )
                      .map((h) => {
                        const sameDay =
                          moment(h.from).format("DD MMM YYYY") ===
                          moment(h.to).format("DD MMM YYYY");

                        return (
                          <motion.li
                            key={h._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.03 }}
                            className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-green-50 border-green-200"
                          >
                            <div>
                              <span className="font-semibold text-gray-800 flex items-center gap-2">
                                🎉 {h.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {sameDay
                                  ? moment(h.from).format("DD MMM YYYY")
                                  : `${moment(h.from).format("DD MMM YYYY")} → ${moment(
                                    h.to
                                  ).format("DD MMM YYYY")}`}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              Upcoming
                            </span>
                          </motion.li>
                        );
                      })}

                    {/* 🔹 Past Holidays */}
                    {holidays
                      .slice()
                      .sort((a, b) => new Date(b.from) - new Date(a.from))
                      .filter((h) => moment(h.from).isBefore(moment(), "day")).length > 0 && (
                        <h3 className="text-lg font-bold text-red-600 mt-6">Past Holidays</h3>
                      )}

                    {holidays
                      .slice()
                      .sort((a, b) => new Date(b.from) - new Date(a.from))
                      .filter((h) => moment(h.from).isBefore(moment(), "day"))
                      .map((h) => {
                        const sameDay =
                          moment(h.from).format("DD MMM YYYY") ===
                          moment(h.to).format("DD MMM YYYY");

                        return (
                          <motion.li
                            key={h._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.03 }}
                            className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-gray-50 border-gray-200"
                          >
                            <div>
                              <span className="font-semibold text-gray-800 flex items-center gap-2">
                                🎉 {h.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {sameDay
                                  ? moment(h.from).format("DD MMM YYYY")
                                  : `${moment(h.from).format("DD MMM YYYY")} → ${moment(
                                    h.to
                                  ).format("DD MMM YYYY")}`}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                              Expired
                            </span>
                          </motion.li>
                        );
                      })}
                  </ul>

                )}

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setIsHolidayOpen(false)}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Popup Modal */}
        <AnimatePresence>
          {isQueryOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg w-96 p-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-green-700">Submit Query</h2>
                <form onSubmit={handleQuerySubmit}>
                  <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Type your query here..."
                    className="w-full h-32 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQueryOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          whileHover={{ scaleY: 1.01 }}
          className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">
            Total Assigned Projects – {projects.length}
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-lg scrollbar-hide">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-2">Project Name</th>
                  <th className="py-3 px-2 text-center">Sheet Url</th>
                  <th className="py-3 text-center">Assigned</th>
                  <th className="py-3 text-center">Executed Backlinks</th>
                  <th className="py-3 text-center">Progress</th>
                  <th className="py-3 text-center">Monthly Report Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const executedBacklinks = getExecutedBacklinks(project.id);

                  return (
                    <motion.tr
                      key={project.id}
                      whileHover={{ backgroundColor: "#eef2ff" }}
                      transition={{ duration: 0.3 }}
                      className="border-b bg-white"
                    >
                      <td className="py-3 px-6 font-semibold">
                        <Link
                          to={`/projectDetails/${project.id}`}
                          className="hover:text-green-600 transition"
                        >
                          {index + 1}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          to={`/projectDetails/${project.id}`}
                          className="text-green-700 font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-3 px-0 text-center  justify-center">
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Sheet"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <LinkIcon className="w-5 h-5 inline" />
                          </a>
                        )}
                      </td>

                      <td className="py-3  text-center">
                        {project.backline || 0}
                      </td>
                      <td className="py-3  text-center text-green-700 font-semibold">
                        {executedBacklinks}
                      </td>
                      {/* <td className="py-3 text-center">
                        {project.monthlyReport
                          ? moment.utc(project.monthlyReport).format("DD/MM/YYYY")
                          : ""}
                      </td> */}
                      <td className="py-3 text-center">
                        <div className="w-12 h-12 mx-auto">
                          <CircularProgressbar
                            value={((executedBacklinks || 0) / (project.backline || 1)) * 100}
                            text={`${(
                              ((executedBacklinks || 0) / (project.backline || 1)) *
                              100
                            ).toFixed(0)}%`}
                            styles={buildStyles({
                              textSize: "28px",
                              pathColor: "green", // green
                              trailColor: "yellow", // gray
                              textColor: "#15803d", // dark green
                            })}
                          />
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {project.monthlyReport
                          ? moment(project.monthlyReport, "DD/MM/YYYY").format("DD/MM/YYYY")
                          : ""}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-10 mb-4 ">
          <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Your Queries
          </h3>

          {queries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 text-gray-600 py-6 text-center rounded-xl shadow-inner"
            >
              No queries submitted yet.
            </motion.div>
          ) : (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {queries.map((q, idx) => (
                <motion.li
                  key={q._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition flex justify-between items-start gap-4"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{q.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moment(q.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-1 text-sm font-semibold rounded-full ${q.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                      }`}
                  >
                    {q.status}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </motion.div>

    </>
  );
};

export default Project;