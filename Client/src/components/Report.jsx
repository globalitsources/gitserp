import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFilter, FaRegSave } from "react-icons/fa";
import { MdWorkOutline } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import UserNav from "./UserNav";
import axiosInstance from "../axiosInstance";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import useAllowedTime from "./Admin/useAllowedTime";

const Report = () => {
  const { isAllowedTime, message, serverTime } = useAllowedTime();
  const [projects, setProjects] = useState([]);
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.id || payload.sub;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  const userId = getUserIdFromToken();
  const workTypes = [
    "",
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

  const taskOptions = Array.from({ length: 50 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  }));

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.post(
          "/v2/user/projects",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const uniqueProjectsMap = new Map();
        res.data.forEach((project) => {
          if (!uniqueProjectsMap.has(project.name)) {
            uniqueProjectsMap.set(project.name, project);
          }
        });

        const uniqueProjects = Array.from(uniqueProjectsMap.values());

        const formatted = uniqueProjects.map((project) => ({
          id: project.id,
          name: project.name,
          forms: [
            {
              workType: "",
              taskNumber: null,
              work: "",
            },
          ],
        }));

        setProjects(formatted);
      } catch (err) {
        console.error("Error fetching projects:", err);
        toast.error("Failed to load projects.");
      }
    };

    fetchAssignedProjects();
  }, []);

  const updateForm = (projectId, formIndex, field, value) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const updatedForms = [...proj.forms];
          updatedForms[formIndex][field] = value;

          return {
            ...proj,
            forms: updatedForms,
          };
        }
        return proj;
      })
    );
  };

  const addFormRow = (projectId) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          return {
            ...proj,
            forms: [
              ...proj.forms,
              {
                workType: "",
                taskNumber: null,
                work: "",
              },
            ],
          };
        }
        return proj;
      })
    );
  };
  const removeFormRow = (projectId) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId && proj.forms.length > 1) {
          const updatedForms = proj.forms.slice(0, -1);
          return {
            ...proj,
            forms: updatedForms,
          };
        }
        return proj;
      })
    );
  };

  const handleSubmitWork = async (projectId) => {
    if (!isAllowedTime) {
      toast.warning(
        "⏳ Submission is allowed only from 1:40 – 2:00 PM and 6:20 – 7:00 PM IST."
      );
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const hasInvalidForm = project.forms.some(
      (form) => !form.workType || !form.taskNumber
    );
    if (!userId || !projectId || !project.name || hasInvalidForm) {
      toast.warning("Please fill all fields before submitting.");
      return;
    }

    try {
      await axiosInstance.post(
        "/v2/user/submit",
        {
          userId,
          projectId,
          projectName: project.name,
          reports: project.forms.map((form) => ({
            workType: form.workType,
            taskNumber: form.taskNumber,
            workDescription: form.work || "",
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Submitted all work for "${project.name}"`);
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId
            ? {
              ...proj,
              forms: [
                {
                  workType: "",
                  taskNumber: null,
                  work: "",
                },
              ],
            }
            : proj
        )
      );
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit work.");
    }
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen md:mt-18 mt-14 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center text-green-700 mb-8"
        >
          🧾 Employee Work Report
        </motion.h1>

        <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <Link to={`/report/details/${project.id}/${userId}`}>
                <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2 mb-4">
                  <MdWorkOutline className="text-green-500" />
                  {idx + 1}. {project.name}
                </h2>
              </Link>

              {project.forms.map((form, formIdx) => (
                <div
                  key={formIdx}
                  className="flex flex-col md:flex-row md:items-end gap-4 mb-4"
                >
                  <div className="flex flex-col w-full md:w-1/6">
                    <label className="text-gray-600 text-sm mb-1">
                      Work Type:
                    </label>
                    <select
                      value={form.workType}
                      onChange={(e) =>
                        updateForm(
                          project.id,
                          formIdx,
                          "workType",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded px-2 py-2 cursor-pointer"
                    >
                      {workTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type === "" ? "-- Select --" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col w-full md:w-1/9">
                    <label className="text-gray-600 text-sm mb-1">
                      Task Number:
                    </label>
                    <Select
                      options={taskOptions}
                      value={
                        taskOptions.find(
                          (opt) => opt.value === form.taskNumber
                        ) || null
                      }
                      onChange={(option) =>
                        updateForm(
                          project.id,
                          formIdx,
                          "taskNumber",
                          option ? option.value : null
                        )
                      }
                      classNamePrefix="react-select"
                      placeholder="Select Task"
                    />
                  </div>

                  <div className="flex flex-col w-full md:w-3/5">
                    <label className="text-gray-600 text-sm mb-1">
                      Your Work:
                    </label>
                    <input
                      type="text"
                      value={form.work}
                      onChange={(e) =>
                        updateForm(project.id, formIdx, "work", e.target.value)
                      }
                      placeholder="Describe your work..."
                      className="border border-gray-300 rounded px-2 py-2 cursor-pointer"
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-end gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => addFormRow(project.id)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2 cursor-pointer"
                >
                  <FaPlus /> Add
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => removeFormRow(project.id)}
                  disabled={project.forms.length <= 1}
                  className={`py-2 px-2 rounded flex items-center gap-2 text-white ${project.forms.length <= 1
                    ? "bg-red-300 cursor-not-allowed opacity-50"
                    : "bg-red-600 hover:bg-red-700 cursor-pointer"
                    }`}
                >
                  <FaMinus /> Remove
                </motion.button>

                <div
                  title={
                    !isAllowedTime
                      ? "You can only submit between 1:40 – 2:00 PM or 6:20 – 7:00 PM (IST)"
                      : "Submit your work"
                  }
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: isAllowedTime ? 1.02 : 1 }}
                    onClick={() => handleSubmitWork(project.id)}
                    disabled={!isAllowedTime}
                    className={`py-2 px-4 rounded flex items-center gap-2 text-white transition-all duration-150 ${isAllowedTime
                      ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                      : "bg-green-300 cursor-not-allowed opacity-50"
                      }`}
                  >
                    <FaRegSave /> Submit
                  </motion.button>
                </div>

                {!isAllowedTime && (
                  <p className="text-sm text-red-600 mt-1">
                    ⏳ You can submit reports only between{" "}
                    <strong>1:40 – 2:00 PM</strong> or{" "}
                    <strong>6:20 – 7:00 PM</strong>.
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default Report;
