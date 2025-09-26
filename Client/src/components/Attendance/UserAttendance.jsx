import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { FaClock, FaExclamationTriangle, FaUserClock } from "react-icons/fa";
import UserNav from "../UserNav";
import AdminNav from "../Admin/AdminNav";
import moment from "moment";
import { motion } from "framer-motion";

const UserAttendance = () => {
  const { id: paramId } = useParams();
  const localUserId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const userId = paramId || localUserId;
  const [selectedMonth, setSelectedMonth] = useState(moment().format("YYYY-MM"));
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    moment().subtract(i, "months").format("YYYY-MM")
  );
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!userId) {
        setError("Invalid user ID");
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(
          `/v3/attendance/attendanceById/${userId}`,
          { params: { month: selectedMonth } }
        );
        setAttendance(res.data);
        console.log(res.data, " attendance");
        setLoading(false);
        if (res.data.length > 0) {
          const name = res.data[0]?.userId?.name || "N/A";
          setUserName(name);
        }
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
        setError(err.response?.data?.error || "Failed to load attendance");
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [userId, selectedMonth]);

  const parseTimeInMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const [time, meridian] = timeStr.split(" ");
    if (!time || !meridian) return null;

    let [hour, minute] = time.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return null;

    if (meridian.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (meridian.toUpperCase() === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const formatMinutes = (mins) => {
    if (mins <= 0) return "0 min";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h} hr${h > 1 ? "s" : ""} ${m > 0 ? `${m} min` : ""}`.trim();
    }
    return `${mins} min`;
  };

  const formatTime = (timeStr) => timeStr || "-";

  const formatDate = (isoDate) => {
    return moment(isoDate).format("DD/MM/YYYY");
  };

  // const calculateTotalTime = (timeInStr, timeOutStr) => {
  //   if (!timeInStr || !timeOutStr) return "-";
  //   const to24Hour = (timeStr) => {
  //     const [time, meridian] = timeStr.split(" ");
  //     let [hour, minute] = time.split(":").map(Number);
  //     if (meridian === "PM" && hour !== 12) hour += 12;
  //     if (meridian === "AM" && hour === 12) hour = 0;
  //     return hour * 60 + minute;
  //   };
  //   const inMins = to24Hour(timeInStr);
  //   const outMins = to24Hour(timeOutStr);
  //   const diff = outMins - inMins;
  //   if (diff < 0) return "-";
  //   const hours = Math.floor(diff / 60);
  //   const minutes = diff % 60;
  //   return `${hours}h ${minutes}m`;
  // };
  const calculateStatusMeta = (record) => {
    if (isSunday(record.date) || !record.timeIn || !record.timeOut) {
      return { label: "Sunday", minutes: 0, type: "neutral" };
    }

    const timeInMins = parseTimeInMinutes(record.timeIn);
    const timeOutMins = parseTimeInMinutes(record.timeOut);
    const standardIn = 10 * 60; // 10:00 AM
    const standardOut = 18.5 * 60; // 6:30 PM

    let minutes = 0;
    let type = "neutral";
    let label = "On Time";

    if (timeInMins > standardIn) {
      minutes = timeInMins - standardIn;
      type = "minus";
      label = `-${formatMinutes(minutes)}`;
    } else if (timeOutMins > standardOut) {
      minutes = timeOutMins - standardOut;
      type = "plus";
      label = `+${formatMinutes(minutes)}`;
    }

    return { label, minutes, type };
  };
  const lateCount = attendance.filter(
    (record) =>
      record.status.includes("Late") &&
      parseTimeInMinutes(record.timeIn || "00:00 AM") > 600
  ).length;
  const isSunday = (isoDate) => {
    return moment(isoDate).day() === 0;
  };

  const getStatusColor = (status) => {
    if (
      status === "Absent" ||
      status.startsWith("Absent (No Time Out") ||
      status.toLowerCase().startsWith("absent (<5")
    ) {
      return "text-red-700 font-semibold";
    }

    if (status.startsWith("Late -")) return "text-red-600";
    if (status.startsWith("Late +")) return "text-green-600";
    if (status.startsWith("-")) return "text-red-700";
    if (status.startsWith("+")) return "text-green-700";
    if (status === "On Time") return "text-green-600";
    return "";
  };

  // Moved extractMinutes above attendanceSummary

  const extractMinutes = (status) => {
    if (!status) return 0;
    let total = 0;

    // Match "X hr" and "Y min"
    const hrMatch = status.match(/(\d+)\s*hr/);
    const minMatch = status.match(/(\d+)\s*min/);

    if (hrMatch) total += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) total += parseInt(minMatch[1], 10);

    return total;
  };
  // console.log(attendance);

  const attendanceSummary = attendance.reduce(
    (summary, record) => {
      if (
        record.status === "Absent" ||
        record.status.startsWith("Absent (No Time Out") ||
        record.status.toLowerCase().startsWith("absent (<5")
      ) {
        summary.absent++;
      }

      // else if (!isSunday(record.date)) {
      //   // Only process non-Sunday records
      //   const statusMeta = record.statusMeta || calculateStatusMeta(record);
      //   const type = statusMeta.type;
      //   const mins = statusMeta.minutes || 0;

      //   if (type === "minus" || type === "latecount") {
      //     summary.totalMinus += mins;
      //   }
      //   if (type === "plus" || type === "waived") {
      //     summary.totalPlus += mins;
      //   }
      //   if (type === "latecount") {
      //     summary.late++;
      //   }
      //   if (type === "halfday") {
      //     summary.halfday++;
      //   } else {
      //     summary.present++;
      //   }
      // }
      else if (isSunday(record.date) || record.status?.toLowerCase().includes("holiday")) {
        summary.present++;
      }
      else {
        const statusMeta = record.statusMeta || calculateStatusMeta(record);
        const type = statusMeta.type;
        const mins = statusMeta.minutes || 0;

        if (type === "minus" || type === "latecount") {
          summary.totalMinus += mins;
        }
        if (type === "plus" || type === "waived") {
          summary.totalPlus += mins;
        }
        if (type === "latecount") {
          summary.late++;
        }
        if (type === "halfday") {
          summary.halfday++;
        } else {
          summary.present++;
        }
      }

      return summary;
    },
    { present: 0, halfday: 0, late: 0, absent: 0, totalMinus: 0, totalPlus: 0 }
  );

  // console.log(attendanceSummary, "attendance summary");
  return (
    <>
      {role === "user" ? <UserNav /> : <AdminNav />}
      <div className="container md:mt-10 px-4 py-10">
        {/* 🔹 Month Filter Dropdown */}
        {/* <div className="flex justify-center mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-4 py-2 shadow-md"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {moment(m, "YYYY-MM").format("MMMM YYYY")}
              </option>
            ))}
          </select>
        </div>

        <motion.h2
          className="text-2xl font-semibold mb-4 text-center py-5 text-green-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          Attendance Summary - <span className="text-blue-600">{userName}</span>

        </motion.h2> */}
        <div className="flex justify-center px-12 gap-x-6 md:mt-5 items-center mb-6">
          <motion.h2
            className="text-2xl font-semibold text-green-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Attendance Summary - <span className="text-blue-600">{userName}</span>
          </motion.h2>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-4 py-2 shadow-md"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {moment(m, "YYYY-MM").format("MMMM YYYY")}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <>
            <motion.div
              className="grid md:ms-13 ms-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 mb-6 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {[
                {
                  title: "Total Present",
                  value: attendanceSummary.present,
                  bg: "bg-green-100",
                  border: "border-green-300",
                  text: "text-green-800",
                },
                {
                  title: "Half Day",
                  value: attendanceSummary.halfday,
                  bg: "bg-green-100",
                  border: "border-green-300",
                  text: "text-green-800",
                },
                {
                  title: "Total Late",
                  value: attendanceSummary.late,
                  bg: "bg-yellow-100",
                  border: "border-yellow-300",
                  text: "text-yellow-800",
                },
                {
                  title: "Total Absent",
                  value: attendanceSummary.absent,
                  bg: "bg-red-100",
                  border: "border-red-300",
                  text: "text-red-800",
                },
                {
                  title: "Total - Time",
                  value: `- ${formatMinutes(attendanceSummary.totalMinus)}`,
                  bg: "bg-pink-100",
                  border: "border-pink-300",
                  text: "text-pink-800",
                },
                {
                  title: "Total + Time",
                  value: `+ ${formatMinutes(attendanceSummary.totalPlus)}`,
                  bg: "bg-green-100",
                  border: "border-green-300",
                  text: "text-green-800",
                },
                {
                  title: "Net Balance",
                  value:
                    attendanceSummary.totalPlus -
                      attendanceSummary.totalMinus >=
                      0
                      ? `+ ${formatMinutes(
                        attendanceSummary.totalPlus -
                        attendanceSummary.totalMinus
                      )}`
                      : `- ${formatMinutes(
                        attendanceSummary.totalMinus -
                        attendanceSummary.totalPlus
                      )}`,
                  bg: "bg-blue-100",
                  border: "border-blue-300",
                  text: "text-blue-800",
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  className={`${card.bg} ${card.border} border rounded p-3 text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all`}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className={`text-lg font-bold ${card.text}`}>
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.table
              className="table-auto border w-full max-w-7xl ms-0 md:ms-13 mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Time In</th>
                  <th className="border px-4 py-2">Time Out</th>
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => {
                  const statusClass = getStatusColor(record.status);
                  return (
                    <motion.tr
                      key={record._id || `${record.date}-${index}`}
                      className="text-center hover:bg-gray-100 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">
                        {formatDate(record.date)}
                      </td>
                      <td className="border px-4 py-2">
                        {isSunday(record.date) ? (
                          <span className="text-purple-700">Sunday</span>
                        ) : (
                          record.timeIn || "-"
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {isSunday(record.date) ? (
                          <span className="text-purple-700">Sunday</span>
                        ) : (
                          record.timeOut || "-"
                        )}
                      </td>
                      <td
                        className={`border px-4 py-2 ${isSunday(record.date)
                          ? "text-purple-700 font-semibold"
                          : statusClass
                          }`}
                      >
                        {isSunday(record.date) ? "Sunday" : record.status}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </motion.table>

            <div className="py-6 md:mt-8 bg-white rounded-2xl shadow-lg space-y-6 text-gray-800 max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-green-600 border-b pb-2">
                Guidelines
              </h1>
              <div className="flex gap-4 items-start">
                <FaClock className="text-2xl text-blue-500 mt-1" />
                <p className="text-base leading-relaxed">
                  <strong className="text-gray-900">
                    The official office timings are from 10:00 AM to 6:30 PM.
                  </strong>{" "}
                  Team Mates are expected to log in to the company ERP system as
                  soon as they arrive at the office. Any login recorded after
                  10:00 AM will be considered late by the exact number of
                  minutes delayed. For example, if a Team Mate logs in at 10:20
                  AM, they will be marked late by 20 minutes. To adjust this
                  late time, the Team Mate must compensate by working{" "}
                  <span className="font-medium text-blue-600">
                    double the delayed time
                  </span>{" "}
                  in the evening on the same day. So, if someone is 20 minutes
                  late, they are required to work an extra 40 minutes after the
                  standard closing time of 6:30 PM. This adjustment must be
                  completed on the same day and cannot be carried over to
                  another day.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <FaExclamationTriangle className="text-2xl text-yellow-500 mt-1" />
                <p className="text-base leading-relaxed">
                  <strong className="text-gray-900">
                    If a Team Mate arrives after 10:30 AM
                  </strong>
                  , it will not only record the time delay but also count as one
                  official{" "}
                  <span className="text-red-600 font-medium">“Late”</span>{" "}
                  instance. If this happens three times in a month, it will
                  result in a deduction of one full day’s remuneration. However,
                  if the Team Mate works double the late time on the same day,
                  that particular “Late” count will be waived, and only the time
                  delay will be recorded.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <FaUserClock className="text-2xl text-purple-500 mt-1" />
                <p className="text-base leading-relaxed">
                  <strong className="text-gray-900">
                    If any Team Mate arrives after 12:00 PM
                  </strong>
                  , it will be automatically marked as a{" "}
                  <span className="font-semibold text-purple-600">
                    Half Day
                  </span>{" "}
                  in the system, and this will be visible on the Team Mate’s
                  dashboard. In cases where a Team Mate wants to take a planned
                  half day, the total working duration between punch-in and
                  punch-out must be more than 5 hours for it to be considered a
                  valid Half Day.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserAttendance;
