import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminNav from "./AdminNav";
import axiosInstance from "../../axiosInstance";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const TodayReport = () => {
  const [usersWithReports, setUsersWithReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/v1/admin/reports/today", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Today's Reports:", res.data);
        setUsersWithReports(res.data || []);
      } catch (err) {
        console.error("Failed to fetch today's reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <>
      <AdminNav />
      <div className="md:mt-20 min-h-screen bg-gradient-to-br from-green-50 to-green-300 w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center text-green-700 mb-10"
          >
            📋 Today's Project Report
          </motion.h1>

          {loading ? (
            <p className="text-center text-green-600 mt-10">
              Loading today's reports...
            </p>
          ) : usersWithReports.length === 0 ? (
            <p className="text-center text-green-600 mt-10">
              No data available.
            </p>
          ) : (
            usersWithReports.map((userReport, userIndex) => (
              <motion.div
                key={userIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: userIndex * 0.2 }}
                className="mb-12 bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  👤 {userReport.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  ✅ Today Backlinks :{" "}
                  {userReport.reports
                    .filter(
                      (r) => r.taskNumber !== null && !isNaN(r.taskNumber)
                    )
                    .reduce((sum, r) => sum + Number(r.taskNumber), 0)}
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-green-700 bg-green-100 rounded-lg">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-0">Project Name</th>
                        <th className="py-3 px-0">Sheet URL</th>
                        <th className="py-3 px-20">Work Details</th>

                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        userReport.reports.reduce((acc, report) => {
                          const projectName = report.project?.name || "Unnamed Project";
                          const projectUrl = report.project?.url || "";
                          const projectId = report.project?._id || "";

                          if (!acc[projectName]) {
                            acc[projectName] = { id: projectId, url: projectUrl, details: [] };
                          }

                          acc[projectName].details.push(
                            `${report.taskNumber || ""} ${report.workType || ""}${report.workDescription ? ` – ${report.workDescription}` : ""
                            }`
                          );

                          return acc;
                        }, {})
                      ).map(([projectName, { id, url, details }], index) => (
                        <tr
                          key={index}
                          className="bg-gray-50 hover:bg-green-50 rounded-lg transition"
                        >
                          <td className="py-2 px-4 font-semibold">{index + 1}</td>
                          <td className="py-2 px-0">
                            <Link to={`/projectDetails/${id}`} className="hover:underline">
                              {projectName}
                            </Link>
                          </td>
                          <td className="py-2 px-4 text-center">
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800"
                              >
                                <FaExternalLinkAlt size={18} />
                              </a>
                            ) : null}
                          </td>
                          <td className="py-2 px-20 text-gray-700">{details.join(" | ")}</td>
                        </tr>
                      ))}


                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default TodayReport;
