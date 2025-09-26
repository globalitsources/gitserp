import React, { useState, useEffect } from "react";
import {
  HiMenu,
  HiX,
  HiUserAdd,
  HiClipboardList,
  HiDocumentReport,
  HiLogout,
  HiOutlineClock,
  HiBell,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.jpg";
import axiosInstance from "../../axiosInstance";

const AdminNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [queries, setQueries] = useState([]);


  useEffect(() => {
    const name = localStorage.getItem("adminName");
    if (name) setUserName(name);

    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await axiosInstance.get("/v2/user/all");
      setQueries(res.data.filter((q) => q.status === "pending"));
    } catch (err) {
      console.error("Error fetching queries", err);
    }
  };

  const handleStatusChange = async (id) => {
    try {
      await axiosInstance.put(`/v2/user/${id}`, { status: "executed" });
      setQueries((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Error updating query status:", err);
    }
  };



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
    <div className="bg-green-200">
      <div className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-3 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-600 tracking-wide">
            <Link to="/mainDashboard">
              {" "}
              <img
                src={logo}
                className="h-12 w-auto max-h-15 object-contain"
                alt="Logo"
              />
            </Link>
          </h1>

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-green-600 text-3xl focus:outline-none "
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm md:text-base text-green-700">
            <NavLink
              to="/attendance"
              label="Attendance"
              icon={<HiOutlineClock />}
            />
            <NavLink to="/addProject" label="Project" icon={<HiUserAdd />} />
            <NavLink to="/users" label="Users" icon={<HiUserAdd />} />
            <NavLink
              to="/assignProject"
              label="Assign Projects"
              icon={<HiClipboardList />}
            />
            <NavLink
              to="/todayReport"
              label="Today Report"
              icon={<HiDocumentReport />}
            />
            <NavLink
              to="/adminReport"
              label="Reports"
              icon={<HiDocumentReport />}
            />

            <span className="text-green-600 hidden sm:inline">
              <span className="text-green-600 font-bold">
                {userName || "Admin"}
              </span>
            </span>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-2xl text-green-700 hover:text-green-900 cursor-pointer"
              >
                <HiBell />
                {queries.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {queries.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-xl p-4 z-50"
                  >
                    <h4 className="font-bold text-green-700 mb-3">Pending Queries</h4>
                    {queries.length === 0 ? (
                      <p className="text-gray-500">No pending queries</p>
                    ) : (
                      <ul className="space-y-3 max-h-60 overflow-y-auto">
                        {queries.map((q) => (
                          <li
                            key={q._id}
                            className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start"
                          >
                            <div>
                              <p className="text-gray-800">{q.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                From: {q.userId?.name || "User"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleStatusChange(q._id)}
                              className="ml-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                            >
                              Mark Done
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200 cursor-pointer"
            >
              <HiLogout />
              Logout
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-4 flex flex-col gap-4 text-green-700"
            >
              <NavLink to="/users" label="Users" icon={<HiUserAdd />} mobile />
              <NavLink
                to="/project"
                label="Assign Projects"
                icon={<HiClipboardList />}
                mobile
              />
              <NavLink
                to="/report"
                label="Reports"
                icon={<HiDocumentReport />}
                mobile
              />

              <span className="text-sm">
                Welcome,{" "}
                <span className="text-green-600 font-bold">
                  {userName || "Admin"}
                </span>
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <HiLogout />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavLink = ({ to, label, icon, mobile = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 ${mobile ? "block" : ""
      } hover:text-green-600 transition-colors duration-200 font-medium`}
  >
    {icon && <span className="text-xl">{icon}</span>}
    <span>{label}</span>
  </Link>
);

export default AdminNav;
