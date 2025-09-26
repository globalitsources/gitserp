
// import React, { Suspense, lazy } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { AllUsers } from "./components/Admin/AllUsers";
// import ProjectDetails from "./components/Admin/ProjectDetails";
// import AdminAttendance from "./components/Attendance/AdminAttendance";
// import UserAttendance from "./components/Attendance/UserAttendance";
// import ChatWrapper from "./components/Chat/ChatWrapper";


// const Login = lazy(() => import("./components/Login"));
// const Dashboard = lazy(() => import("./pages/Dashboard"));
// const Project = lazy(() => import("./components/Project"));
// const Report = lazy(() => import("./components/Report"));
// const ReportDetails = lazy(() => import("./components/ReportDetails"));
// const AdminNav = lazy(() => import("./components/Admin/AdminNav"));
// const AddUser = lazy(() => import("./components/Admin/AddUser"));
// const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
// const AssignedProject = lazy(() => import("./components/Admin/AssignedProject"));
// const AdminReport = lazy(() => import("./components/Admin/AdminReport"));
// const TodayReport = lazy(() => import("./components/Admin/TodayReport"));
// const AddProject = lazy(() => import("./components/Admin/AddProject"));




// function App() {
//   const role = localStorage.getItem("role");
//   const userId = localStorage.getItem("userId");
//   const adminId = localStorage.getItem("adminId");
//   const currentUserId = role === "admin" ? adminId : userId;
//   console.log("App localStorage:", { userId, adminId, role, currentUserId });

//   if (!currentUserId) {
//     console.error("No valid userId or adminId found in localStorage");
//   }

//   return (
//     <Router>
//       <Suspense
//         fallback={
//           <div className="text-center mt-10 text-gray-600">Loading...</div>
//         }
//       >
//         <Routes>
//           <Route path="/" element={<Login />} />

//           {/* Protected Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/project"
//             element={
//               <ProtectedRoute>
//                 <Project />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/report"
//             element={
//               <ProtectedRoute>
//                 <Report />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/report/details/:projectId/:userId"
//             element={
//               <ProtectedRoute>
//                 <ReportDetails />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/adminNav"
//             element={
//               <ProtectedRoute>
//                 <AdminNav />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/users"
//             element={
//               <ProtectedRoute>
//                 <AllUsers />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/addUser"
//             element={
//               <ProtectedRoute>
//                 <AddUser />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/adminDashboard"
//             element={
//               <ProtectedRoute>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/assignProject"
//             element={
//               <ProtectedRoute>
//                 <AssignedProject />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/adminReport"
//             element={
//               <ProtectedRoute>
//                 <AdminReport />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/todayReport"
//             element={
//               <ProtectedRoute>
//                 <TodayReport />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/addProject"
//             element={
//               <ProtectedRoute>
//                 <AddProject />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/attendance"
//             element={
//               <ProtectedRoute>
//                 <AdminAttendance />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/projectDetails/:id"
//             element={
//               <ProtectedRoute>
//                 <ProjectDetails />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/attendance/:id"
//             element={
//               <ProtectedRoute>
//                 <UserAttendance />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="*"
//             element={
//               <div className="text-center mt-10 text-red-600">
//                 404 Not Found
//               </div>
//             }
//           />
//         </Routes>
//        <ChatWrapper currentUserId={currentUserId} role={role} />
//       </Suspense>
//     </Router>
//   );
// }

// export default App;
import React, { Suspense, lazy, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AllUsers } from "./components/Admin/AllUsers";
import ProjectDetails from "./components/Admin/ProjectDetails";
import AdminAttendance from "./components/Attendance/AdminAttendance";
import UserAttendance from "./components/Attendance/UserAttendance";
import ChatWrapper from "./components/Chat/ChatWrapper";
import socket from "./components/Chat/socket";
import axiosInstance from "./axiosInstance";
import MainDashboard from "./pages/MainDashboard";
import AccountsDashboard from "./pages/AccountsDashboard";
import AddClients from "./components/Accounts/AddClients";
import Inovice from "./components/Accounts/Invoice";

const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Project = lazy(() => import("./components/Project"));
const Report = lazy(() => import("./components/Report"));
const ReportDetails = lazy(() => import("./components/ReportDetails"));
const AdminNav = lazy(() => import("./components/Admin/AdminNav"));
const AddUser = lazy(() => import("./components/Admin/AddUser"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AssignedProject = lazy(() =>
  import("./components/Admin/AssignedProject")
);
const AdminReport = lazy(() => import("./components/Admin/AdminReport"));
const TodayReport = lazy(() => import("./components/Admin/TodayReport"));
const AddProject = lazy(() => import("./components/Admin/AddProject"));

function AppRoutes({ currentUserId, role, unreadCounts, setUnreadCounts }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/details/:projectId/:userId"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminNav"
          element={
            <ProtectedRoute>
              <AdminNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addUser"
          element={
            <ProtectedRoute>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignProject"
          element={
            <ProtectedRoute>
              <AssignedProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminReport"
          element={
            <ProtectedRoute>
              <AdminReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todayReport"
          element={
            <ProtectedRoute>
              <TodayReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addProject"
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projectDetails/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/:id"
          element={
            <ProtectedRoute>
              <UserAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mainDashboard"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountDashboard"
          element={
            <ProtectedRoute>
              <AccountsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addClients"
          element={
            <ProtectedRoute>
              <AddClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/:clientId"
          element={
            <ProtectedRoute>
              <Inovice />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="text-center mt-10 text-red-600">404 Not Found</div>
          }
        />
      </Routes>

      {!isLoginPage && (
        <ChatWrapper
          currentUserId={currentUserId}
          role={role}
          unreadCounts={unreadCounts}
          setUnreadCounts={setUnreadCounts}
        />
      )}
    </>
  );
}

function App() {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const adminId = localStorage.getItem("adminId");
  const currentUserId = role === "admin" ? adminId : userId;
  const [unreadCounts, setUnreadCounts] = useState({});
  const token = localStorage.getItem("token");
  const isAuthenticated = !!(token && currentUserId && role);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("register_user", String(currentUserId));

    const handleConnect = () => {
      socket.emit("register_user", String(currentUserId));
    };

    const handleConnectError = (err) => {
      console.error("❌ App socket connection error:", err);
    };

    const handleUnreadUpdate = ({ from, count }) => {
      setUnreadCounts((prev) => ({ ...prev, [String(from)]: count }));
    };

    const handleMessagesSeen = ({ by }) => {
      setUnreadCounts((prev) => ({ ...prev, [String(by)]: 0 }));
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("unread_update", handleUnreadUpdate);
    socket.on("messages_seen", handleMessagesSeen);

    axiosInstance
      .get(`/v4/chat/users?currentUserId=${currentUserId}`)
      .then((res) => {
        const initialUnreadCounts = {};
        res.data.forEach((user) => {
          if (user.unreadCount > 0) {
            initialUnreadCounts[String(user._id)] = user.unreadCount;
          }
        });
        setUnreadCounts(initialUnreadCounts);
      })
      .catch((err) => {
        console.error("Fetch unread counts error:", err);
      });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("unread_update", handleUnreadUpdate);
      socket.off("messages_seen", handleMessagesSeen);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [currentUserId, isAuthenticated]);

  return (
    <Router>
      <Suspense
        fallback={
          <div className="text-center mt-10 text-gray-600">Loading...</div>
        }
      >
        <AppRoutes
          currentUserId={currentUserId}
          role={role}
          unreadCounts={unreadCounts}
          setUnreadCounts={setUnreadCounts}
        />
      </Suspense>
    </Router>
  );
}

export default App;
