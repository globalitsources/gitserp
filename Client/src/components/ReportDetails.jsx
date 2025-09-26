import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import UserNav from "./UserNav";
import { motion } from "framer-motion";

const ReportDetails = () => {
  const { projectId, userId } = useParams();
  const [reportsGroupedByDate, setReportsGroupedByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/v2/user/report/${projectId}/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log("Fetched Reports:", res.data);
        const allReports = res.data.flatMap((entry) =>
          entry.reports.map((report) => ({
            ...report,
            createdAt: new Date(entry.createdAt),
            dateKey: new Date(entry.createdAt).toISOString().split("T")[0],
            projectName: entry.projectName,
          }))
        );

        const grouped = allReports.reduce((acc, report) => {
          const key = `${report.dateKey}__${report.projectName}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(report);
          return acc;
        }, {});

        setReportsGroupedByDate(grouped);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setReportsGroupedByDate({});
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [projectId, userId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const dates = Object.keys(reportsGroupedByDate).sort().reverse();

  return (
    <>
      <UserNav />
      <motion.div
        className="max-w-5xl mx-auto mt-8 md:mt-22 p-6 bg-white shadow rounded"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-6 text-green-700">
          Report Details for Project
        </h2>

        {dates.length === 0 ? (
          <p className="text-red-500">No reports found for this project.</p>
        ) : (
          <table className="table-auto w-full border text-sm">
            <thead className="bg-green-100 text-left">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Works</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(reportsGroupedByDate).map(
                ([key, reports], index) => {
                  const [dateKey, projectName] = key.split("__");

                  const workTypeMap = {};
                  reports.forEach((r) => {
                    if (!workTypeMap[r.workType]) {
                      workTypeMap[r.workType] = {
                        taskNumber: 0,
                        descriptions: new Set(),
                      };
                    }
                    workTypeMap[r.workType].taskNumber += r.taskNumber;
                    if (r.workDescription) {
                      workTypeMap[r.workType].descriptions.add(
                        r.workDescription
                      );
                    }
                  });

                  const combinedWorks = Object.entries(workTypeMap)
                    .map(([workType, data]) => {
                      const desc = Array.from(data.descriptions).join(", ");
                      return `${data.taskNumber} ${workType}${
                        desc ? ` - ${desc}` : ""
                      }`;
                    })
                    .join(" | ");

                  return (
                    <motion.tr
                      key={key}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "#f0f8ff",
                        transition: { duration: 0.2 },
                      }}
                      className="border-t"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        {new Date(dateKey).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-2">{projectName}</td>
                      <td className="px-4 py-2">{combinedWorks}</td>
                    </motion.tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </>
  );
};

export default ReportDetails;
