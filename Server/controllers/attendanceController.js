import moment from "moment";
import attendanceModel from "../models/attendanceModel.js";
import Admin from "../models/adminModel.js";
import Holiday from "../models/holidayModel.js";



const getUserObjectId = async (userId) => {
  const user = await Admin.findOne({ userId });
  if (!user) throw new Error("User not found");
  return user._id;
};

// const getStatus = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const objectId = await getUserObjectId(userId);
//     const now = moment().tz("Asia/Kolkata");
//     const date = now.format("YYYY-MM-DD");
//     const isSunday = now.day() === 0;

//     let attendance = await attendanceModel.findOne({ userId: objectId, date });

//     if (isSunday && !attendance) {
//       attendance = new attendanceModel({
//         userId: objectId,
//         date,
//         timeIn: "00:00:00",
//         timeOut: "00:00:00",
//       });
//       await attendance.save();
//       console.log(`✅ Auto-marked Sunday present for user ${userId}`);
//     }

//     res.json({
//       timeIn: attendance?.timeIn ? moment(attendance.timeIn, "HH:mm:ss").format("hh:mm A") : null,
//       timeOut: attendance?.timeOut ? moment(attendance.timeOut, "HH:mm:ss").format("hh:mm A") : null,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch attendance status" });
//   }
// };

const getStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectId = await getUserObjectId(userId);

    const now = moment().tz("Asia/Kolkata");
    const date = now.format("YYYY-MM-DD");
    const isSunday = now.day() === 0;

    const today = now.startOf("day").toDate();

    const holiday = await Holiday.findOne({
      from: { $lte: today },
      to: { $gte: today },
    });

    if (holiday) {
      return res.json({
        isHoliday: true,
        holidayName: holiday.name,
      });
    }


    let attendance = await attendanceModel.findOne({ userId: objectId, date });

    if (isSunday && !attendance) {
      attendance = new attendanceModel({
        userId: objectId,
        date,
        timeIn: "00:00:00",
        timeOut: "00:00:00",
      });
      await attendance.save();
      console.log(`✅ Auto-marked Sunday present for user ${userId}`);
    }

    res.json({
      isSunday,
      timeIn: attendance?.timeIn
        ? moment(attendance.timeIn, "HH:mm:ss").format("hh:mm A")
        : null,
      timeOut: attendance?.timeOut
        ? moment(attendance.timeOut, "HH:mm:ss").format("hh:mm A")
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance status" });
  }
};
// POST: Time In
const markTimeIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const objectId = await getUserObjectId(userId);
    const now = moment().utcOffset("+05:30");
    const timeIn = now.format("HH:mm:ss");
    const date = now.format("YYYY-MM-DD");


    const today9am = moment().utcOffset("+05:30").set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
    if (now.isBefore(today9am)) {
      return res.status(400).json({ message: "You can mark attendance only after 9:00 AM." });
    }

    let record = await attendanceModel.findOne({ userId: objectId, date });

    if (!record) {
      record = new attendanceModel({ userId: objectId, date, timeIn });
    } else if (!record.timeIn) {
      record.timeIn = timeIn;
    } else {
      return res.status(400).json({ message: "Already clocked in." });
    }

    await record.save();

    res.json({
      message: "Time In saved",
      timeIn: moment(timeIn, "HH:mm:ss").format("hh:mm A"),
      date,
    });
  } catch (err) {
    console.error("Error in markTimeIn:", err);
    res.status(500).json({ error: "Time In failed" });
  }
};


// POST: Time Out
const markTimeOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const objectId = await getUserObjectId(userId);
    const timeOut = moment().utcOffset("+05:30").format("HH:mm:ss");
    const date = moment().utcOffset("+05:30").format("YYYY-MM-DD");

    const record = await attendanceModel.findOne({ userId: objectId, date });

    if (!record) {
      return res.status(404).json({ message: "No Time In found." });
    }

    if (record.timeOut) {
      return res.status(400).json({ message: "Already clocked out." });
    }

    record.timeOut = timeOut;
    await record.save();

    res.json({
      message: "Time Out saved",
      timeOut: moment(timeOut, "HH:mm:ss").format("hh:mm A"),
      date,
    });
  } catch (err) {
    console.error("Error in markTimeOut:", err);
    res.status(500).json({ error: "Time Out failed" });
  }
};

// GET: All Attendance Records
const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const users = await Admin.find(
      { role: { $ne: "admin" } },
      "name userId role"
    );


    const records = await attendanceModel.find({ date }).populate("userId", "name userId");


    const attendanceMap = new Map();
    records.forEach((r) => {
      attendanceMap.set(r.userId._id.toString(), {
        ...r._doc,
        timeIn: r.timeIn ? moment(r.timeIn, "HH:mm:ss").format("hh:mm A") : null,
        timeOut: r.timeOut ? moment(r.timeOut, "HH:mm:ss").format("hh:mm A") : null,
      });
    });

    const result = users.map((user) => {
      const attendance = attendanceMap.get(user._id.toString());
      if (attendance) {
        return attendance;
      } else {

        return {
          _id: user._id,
          userId: user,
          date,
          timeIn: null,
          timeOut: null,
        };
      }
    });

    res.json(result);
  } catch (err) {
    console.error("Error in getAllAttendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { month } = req.query;
    console.log(req.query)
    const now = moment.tz("Asia/Kolkata");
    const target = month
      ? moment.tz(month, "YYYY-MM", "Asia/Kolkata") 
      : now;
    const startDate = target.clone().startOf("month").format("YYYY-MM-DD");
    const endDate = target.clone().endOf("month").format("YYYY-MM-DD");
    const objectId = await getUserObjectId(userId);


    const today = now.format("YYYY-MM-DD");

    const records = await attendanceModel
      .find({
        userId: objectId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .populate("userId", "name userId");
    const holidays = await Holiday.find({
      from: { $lte: endDate },
      to: { $gte: startDate }
    }).lean();

    const holidayMap = {};
    holidays.forEach(h => {
      const start = moment(h.from);
      const end = moment(h.to);
      while (start.isSameOrBefore(end)) {
        holidayMap[start.format("YYYY-MM-DD")] = h.name || "Holiday";
        start.add(1, "day");
      }
    });

    const startOfMonth = target.clone().startOf("month");
    let endOfMonth = target.clone().endOf("month");

    // 🔹 If it's the current month → limit endOfMonth to today
    if (target.isSame(now, "month")) {
      endOfMonth = now.clone().endOf("day");
    }

    const allDates = [];
    const current = startOfMonth.clone();

    while (current.isSameOrBefore(endOfMonth, "day")) {
      allDates.push(current.format("YYYY-MM-DD"));
      current.add(1, "day");
    }

    const parseTimeInMinutes = (timeStr) => {
      if (!timeStr || typeof timeStr !== "string") return null;

      const [time, modifier] = timeStr.split(" "); // "06:49 PM" -> ["06:49","PM"]
      if (!time) return null;

      const [hoursStr, minutesStr] = time.split(":");
      let hour = parseInt(hoursStr, 10);
      const minute = parseInt(minutesStr, 10);

      if (isNaN(hour) || isNaN(minute)) return null;
      if (hour === 0 && minute === 0) return null; // ignore 00:00 AM

      // Convert 12h → 24h
      if (modifier === "PM" && hour < 12) hour += 12;
      if (modifier === "AM" && hour === 12) hour = 0;

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

    // const getStatus = (timeInStr, timeOutStr, date) => {
    //   if (!timeInStr && !timeOutStr)
    //     return { label: "Absent", minutes: 0, type: "absent" };

    //   const timeInMin = parseTimeInMinutes(timeInStr);
    //   if (timeInMin === null)
    //     return { label: "Invalid Time In", minutes: 0, type: "invalid" };

    //   const scheduledIn = 600;   // 10:00
    //   const lateLimit = 630;     // 10:30
    //   const halfDayCutoff = 720; // 12:00
    //   const scheduledOut = 1110; // 6:30
    //   const minHalfDayDuration = 5 * 60; // 5 hours

    //   // ===== Half Day rule =====
    //   if (timeInMin >= halfDayCutoff) {
    //     if (!timeOutStr)
    //       return { label: "Half Day", minutes: 0, type: "halfday" };

    //     const timeOutMin = parseTimeInMinutes(timeOutStr);
    //     let duration = timeOutMin - timeInMin;
    //     if (duration < 0) duration += 24 * 60;

    //     return duration >= minHalfDayDuration
    //       ? { label: "Half Day", minutes: duration, type: "halfday" }
    //       : { label: "Invalid Half Day", minutes: 0, type: "invalid" };
    //   }

    //   // If no Time Out recorded
    //   if (!timeOutStr) {
    //     if (timeInMin < scheduledIn) {
    //       // Early arrival before 10:00
    //       return {
    //         label: `+ ${formatMinutes(scheduledIn - timeInMin)}`,
    //         minutes: scheduledIn - timeInMin,
    //         type: "plus"
    //       };
    //     }

    //     if (timeInMin <= lateLimit) {
    //       // Late but before 10:30
    //       const lateBy = timeInMin - scheduledIn;
    //       const requiredExtra = 2 * lateBy;

    //       return {
    //         label: `- ${formatMinutes(requiredExtra)}`,
    //         minutes: requiredExtra,
    //         type: "minus"
    //       };
    //     }

    //     if (timeInMin < halfDayCutoff) {
    //       // Between 10:30 and 12:00 → counts as Late
    //       return {
    //         label: `Late - ${formatMinutes(2 * (timeInMin - scheduledIn))}`,
    //         minutes: timeInMin - scheduledIn,
    //         type: "latecount"
    //       };
    //     }
    //   }



    //   const timeOutMin = parseTimeInMinutes(timeOutStr);
    //   let actualTimeOut = timeOutMin;
    //   if (timeOutMin < timeInMin) actualTimeOut += 24 * 60;

    //   // ===== Early / Late / Overtime =====
    //   const lateBy = Math.max(0, timeInMin - scheduledIn);
    //   const earlyBy = Math.max(0, scheduledIn - timeInMin);
    //   const extraWork = Math.max(0, actualTimeOut - scheduledOut);
    //   const earlyLeave = Math.max(0, scheduledOut - actualTimeOut);

    //   // Case 1: On-time or early
    //   if (lateBy === 0) {
    //     const plus = earlyBy + extraWork;
    //     return plus > 0
    //       ? { label: `+ ${formatMinutes(plus)}`, minutes: plus, type: "plus" }
    //       : { label: "On Time", minutes: 0, type: "ontime" };
    //   }

    //   // Case 2: Late arrival (after 10:00)
    //   const requiredExtra = 2 * lateBy;
    //   const adjustment = earlyBy + extraWork; // credit
    //   const remaining = requiredExtra - adjustment + earlyLeave;


    //   if (timeInMin > lateLimit) {
    //     // Late Count triggered
    //     if (remaining > 0) {
    //       return {
    //         label: `Late - ${formatMinutes(remaining)}`,
    //         minutes: remaining,
    //         type: "latecount"
    //       };
    //     }
    //     return {
    //       label: `Late + ${formatMinutes(Math.abs(remaining))}`,
    //       minutes: Math.abs(remaining),
    //       type: "waived"
    //     };
    //   } else {
    //     // Normal late (before 10:30)
    //     if (remaining > 0) {
    //       return {
    //         label: `- ${formatMinutes(remaining)}`,
    //         minutes: remaining,
    //         type: "minus"
    //       };
    //     }
    //     return {
    //       label: `+ ${formatMinutes(Math.abs(remaining))}`,
    //       minutes: Math.abs(remaining),
    //       type: "plus"
    //     };
    //   }
    // };
    const getStatus = (timeInStr, timeOutStr, date) => {
      if (!timeInStr && !timeOutStr)
        return { label: "Absent", minutes: 0, type: "absent" };

      const timeInMin = parseTimeInMinutes(timeInStr);
      if (timeInMin === null)
        return { label: "Invalid Time In", minutes: 0, type: "invalid" };

      const scheduledIn = 600;   // 10:00
      const lateLimit = 630;     // 10:30
      const halfDayCutoff = 720; // 12:00
      const scheduledOut = 1110; // 6:30
      const minHalfDayDuration = 5 * 60; // 5 hours

      // ===== Half Day Rule =====
      if (timeInMin >= halfDayCutoff) {
        if (!timeOutStr) {
          // No timeOut → still mark as Half Day
          return { label: "Half Day", minutes: 0, type: "halfday" };
        }

        const timeOutMin = parseTimeInMinutes(timeOutStr);
        let duration = timeOutMin - timeInMin;
        if (duration < 0) duration += 24 * 60; // handle overnight

        if (duration >= minHalfDayDuration) {
          return {
            label: `Half Day (${formatMinutes(duration)})`,
            minutes: duration,
            type: "halfday"
          };
        } else {
          return { label: "absent (<5 hrs)", minutes: duration, type: "invalid" };
        }
      }

      // ===== Normal Flow =====
      if (!timeOutStr) {
        const ninePM = 21 * 60;
        const todayStr = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

        if (date !== todayStr) {
          return { label: "Absent (No Time Out)", minutes: 0, type: "absent" };
        }
        const currentTime = moment().tz("Asia/Kolkata").hours() * 60 + moment().tz("Asia/Kolkata").minutes();
        if (currentTime >= ninePM) {
          return { label: "Absent (No Time Out)", minutes: 0, type: "absent" };
        }
        if (timeInMin < scheduledIn) {
          return {
            label: `+ ${formatMinutes(scheduledIn - timeInMin)}`,
            minutes: scheduledIn - timeInMin,
            type: "plus"
          };
        }

        if (timeInMin <= lateLimit) {
          const lateBy = timeInMin - scheduledIn;
          const requiredExtra = 2 * lateBy;
          return {
            label: `- ${formatMinutes(requiredExtra)}`,
            minutes: requiredExtra,
            type: "minus"
          };
        }

        if (timeInMin < halfDayCutoff) {
          return {
            label: `Late - ${formatMinutes(2 * (timeInMin - scheduledIn))}`,
            minutes: timeInMin - scheduledIn,
            type: "latecount"
          };
        }
      }

      // With Time Out fixed
// const timeOutMin = parseTimeInMinutes(timeOutStr);
// let actualTimeOut = timeOutMin;
// if (timeOutMin < timeInMin) actualTimeOut += 24 * 60;

// const totalWorked = actualTimeOut - timeInMin;

// // 🔹 New rule: If total working hours < 5 hrs → Absent
// if (totalWorked < 5 * 60) {
//   return { label: "Absent (<5 hrs)", minutes: totalWorked, type: "absent" };
// }

// const lateBy = Math.max(0, timeInMin - scheduledIn);
// const earlyBy = Math.max(0, scheduledIn - timeInMin);
// const extraWork = Math.max(0, actualTimeOut - scheduledOut);
// const earlyLeave = Math.max(0, scheduledOut - actualTimeOut);

      // With Time Out
      const timeOutMin = parseTimeInMinutes(timeOutStr);
      let actualTimeOut = timeOutMin;
      if (timeOutMin < timeInMin) actualTimeOut += 24 * 60;

      const lateBy = Math.max(0, timeInMin - scheduledIn);
      const earlyBy = Math.max(0, scheduledIn - timeInMin);
      const extraWork = Math.max(0, actualTimeOut - scheduledOut);
      const earlyLeave = Math.max(0, scheduledOut - actualTimeOut);

      // if (lateBy === 0) {
      //   const plus = earlyBy + extraWork;
      //   return plus > 0
      //     ? { label: `+ ${formatMinutes(plus)}`, minutes: plus, type: "plus" }
      //     : { label: "On Time", minutes: 0, type: "ontime" };
      // }
      // Case 1: On-time or early arrival
      if (lateBy === 0) {
        const net = earlyBy + extraWork - earlyLeave;

        if (net > 0) {
          return { label: `+ ${formatMinutes(net)}`, minutes: net, type: "plus" };
        }
        if (net < 0) {
          const debit = Math.abs(net);
          return { label: `- ${formatMinutes(debit)}`, minutes: debit, type: "minus" };
        }
        return { label: "On Time", minutes: 0, type: "ontime" };
      }


      const requiredExtra = 2 * lateBy;
      const adjustment = earlyBy + extraWork;
      const remaining = requiredExtra - adjustment + earlyLeave;

      if (timeInMin > lateLimit) {
        if (remaining > 0) {
          return {
            label: `Late - ${formatMinutes(remaining)}`,
            minutes: remaining,
            type: "latecount"
          };
        }
        return {
          label: `Late + ${formatMinutes(Math.abs(remaining))}`,
          minutes: Math.abs(remaining),
          type: "waived"
        };
      } else {
        if (remaining > 0) {
          return {
            label: `- ${formatMinutes(remaining)}`,
            minutes: remaining,
            type: "minus"
          };
        }
        return {
          label: `+ ${formatMinutes(Math.abs(remaining))}`,
          minutes: Math.abs(remaining),
          type: "plus"
        };
      }
    };



    // Map attendance
    const attendanceMap = {};
    for (const r of records) {
      const date = moment.tz(r.date, "Asia/Kolkata").format("YYYY-MM-DD");
      const formattedIn = r.timeIn
        ? moment.tz(r.timeIn, "HH:mm:ss", "Asia/Kolkata").format("hh:mm A")
        : null;
      const formattedOut = r.timeOut
        ? moment.tz(r.timeOut, "HH:mm:ss", "Asia/Kolkata").format("hh:mm A")
        : null;

      const status = getStatus(formattedIn, formattedOut, r.date);

      attendanceMap[date] = {
        ...r._doc,
        timeIn: formattedIn,
        timeOut: formattedOut,
        status: status.label,
        statusMeta: status, // keep raw info if needed
      };
    }

    const finalResult = allDates.map((date) => {
      const dayOfWeek = moment.tz(date, "Asia/Kolkata").day();

      if (attendanceMap[date]) return attendanceMap[date];


      if (holidayMap[date]) {
        return {
          userId: {
            _id: objectId,
            name: records.length ? records[0]?.userId?.name || "" : "",
            userId,
          },
          date,
          timeIn: null,
          timeOut: null,
          markedBy: null,
          status: `Holiday (${holidayMap[date]})`,
        };
      }

      if (dayOfWeek === 0) {
        return {
          userId: {
            _id: objectId,
            name: records.length ? records[0]?.userId?.name || "" : "",
            userId,
          },
          date,
          timeIn: null,
          timeOut: null,
          markedBy: null,
          status: "Sunday",
        };
      }

      return {
        userId: {
          _id: objectId,
          name: records.length ? records[0]?.userId?.name || "" : "",
          userId,
        },
        date,
        timeIn: null,
        timeOut: null,
        markedBy: null,
        status: "Absent",
      };
    });
    res.json(finalResult.reverse());
  } catch (err) {
    console.error("Error fetching user attendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

const addHoliday = async (req, res) => {
  try {
    const { from, to, name, createdBy } = req.body;

    const formattedFrom = moment(from, "DD/MM/YYYY").toDate();
    const formattedTo = moment(to, "DD/MM/YYYY").toDate();

    const holiday = new Holiday({
      from: formattedFrom,
      to: formattedTo,
      name,
      createdBy,
    });

    await holiday.save();
    res.status(201).json({ message: "Holiday added", holiday });
  } catch (err) {
    console.error("Error adding holiday:", err);
    res.status(500).json({ error: "Failed to add holiday" });
  }
};


const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ from: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

export { getStatus, markTimeIn, markTimeOut, getAllAttendance, getAttendanceById, addHoliday, getHolidays };
