// import React, { useEffect, useState } from "react";
// import AdminNav from "../Admin/AdminNav";
// import axiosInstance from "../../axiosInstance";
// import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import moment from "moment";
// import { FaCalendarAlt, FaPlus } from "react-icons/fa";

// const AdminAttendance = () => {
//   const [attendances, setAttendances] = useState([]);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [isHolidayModalOpen, setHolidayModalOpen] = useState(false);
//   const [holidayName, setHolidayName] = useState("");
//   const [holidayFrom, setHolidayFrom] = useState("");
//   const [holidayTo, setHolidayTo] = useState("");
//   const [isHolidayOpen, setIsHolidayOpen] = useState(false);
//   const [holidays, setHolidays] = useState([]);

//   const fetchAttendance = async (date = "") => {
//     try {
//       const endpoint = date
//         ? `/v3/attendance/allAttendance?date=${date}`
//         : "/v3/attendance/allAttendance";

//       const response = await axiosInstance.get(endpoint);
//       setAttendances(response.data);
//     } catch (error) {
//       console.error("Error fetching attendance:", error);
//     }
//   };
//   const fetchHolidays = async () => {
//     try {
//       const res = await axiosInstance.get("/v3/attendance/allHoliday");
//       setHolidays(res.data);
//     } catch (err) {
//       console.error("Error fetching holidays:", err);
//     }
//   };
//   useEffect(() => {
//     const today = new Date().toISOString().split("T")[0];
//     setSelectedDate(today);
//     fetchAttendance(today);
//     fetchHolidays();
//   }, []);

//   const handleDateChange = (e) => {
//     const selected = e.target.value;
//     setSelectedDate(selected);
//     fetchAttendance(selected);
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "-";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-GB");
//   };

//   const handleSaveHoliday = async () => {
//     if (!holidayFrom || !holidayTo || !holidayName) {
//       toast.warning("⚠️ Please fill all fields before saving");
//       return;
//     }


//     if (holidayTo < holidayFrom) {
//       toast.error("❌ 'To Date' cannot be earlier than 'From Date'");
//       return;
//     }

//     try {
//       await axiosInstance.post("/v3/attendance/addHoliday", {
//         from: format(holidayFrom, "dd/MM/yyyy"),
//         to: format(holidayTo, "dd/MM/yyyy"),
//         name: holidayName,
//       });

//       setHolidayModalOpen(false);
//       setHolidayFrom(null);
//       setHolidayTo(null);
//       setHolidayName("");

//       toast.success("🎉 Holiday added successfully!");
//     } catch (err) {
//       console.error("Error adding holiday:", err);
//       toast.error("❌ Failed to add holiday");
//     }
//   };



//   const containerVariants = {
//     hidden: { opacity: 0, y: 10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         staggerChildren: 0.05,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const rowVariants = {
//     hidden: { opacity: 0, y: 5 },
//     visible: { opacity: 1, y: 0 },
//   };

//   return (
//     <>
//       <AdminNav />
//       <motion.div
//         className="mt-15 px-4 md:px-8 py-10"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.div
//           className="mb-6 flex flex-col md:flex-row md:justify-center gap-6 md:items-center"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <h1 className="text-2xl text-center font-bold mb-4 md:mb-0 text-green-800">
//             All Attendance Records
//           </h1>
//           <motion.input
//             type="date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             className="border rounded px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300 transition"
//             whileFocus={{ scale: 1.03 }}
//           />
//           <span>
//             <button
//               className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer flex items-center gap-2"
//               onClick={() => setHolidayModalOpen(true)}
//             >
//               <FaPlus /> Add Holiday
//             </button>
//           </span>

//           <span>
//             <button
//               className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer flex items-center gap-2"
//               onClick={() => {
//                 fetchHolidays();
//                 setIsHolidayOpen(true);
//               }}
//             >
//               <FaCalendarAlt /> View Holiday
//             </button>
//           </span>

//         </motion.div>

//         <motion.div
//           className="overflow-x-auto bg-white shadow-md rounded-lg max-w-5xl mx-auto"
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           <table className="min-w-full table-auto border-collapse border border-green-300">
//             <thead className="bg-green-50 text-green-800">
//               <tr>
//                 <th className="border px-4 py-2 text-left">S.No</th>
//                 <th className="border px-4 py-2 text-left">User Name</th>
//                 <th className="border px-4 py-2 text-left">Date</th>
//                 <th className="border px-4 py-2 text-left">Time In</th>
//                 <th className="border px-4 py-2 text-left">Time Out</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendances.length > 0 ? (
//                 attendances.map((record, index) => (
//                   <motion.tr
//                     key={record._id || index}
//                     className="hover:bg-green-100 transition"
//                     variants={rowVariants}
//                   >
//                     <td className="border px-4 py-2 text-center">{index + 1}</td>
//                     <td className="border px-4 py-2">
//                       {record.userId ? (
//                         <Link to={`/attendance/${record.userId.userId}`}>
//                           {record.userId.name}
//                         </Link>
//                       ) : (
//                         <span>N/A</span>
//                       )}
//                     </td>
//                     <td className="border px-4 py-2">{formatDate(record.date)}</td>
//                     <td className="border px-4 py-2">
//                       {record.timeIn ? (
//                         record.timeIn
//                       ) : (
//                         <span className="text-red-500">Not Filled</span>
//                       )}
//                     </td>
//                     <td className="border px-4 py-2">
//                       {record.timeOut ? record.timeOut : "-"}
//                     </td>
//                   </motion.tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center py-6 text-green-500">
//                     No attendance records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </motion.div>
//       </motion.div>

//       {/* Holiday Modal */}
//       {isHolidayModalOpen && (
//         <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-96">
//             <h2 className="text-lg font-bold mb-4 text-center">Add Holiday</h2>

//             <div className="mb-4">
//               <label className="block mb-1 font-medium">From Date</label>
//               <DatePicker
//                 selected={holidayFrom}
//                 onChange={(date) => setHolidayFrom(date)}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="dd/mm/yyyy"
//                 minDate={new Date()}
//                 onKeyDown={(e) => e.preventDefault()}
//                 className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1 font-medium">To Date</label>
//               <DatePicker
//                 selected={holidayTo}
//                 onChange={(date) => setHolidayTo(date)}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="dd/mm/yyyy"
//                 minDate={holidayFrom || new Date()}
//                 onKeyDown={(e) => e.preventDefault()}
//                 className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1 font-medium">Holiday Name</label>
//               <input
//                 type="text"
//                 placeholder="Holiday Name"
//                 value={holidayName}
//                 onChange={(e) => setHolidayName(e.target.value)}
//                 className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//               />
//             </div>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setHolidayModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveHoliday}
//                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>

//       )}
//       <AnimatePresence>
//         {isHolidayOpen && (
//           <motion.div
//             className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white rounded-xl shadow-lg w-[420px] p-6 max-h-[80vh] overflow-y-auto"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
//                 📅 Holiday List
//               </h2>

//               {holidays.length === 0 ? (
//                 <p className="text-gray-500 text-center">No holidays found.</p>
//               ) : (
//                 <ul className="space-y-4">

//                   {holidays
//                     .slice()
//                     .sort((a, b) => new Date(a.from) - new Date(b.from))
//                     .filter(
//                       (h) =>
//                         moment(h.from).isAfter(moment(), "day") ||
//                         moment(h.from).isSame(moment(), "day")
//                     ).length > 0 && (
//                       <h3 className="text-lg font-bold text-green-700 mt-2">
//                         Upcoming Holidays
//                       </h3>
//                     )}

//                   {holidays
//                     .slice()
//                     .sort((a, b) => new Date(a.from) - new Date(b.from))
//                     .filter(
//                       (h) =>
//                         moment(h.from).isAfter(moment(), "day") ||
//                         moment(h.from).isSame(moment(), "day")
//                     )
//                     .map((h) => {
//                       const sameDay =
//                         moment(h.from).format("DD MMM YYYY") ===
//                         moment(h.to).format("DD MMM YYYY");

//                       return (
//                         <motion.li
//                           key={h._id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.3 }}
//                           whileHover={{ scale: 1.03 }}
//                           className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-green-50 border-green-200"
//                         >
//                           <div>
//                             <span className="font-semibold text-gray-800 flex items-center gap-2">
//                               🎉 {h.name}
//                             </span>
//                             <span className="text-sm text-gray-600">
//                               {sameDay
//                                 ? moment(h.from).format("DD MMM YYYY")
//                                 : `${moment(h.from).format("DD MMM YYYY")} → ${moment(
//                                   h.to
//                                 ).format("DD MMM YYYY")}`}
//                             </span>
//                           </div>
//                           <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
//                             Upcoming
//                           </span>
//                         </motion.li>
//                       );
//                     })}


//                   {holidays
//                     .slice()
//                     .sort((a, b) => new Date(b.from) - new Date(a.from))
//                     .filter((h) => moment(h.from).isBefore(moment(), "day"))
//                     .length > 0 && (
//                       <h3 className="text-lg font-bold text-red-600 mt-6">
//                         Past Holidays
//                       </h3>
//                     )}

//                   {holidays
//                     .slice()
//                     .sort((a, b) => new Date(b.from) - new Date(a.from))
//                     .filter((h) => moment(h.from).isBefore(moment(), "day"))
//                     .map((h) => {
//                       const sameDay =
//                         moment(h.from).format("DD MMM YYYY") ===
//                         moment(h.to).format("DD MMM YYYY");

//                       return (
//                         <motion.li
//                           key={h._id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.3 }}
//                           whileHover={{ scale: 1.03 }}
//                           className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-gray-50 border-gray-200"
//                         >
//                           <div>
//                             <span className="font-semibold text-gray-800 flex items-center gap-2">
//                               🎉 {h.name}
//                             </span>
//                             <span className="text-sm text-gray-600">
//                               {sameDay
//                                 ? moment(h.from).format("DD MMM YYYY")
//                                 : `${moment(h.from).format("DD MMM YYYY")} → ${moment(
//                                   h.to
//                                 ).format("DD MMM YYYY")}`}
//                             </span>
//                           </div>
//                           <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
//                             Expired
//                           </span>
//                         </motion.li>
//                       );
//                     })}
//                 </ul>
//               )}

//               <div className="flex justify-center mt-6">
//                 <button
//                   onClick={() => setIsHolidayOpen(false)}
//                   className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Toast Notifications */}
//       <ToastContainer position="top-right" autoClose={3000} />
//     </>
//   );
// };

// export default AdminAttendance;



import React, { useEffect, useState } from "react";
import AdminNav from "../Admin/AdminNav";
import axiosInstance from "../../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import moment from "moment";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";

const AdminAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isHolidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayFrom, setHolidayFrom] = useState("");
  const [holidayTo, setHolidayTo] = useState("");
  const [isHolidayOpen, setIsHolidayOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);

  const [presentMap, setPresentMap] = useState({});
  const formatMinutes = (mins) => {
    if (mins <= 0) return "0 min";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} hr${h > 1 ? "s" : ""} ${m > 0 ? `${m} min` : ""}`.trim();
    }
    return `${mins} min`;
  };
  const fetchAttendance = async (date = "") => {
    try {
      // 1. Call allAttendance (with or without date)
      const endpoint = date
        ? `/v3/attendance/allAttendance?date=${date}`
        : "/v3/attendance/allAttendance";

      const res = await axiosInstance.get(endpoint);
      const allData = res.data;
      setAttendances(allData);

      // 2. Extract userIds from allAttendance
      const userIds = [...new Set(allData.map(r => r.userId?.userId))];

      // 3. Fetch calculated presence for each user
      const results = await Promise.all(
        userIds.map(id =>
          axiosInstance
            .get(`/v3/attendance/attendanceById/${id}`)
            .then(res => {
              console.log("API Response for user:", id, res.data); // ✅ log here
              return { id, data: res.data };
            })
            .catch(err => {
              console.error("Error fetching attendanceById:", id, err);
              return { id, data: [] };
            })
        )
      );


      // 4. Build a map: { userId: present }
      // after fetching results
      const summaryMap = {};

      results.forEach(r => {
        let summary = { present: 0, halfday: 0, late: 0, absent: 0, totalMinus: 0, totalPlus: 0 };

        r.data.forEach(record => {
          if (record.status === "Absent" || record.status.toLowerCase().includes("absent")) {
            summary.absent++;
          } else if (record.statusMeta?.type === "halfday") {
            summary.halfday++;
          } else {
            summary.present++;
          }

          if (record.statusMeta?.type === "minus" || record.statusMeta?.type === "latecount") {
            summary.totalMinus += record.statusMeta.minutes || 0;
          }
          if (record.statusMeta?.type === "plus") {
            summary.totalPlus += record.statusMeta.minutes || 0;
          }
          if (record.statusMeta?.type === "latecount") {
            summary.late++;
          }
        });

        summaryMap[r.id] = summary;
      });

      setPresentMap(summaryMap);

    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };
  const fetchHolidays = async () => {
    try {
      const res = await axiosInstance.get("/v3/attendance/allHoliday");
      setHolidays(res.data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };
  useEffect(() => {
    // pick timezone (example: IST)
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    setSelectedDate(today);
    fetchAttendance(today);   // load today’s attendance by default
    fetchHolidays();          // load holiday list
  }, []);

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);
    fetchAttendance(selected);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const handleSaveHoliday = async () => {
    if (!holidayFrom || !holidayTo || !holidayName) {
      toast.warning("⚠️ Please fill all fields before saving");
      return;
    }


    if (holidayTo < holidayFrom) {
      toast.error("❌ 'To Date' cannot be earlier than 'From Date'");
      return;
    }

    try {
      await axiosInstance.post("/v3/attendance/addHoliday", {
        from: format(holidayFrom, "dd/MM/yyyy"),
        to: format(holidayTo, "dd/MM/yyyy"),
        name: holidayName,
      });

      setHolidayModalOpen(false);
      setHolidayFrom(null);
      setHolidayTo(null);
      setHolidayName("");

      toast.success("🎉 Holiday added successfully!");
    } catch (err) {
      console.error("Error adding holiday:", err);
      toast.error("❌ Failed to add holiday");
    }
  };



  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <AdminNav />
      <motion.div
        className="mt-15 px-4 md:px-8 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-6 flex flex-col md:flex-row md:justify-center gap-6 md:items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl text-center font-bold mb-4 md:mb-0 text-green-800">
            All Attendance Records
          </h1>
          <motion.input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300 transition"
            whileFocus={{ scale: 1.03 }}
          />
          <span>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer flex items-center gap-2"
              onClick={() => setHolidayModalOpen(true)}
            >
              <FaPlus /> Add Holiday
            </button>
          </span>

          <span>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer flex items-center gap-2"
              onClick={() => {
                fetchHolidays();
                setIsHolidayOpen(true);
              }}
            >
              <FaCalendarAlt /> View Holiday
            </button>
          </span>

        </motion.div>

        <motion.div
          className="overflow-x-auto bg-white shadow-md rounded-lg max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <table className="min-w-full table-auto border-collapse border border-green-300">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="border px-4 py-2">S.No</th>
                <th className="border px-4 py-2">User Name</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time In</th>
                <th className="border px-4 py-2">Time Out</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Half Day</th>
                <th className="border px-4 py-2">Late</th>
                <th className="border px-4 py-2">Net Balance</th>
              </tr>
            </thead>

            <tbody>
              {attendances.length > 0 ? (
                attendances.map((record, index) => {
                  const summary = presentMap[record.userId?.userId] || {};

                  const netBalanceMins = (summary.totalPlus || 0) - (summary.totalMinus || 0);
                  const netBalance =
                    netBalanceMins >= 0 ? `+ ${formatMinutes(netBalanceMins)}` : `- ${formatMinutes(Math.abs(netBalanceMins))}`;

                  return (
                    <motion.tr
                      key={record._id || index}
                      className="hover:bg-green-100 transition"
                      variants={rowVariants}
                    >
                      <td className="border px-4 py-2 text-center">{index + 1}</td>
                      <td className="border px-4 py-2">
                        {record.userId ? (
                          <Link to={`/attendance/${record.userId.userId}`}>
                            {record.userId.name}
                          </Link>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td className="border px-4 py-2">{formatDate(record.date)}</td>
                      <td className="border px-4 py-2">
                        {record.timeIn ? record.timeIn : <span className="text-red-500">Not Filled</span>}
                      </td>
                      <td className="border px-4 py-2">{record.timeOut || "-"}</td>
                      <td className="border px-4 py-2">{summary.present || ""}</td>
                      <td className="border px-4 py-2">
                        <span className="text-red-600">{summary.absent || ""}</span>
                      </td>
                      <td className="border px-4 py-2">
                        <span className="text-red-600">{summary.halfday || ""}</span>
                      </td>
                      <td className="border px-4 py-2">
                        <span className="text-red-600">{summary.late || ""}</span>
                      </td>

                      <td className="border px-4 py-2">{netBalance}</td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-green-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </motion.div>
      </motion.div>

      {/* Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4 text-center">Add Holiday</h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">From Date</label>
              <DatePicker
                selected={holidayFrom}
                onChange={(date) => setHolidayFrom(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                minDate={new Date()}
                onKeyDown={(e) => e.preventDefault()}
                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">To Date</label>
              <DatePicker
                selected={holidayTo}
                onChange={(date) => setHolidayTo(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                minDate={holidayFrom || new Date()}
                onKeyDown={(e) => e.preventDefault()}
                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Holiday Name</label>
              <input
                type="text"
                placeholder="Holiday Name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setHolidayModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHoliday}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>

      )}
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

                  {holidays
                    .slice()
                    .sort((a, b) => new Date(a.from) - new Date(b.from))
                    .filter(
                      (h) =>
                        moment(h.from).isAfter(moment(), "day") ||
                        moment(h.from).isSame(moment(), "day")
                    ).length > 0 && (
                      <h3 className="text-lg font-bold text-green-700 mt-2">
                        Upcoming Holidays
                      </h3>
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


                  {holidays
                    .slice()
                    .sort((a, b) => new Date(b.from) - new Date(a.from))
                    .filter((h) => moment(h.from).isBefore(moment(), "day"))
                    .length > 0 && (
                      <h3 className="text-lg font-bold text-red-600 mt-6">
                        Past Holidays
                      </h3>
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

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AdminAttendance;
