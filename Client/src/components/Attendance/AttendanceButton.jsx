import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import axiosInstance from "../../axiosInstance";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MySwal = withReactContent(Swal);

const AttendanceButton = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("time-in");
  const [isTimeInDone, setIsTimeInDone] = useState(false);
  const [isTimeOutDone, setIsTimeOutDone] = useState(false);
  const [isSunday, setIsSunday] = useState(false);
  const [holidayName, setHolidayName] = useState(null);


  const fetchStatus = async () => {
    try {

      const uid = userId || localStorage.getItem("userId");
      if (!uid) {
        toast.error("User ID not found");
        return;
      }
      const res = await axiosInstance.get(`/v3/attendance/status/${uid}`);
      const { timeIn, timeOut } = res.data;
      // console.log(res.data, "statusres");
      if (res.data?.isSunday) {
        setIsSunday(true);
        return;
      }
      if (res.data?.isHoliday) {
        setHolidayName(res.data.holidayName || "Holiday");
        return;
      }
      console.log(res.data, "res")
      setIsTimeInDone(!!timeIn);
      setIsTimeOutDone(!!timeOut);

      if (!timeIn) {
        setCurrentPhase("time-in");
      } else if (!timeOut) {
        setCurrentPhase("time-out");
      } else {
        setCurrentPhase("done");
      }
    } catch (err) {
      toast.error("Error fetching attendance status");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const handleTimeAction = async () => {
    const uid = userId || localStorage.getItem("userId");
    if (!uid) {
      toast.error("User ID missing");
      return;
    }

    const confirmMsg =
      currentPhase === "time-in"
        ? "Are you sure you want to mark Time In?"
        : "Are you sure you want to mark Time Out?";

    const result = await MySwal.fire({
      title: confirmMsg,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      if (currentPhase === "time-in") {
        await axiosInstance.post("/v3/attendance/time-in", { userId: uid });
        setIsTimeInDone(true);
        await MySwal.fire("Marked!", "Time In marked successfully!", "success");
      } else {
        await axiosInstance.post("/v3/attendance/time-out", { userId: uid });
        setIsTimeOutDone(true);
        await MySwal.fire(
          "Marked!",
          "Time Out marked successfully!",
          "success"
        );
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Attendance submission failed!";
      await MySwal.fire("Error!", message, "error");

      if (message === "Already clocked in.") setIsTimeInDone(true);
      if (message === "Already clocked out.") setIsTimeOutDone(true);
    } finally {
      await fetchStatus();
      setLoading(false);
    }
  };

  const isDisabled = loading || currentPhase === "done";
  const label = loading
    ? "Loading..."
    : currentPhase === "time-in"
      ? "Time In"
      : currentPhase === "time-out"
        ? "Time Out"
        : "Attendance Done";

  if (isSunday) {
    return <div className="text-green-600 font-semibold mt-4">It's Sunday</div>;
  }
  if (holidayName) {
    return (
      <div className="text-green-600 font-semibold mt-4 ">
        📅 Holiday: {holidayName}
      </div>
    );
  }


  return (
    <>
      <button
        onClick={handleTimeAction}
        disabled={isDisabled}
        className={`btn btns px-4 py-2 rounded ${isDisabled
          ? "bg-green-200 cursor-not-allowed"
          : "bg-green-700 text-white cursor-pointer hover:bg-green-500 transition-all duration-300"
          }`}
      >
        {label}
      </button>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AttendanceButton;
