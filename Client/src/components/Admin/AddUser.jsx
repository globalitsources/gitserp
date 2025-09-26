import React, { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import AdminNav from "./AdminNav";
import axiosInstance from "../../axiosInstance";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUser = () => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axiosInstance.post("/v1/admin/register", {
        userId,
        name,
        password,
        role,
      });

      if (response.status === 201) {
        toast.success("User added successfully!");
        setUserId("");
        setPassword("");
        setName("");
        setRole("user");

        setTimeout(() => {
          navigate("/users");
        }, 2000);
      }
    } catch (err) {
      console.error("AddUser Error:", err);
      const message =
        err.response?.data?.message || "Something went wrong. Try again.";
      toast.error(message);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-center min-h-screen bg-green-50 px-4 md:mt-4">
        <motion.div
          className="w-full max-w-md bg-white shadow-lg rounded-xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-center text-green-600 mb-6">
            Add New User
          </h2>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-green-600 hover:text-green-800 text-lg py-2 "
            >
              ← Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter user ID"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none pr-10"
                  placeholder="Enter password"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xl text-gray-600 cursor-pointer"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all shadow-md font-medium"
            >
              Add User
            </motion.button>
          </form>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default AddUser;
