import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminNav from "./AdminNav";
import axiosInstance from "../../axiosInstance";
import moment from "moment";
import UserNav from "../UserNav";

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const [groupedReports, setGroupedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [workCounts, setWorkCounts] = useState({});
  const [assignedBackline, setAssignedBackline] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [nonWorkingDays, setNonWorkingDays] = useState(0);
  const [uniqueDates, setUniqueDates] = useState([]);

  const workTypes = [
    "Profile Submission",
    "Article Submission",
    "Directory Submission",
    "Ranking update",
    "Bookmarking",
    "Blog Submission",
    "Image Submission",
    "Classified Submission",
    "GMB Services",
    "GMB Products",
    "GMB Add Update",
    "GMB Other",
    "GMB Posting",
    "GMB Creation",
    "Creative Designing",
    "Phone Number",
  ];
  useEffect(() => {
    if (uniqueDates.length > 1) {
      const sortedDates = uniqueDates
        .map((d) => moment(d, "DD/MM/YYYY"))
        .sort((a, b) => a - b);

      const firstDate = sortedDates[0];
      const lastDate = sortedDates[sortedDates.length - 1];
      const totalDays = lastDate.diff(firstDate, "days") + 1;

      setWorkingDays(uniqueDates.length);
      setNonWorkingDays(totalDays - uniqueDates.length);
    } else {
      setWorkingDays(uniqueDates.length);
      setNonWorkingDays(0);
    }
  }, [uniqueDates]);
  const role = localStorage.getItem("role");
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/v2/user/report/details/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // if (res.data.length > 0) {
        //   setProjectName(res.data[0].projectName);
        // }
        // if (res.data.length > 0) {
        //   setProjectName(res.data[0].projectName);
        //   setAssignedBackline(res.data[0].projectId?.backline || 0);
        // }
        // console.log(res.data);

        // const allReports = res.data.flatMap((entry) =>
        //   entry.reports.map((report) => ({
        //     ...report,
        //     createdAt: entry.createdAt,
        //   }))
        // );
        const { project, reports } = res.data;

        setProjectName(project?.name || "");
        setAssignedBackline(project?.backline || 0);

        // console.log("Reports:", reports);

        // flatten monthly reports
        const allReports = reports.flatMap((entry) =>
          entry.reports.map((report) => ({
            ...report,
            createdAt: entry.createdAt,
          }))
        );

        const counts = {};
        allReports.forEach((report) => {
          const type = report.workType;
          const taskNum = parseInt(report.taskNumber) || 0;
          counts[type] = (counts[type] || 0) + taskNum;
        });
        setWorkCounts(counts);

        const grouped = {};
        allReports.forEach((report) => {
          const formattedDate = moment(report.createdAt).format("DD/MM/YYYY");
          if (!grouped[formattedDate]) grouped[formattedDate] = [];
          grouped[formattedDate].push(report);
        });
        setUniqueDates(Object.keys(grouped));

        const formattedData = Object.entries(grouped).map(
          ([submittedAt, reports], idx) => {
            const workSummaryMap = {};

            reports.forEach((r) => {
              const key = `${r.workType}|${r.workDescription || ""}`;
              if (!workSummaryMap[key]) {
                workSummaryMap[key] = {
                  taskNumber: 0,
                  workType: r.workType,
                  workDescription: r.workDescription,
                };
              }
              workSummaryMap[key].taskNumber += parseInt(r.taskNumber);
            });

            const workDetails = Object.values(workSummaryMap)
              .map(
                (entry) =>
                  `${entry.taskNumber} ${entry.workType}${entry.workDescription ? ` – ${entry.workDescription}` : ""
                  }`
              )
              .join(" | ");

            return {
              id: idx + 1,
              submittedAt,
              workDetails,
            };
          }
        );

        setGroupedReports(formattedData);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setGroupedReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [projectId]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      {role === "admin" ? <AdminNav /> : <UserNav />}


      <motion.div
        className="max-w-6xl mx-auto mt-12 md:mt-20 p-6 bg-white shadow-lg rounded-xl border border-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold mb-6 text-green-700">
          Project Work Reports –{" "}
          <span className="text-green-900">{projectName}</span>
        </h2>

        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Overall Activity Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border px-4 py-2">Activity</th>
                  <th className="border px-4 py-2">Assigned</th>
                  <th className="border px-4 py-2">Executed</th>
                </tr>
              </thead>
              <tbody>
                {workTypes.map((type, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition duration-150"
                  >
                    <td className="border px-4 py-2 font-medium">{type}</td>
                    <td className="border px-4 py-2 text-center text-blue-600 font-semibold">
                      –
                    </td>
                    <td className="border px-4 py-2 text-center text-green-700">
                      {workCounts[type] || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-100 font-semibold text-gray-800">
                  <th className="border px-4 py-2 text-left">Project</th>
                  <th className="border px-4 py-2 text-center">Working Days</th>
                  <th className="border px-4 py-2 text-center">
                    Non-Working Days
                  </th>
                </tr>
                <tr className="bg-green-50 font-medium text-gray-900">
                  <td className="border px-4 py-2">{projectName}</td>
                  <td className="border px-4 py-2 text-center">
                    {workingDays}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {nonWorkingDays}
                  </td>
                </tr>
              </tfoot>

              <tfoot>
                <tr className="bg-green-50 font-semibold text-gray-800">
                  <td className="border px-4 py-2">Total</td>
                  <td className="border px-4 py-2 text-center">
                    {assignedBackline}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {Object.values(workCounts).reduce(
                      (acc, val) => acc + val,
                      0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            📅 Daily Work Breakdown
          </h3>

          {groupedReports.length === 0 ? (
            <p className="text-red-500 text-sm">
              No reports found for this project.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm shadow-sm">
                <thead className="bg-green-100 text-gray-800">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Submitted At</th>
                    <th className="px-4 py-2 border">Work Details</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedReports.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{
                        scale: 1.015,
                        backgroundColor: "#ecfdf5",
                        transition: { duration: 0.2 },
                      }}
                      className="border-b"
                    >
                      <td className="px-4 py-2 border text-center">{row.id}</td>
                      <td className="px-4 py-2 border text-center text-gray-700">
                        {row.submittedAt}
                      </td>
                      <td className="px-4 py-2 border whitespace-pre-wrap text-gray-800">
                        {row.workDetails}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ProjectDetails;
