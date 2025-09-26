import React, { useState, useEffect } from "react";
import AdminNav from "./AdminNav";
import axiosInstance from "../../axiosInstance";
import { ChevronDown } from "lucide-react";

const AssignedProject = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [success, setSuccess] = useState("");

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchProjects();

    const handleClickOutside = (e) => {
      if (!e.target.closest(".project-dropdown")) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/v1/admin/users");
      setUsers(res.data);
      // console.log("users", res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/v1/admin");
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleProjectCheckbox = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedUser || selectedProjects.length === 0) {
      setSuccess("Please select a user and at least one project.");
      setTimeout(() => setSuccess(""), 2500);
      return;
    }

    try {
      await axiosInstance.post("/v1/admin/assign", {
        name: selectedUser,
        projects: selectedProjects,
      });

      setSuccess("Projects assigned successfully.");
      setSelectedUser("");
      setSelectedProjects([]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error assigning projects:", error);
      setSuccess(" Failed to assign projects. Try again.");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
        <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-center text-green-600 mb-6">
            Assign Projects to User
          </h2>

          {success && (
            <div
              className={`mb-4 text-sm font-medium text-center ${
                success.startsWith("") ? "text-green-600" : "text-red-600"
              }`}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              >
                <option value="">-- Select a user --</option>
                {[...users]
                  .filter((user) => user.role === "user")
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="relative project-dropdown">
              <label className="block text-gray-700 font-medium mb-1">
                Select Projects
              </label>
              <div
                className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center bg-white"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              >
                <span className="truncate">
                  {selectedProjects.length > 0
                    ? `${selectedProjects.length} project(s) selected`
                    : "-- Select projects --"}
                </span>
                <ChevronDown size={18} />
              </div>

              {showProjectDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto shadow-md">
                  {[...projects]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((project) => (
                      <label
                        key={project._id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => handleProjectCheckbox(project._id)}
                        />
                        {project.name}
                      </label>
                    ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition-all cursor-pointer"
            >
              Assign Projects
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AssignedProject;
