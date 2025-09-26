import React, { useState, useEffect } from "react";
import { HiMenu, HiOutlineClock, HiX } from "react-icons/hi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceButton from "./Attendance/AttendanceButton";
import logo from "../assets/logo.jpg";

const UserNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");

    if (name) setUserName(name);
    if (id) setUserId(id);
  }, []);

  const handleLogout = () => {
    localStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });

    window.location.href = "/";
  };

  return (
    <div className="bg-green-100">
      <motion.div
        className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-2  z-50"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <img
              src={logo}
              className="h-12 w-auto max-h-15 object-contain"
              alt="Logo"
            />
          </Link>

          <AttendanceButton />

          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-green-600 text-2xl focus:outline-none"
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </motion.button>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm md:text-base">
            <Link
              to={`/attendance/${userId}`}
              className="text-green-700 hover:text-green-600 transition"
            >
              Attendance
            </Link>

            <Link
              to="/dashboard"
              className="text-green-700 hover:text-green-600 transition"
            >
              Home
            </Link>

            <Link
              to="/report"
              className="text-green-700 hover:text-green-600 transition"
            >
              Reports
            </Link>

            <span className="text-green-600 font-medium hidden sm:inline">
              <motion.span
                className="text-green-600 font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {userName}
              </motion.span>
            </span>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow cursor-pointer"
            >
              Logout
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="md:hidden mt-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/dashboard"
                className="block text-green-700 hover:text-green-600"
              >
                Home
              </Link>

              <Link
                to="/report"
                className="block text-green-700 hover:text-green-600"
              >
                Reports
              </Link>

              <Link
                to={`/attendance/${userId}`}
                className="block text-green-700 hover:text-green-600"
              >
                Attendance
              </Link>

              <span className="block text-green-600">
                Welcome,{" "}
                <span className="text-green-600 font-bold">{userName}</span>
              </span>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow cursor-pointer"
              >
                Logout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UserNav;
