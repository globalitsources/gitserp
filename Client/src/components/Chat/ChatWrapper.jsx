// // components/Chat/ChatWrapper.jsx
// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { io } from "socket.io-client";
// import ChatPopup from "./ChatPopup";
// import axiosInstance from "../../axiosInstance";

// const socket = io("http://localhost:8000", { autoConnect: false });

// export default function ChatWrapper({ currentUserId }) {
//     console.log("ChatWrapper currentUserId:", currentUserId);
//     const [showChat, setShowChat] = useState(false);
//     const [unreadCounts, setUnreadCounts] = useState({});
//     const location = useLocation();

//     useEffect(() => {
//         if (!currentUserId) return;

//         socket.connect();
//         socket.emit("register_user", currentUserId);

//         // Initialize unread counts from API
//         axiosInstance
//             .get(`/v4/chat/users?currentUserId=${currentUserId}`)
//             .then((res) => {
//                 const initialUnreadCounts = {};
//                 res.data.forEach((user) => {
//                     if (user.unreadCount > 0) {
//                         initialUnreadCounts[user._id] = user.unreadCount;
//                     }
//                 });
//                 setUnreadCounts(initialUnreadCounts);
//             })
//             .catch((err) => console.error("Error fetching unread counts:", err));

//         socket.on("unread_update", ({ from, count }) => {
//             setUnreadCounts((prev) => ({
//                 ...prev,
//                 [from]: count,
//             }));
//         });

//         socket.on("messages_seen", ({ by }) => {
//             setUnreadCounts((prev) => ({
//                 ...prev,
//                 [by]: 0,
//             }));
//         });

//         return () => {
//             socket.disconnect();
//         };
//     }, [currentUserId]);

//     if (location.pathname === "/") return null;

//     const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);

//     return (
//         <>
//             <button
//                 onClick={() => setShowChat(true)}
//                 className="fixed bottom-5 right-5 bg-green-600 text-white border-none rounded-full w-16 h-16 text-2xl cursor-pointer shadow-lg hover:bg-green-700 transition-colors z-[1000] flex items-center justify-center"
//             >
//                 💬
//                 {totalUnread > 0 && (
//                     <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
//                         {totalUnread}
//                     </span>
//                 )}
//             </button>
//             {showChat && (
//                 <ChatPopup
//                     currentUserId={currentUserId}
//                     onClose={() => setShowChat(false)}
//                 />
//             )}
//         </>
//     );
// }


import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChatPopup from "./ChatPopup";

export default function ChatWrapper({ currentUserId: propCurrentUserId, role, unreadCounts, setUnreadCounts }) {
    const [showChat, setShowChat] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    // Determine currentUserId from prop or localStorage
    const userId = localStorage.getItem("userId");
    const adminId = localStorage.getItem("adminId");
    const currentUserId = propCurrentUserId || userId || adminId;

    useEffect(() => {
        // console.log("🟢 ChatWrapper mounted for user:", { currentUserId, role, userId, adminId });

        if (!currentUserId) {
            setError("User not logged in. Please log in again.");
            return;
        }
    }, [currentUserId]);

    // Force re-render when unreadCounts changes
    useEffect(() => {
        const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
        // console.log("📊 ChatWrapper recalculated total unread count:", totalUnread);
    }, [unreadCounts]);

    if (location.pathname === "/") return null;

    const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + (Number(c) || 0), 0);
    // console.log("📊 ChatWrapper total unread count:", totalUnread);

    return (
        <>
            <button
                onClick={() => setShowChat(true)}
                className="fixed bottom-5 right-5 bg-green-600 text-white border-none rounded-full w-16 h-16 text-2xl cursor-pointer shadow-lg hover:bg-green-700 transition-colors z-[1000] flex items-center justify-center"
                disabled={!currentUserId}
            >
                💬
                {totalUnread > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                        {totalUnread}
                    </span>
                )}
            </button>
            {error && (
                <div className="fixed bottom-20 right-5 bg-red-500 text-white p-2 rounded-lg shadow-lg z-[1000]">
                    {error}
                </div>
            )}
            {showChat && currentUserId && (
                <ChatPopup
                    key={currentUserId}
                    currentUserId={currentUserId}
                    role={role}
                    onClose={() => setShowChat(false)}
                />
            )}
        </>
    );
}