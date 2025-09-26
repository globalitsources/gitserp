import React, { useState, useEffect } from "react";
import AdminNav from "./AdminNav";
import axiosInstance from "../../axiosInstance";
import { motion } from "framer-motion";
import moment from "moment";


const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    },
  }),
};

const AdminReport = () => {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));



  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get("/v1/admin/reports");
        setAllReports(res.data);
        setFilteredReports(res.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const filtered = allReports.filter((report) => {
      const projectName = report.projectName?.toLowerCase() || "";
      const matchesText = projectName.includes(searchQuery.toLowerCase());
      const reportDate = new Date(report.createdAt).toISOString().split("T")[0];
      const matchesDate = selectedDate ? reportDate === selectedDate : true;
      return matchesText && matchesDate;
    });
    setFilteredReports(filtered);
    setCurrentPage(1); // reset to first page on filter change
  }, [searchQuery, selectedDate, allReports]);

  // ---- Grouping logic (kept same) ----
  const groupedReports = Object.entries(
    filteredReports.reduce((acc, report) => {
      const key = `${report.projectName}-${new Date(report.createdAt).toISOString().split("T")[0]
        }`;
      if (!acc[key]) {
        acc[key] = {
          projectName: report.projectName,
          createdAt: report.createdAt,
          reports: [],
        };
      }
      acc[key].reports.push(...(report.reports || []));
      return acc;
    }, {})
  );


  const totalPages = Math.ceil(groupedReports.length / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = groupedReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-green-50 px-4 py-10 md:mt-8">
        <motion.div
          className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6"
          initial="hidden"
          animate="visible"
          variants={fadeVariant}
        >
          <motion.h2
            className="text-2xl font-semibold text-green-600 mb-6 text-center"
            variants={fadeVariant}
            custom={0}
          >
            Project Reports (Filter by Project / Date)
          </motion.h2>

          {/* Search + Date filter */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 mb-6"
            variants={fadeVariant}
            custom={1}
          >
            <motion.input
              type="text"
              placeholder="Search by project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>

          {/* Reports table */}
          <motion.div
            className="overflow-x-auto"
            initial="hidden"
            animate="visible"
            variants={fadeVariant}
            custom={2}
          >
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Work Details</th>
                  <th className="py-3 px-2">Time</th>
                  <th className="py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.length > 0 ? (
                  currentReports.map(([key, grouped], index) => (
                    <motion.tr
                      key={key}
                      className="border-b hover:bg-gray-100 transition duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-3 px-4 font-medium">
                        {indexOfFirstReport + index + 1}
                      </td>
                      <td className="py-3 px-4">{grouped.projectName}</td>
                      <td className="py-3 px-4">
                        {grouped.reports.length > 0 ? (
                          grouped.reports.map((detail, i) => (
                            <span key={i}>
                              {detail.taskNumber} {detail.workType}
                              {detail.workDescription
                                ? ` - ${detail.workDescription}`
                                : ""}
                              {i !== grouped.reports.length - 1 ? " | " : ""}
                            </span>
                          ))
                        ) : (
                          <span className="italic text-gray-500">
                            No details available
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {new Date(grouped.createdAt).toLocaleTimeString(
                          "en-GB",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {new Date(grouped.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td
                      colSpan="6"
                      className="py-12 px-4 text-2xl text-center text-gray-500"
                    >
                      No matching reports found.
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg bg-green-100 hover:bg-green-200 disabled:opacity-50 cursor-pointer"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 border rounded-lg cursor-pointer ${currentPage === i + 1
                    ? "bg-green-500 text-white"
                    : "bg-green-100 hover:bg-green-200"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg bg-green-100 hover:bg-green-200 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AdminReport;
