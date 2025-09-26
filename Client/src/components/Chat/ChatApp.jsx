import React, { useEffect, useState, useRef, useCallback } from "react";
import { MdDone } from "react-icons/md";
import axiosInstance from "../../axiosInstance";
import { FiSend } from "react-icons/fi";
import moment from "moment";
import socket from "./socket";
import { motion, AnimatePresence } from "framer-motion";


const normalizeMessage = (m) => ({
    ...m,
    _id: String(m._id),
    senderId: String(m.senderId),
    receiverId: String(m.receiverId),
});

export default function ChatApp({ currentUserId, role }) {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const pendingSeen = useRef(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatDate = (date) => {
        const today = moment().startOf("day");
        const msgDate = moment(date).startOf("day");

        if (msgDate.isSame(today, "day")) return "Today";
        if (msgDate.isSame(today.clone().subtract(1, "day"), "day")) return "Yesterday";
        return moment(date).format("DD MMM YYYY");
    };


    useEffect(() => {
        if (!currentUserId) {
            setError("User not logged in. Please log in again.");
            return;
        }

        setIsLoading(true);
        axiosInstance
            .get(`/v4/chat/users?currentUserId=${currentUserId}`)
            .then((res) => {
                // console.log("Users fetched:", res.data);
                const me = res.data.find(
                    (u) => u.userId === currentUserId || (role === "admin" && u.adminId === currentUserId)
                );
                if (me) {
                    setCurrentUser({
                        _id: String(me._id),
                        userId: String(me.userId || currentUserId),
                        name: me.name || "Unknown User",
                    });
                } else {
                    setCurrentUser({ userId: String(currentUserId), name: "Unknown User" });
                    setError("");
                }
                setUsers(res.data.map((u) => ({
                    ...u,
                    _id: String(u._id),
                    userId: String(u.userId),
                })));
            })
            .catch((err) => {
                setError("Failed to load users. Please try again.");
                console.error("Fetch users error:", err);
            })
            .finally(() => setIsLoading(false));
    }, [currentUserId, role]);


    const isMounted = useRef(false);


    useEffect(() => {
        // console.log("🟢 ChatApp mounted for user:", currentUserId);
        isMounted.current = true;

        if (!currentUserId) return;

        const handleConnect = () => {
            // console.log("✅ ChatApp socket connected:", socket.id);
        };

        const handleConnectError = (err) => {
            console.error("❌ ChatApp socket connection error:", err);
            setError("Connection lost. Attempting to reconnect...");
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            // console.log("🧹 ChatApp cleaning up for user:", currentUserId);
            isMounted.current = false;
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [currentUserId]);


    useEffect(() => {
        socket.on("receive_message", (newMessage) => {
            // console.log("📩 receive_message:", newMessage);
            const normalizedMessage = normalizeMessage(newMessage);

            if (
                normalizedMessage.senderId === currentUser?._id ||
                normalizedMessage.receiverId === currentUser?._id
            ) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === normalizedMessage._id)) return prev;
                    return [...prev, normalizedMessage];
                });

                setUsers((prevUsers) =>
                    prevUsers.map((user) => {
                        if (
                            user._id === normalizedMessage.senderId ||
                            user._id === normalizedMessage.receiverId
                        ) {
                            const isActiveChat = activeUser && user._id === activeUser._id;
                            return {
                                ...user,
                                lastMessage: normalizedMessage,
                                unreadCount: isActiveChat ? 0 : (user.unreadCount || 0) + (user._id === normalizedMessage.senderId && normalizedMessage.receiverId === currentUser?._id ? 1 : 0),
                            };
                        }
                        return user;
                    })
                );

                if (normalizedMessage.receiverId === currentUser?._id) {
                    // console.log("✅ Message delivered:", normalizedMessage._id);
                    socket.emit("message_delivered", {
                        messageId: normalizedMessage._id,
                        receiverId: currentUser._id,
                    });

                    if (activeUser?._id === normalizedMessage.senderId) {
                        // console.log("👀 Auto mark seen:", normalizedMessage._id);
                        socket.emit("mark_seen", {
                            senderId: normalizedMessage.senderId,
                            receiverId: currentUser._id,
                        });
                    }
                }
            }
        });

        socket.on("message_delivered", ({ messageId }) => {
            // console.log("📬 message_delivered:", messageId);
            setMessages((prev) =>
                prev.map((m) => (m._id === String(messageId) ? { ...m, status: "delivered" } : m))
            );
        });

        socket.on("message_status_updated", ({ messageId, status }) => {
            // console.log("✏️ message_status_updated:", { messageId, status });
            setMessages((prev) =>
                prev.map((m) => (m._id === String(messageId) ? { ...m, status } : m))
            );
        });

        socket.on("messages_seen", ({ by, messageIds }) => {
            // console.log("👁 messages_seen:", { by, messageIds });
            const normalizedIds = messageIds.map(String);

            setMessages((prev) =>
                prev.map((m) => (normalizedIds.includes(m._id) ? { ...m, status: "seen" } : m))
            );

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === String(by) ? { ...user, unreadCount: 0 } : user
                )
            );
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_delivered");
            socket.off("message_status_updated");
            socket.off("messages_seen");
        };
    }, [activeUser, currentUser]);


    useEffect(() => {
        if (messages.length > 0) {
            // console.log("⬇️ Scrolling to bottom, total messages:", messages.length);
        }
        scrollToBottom();
    }, [messages]);


    useEffect(() => {
        if (messages.length > 0 && pendingSeen.current.size > 0) {
            setMessages((prev) =>
                prev.map((m) =>
                    pendingSeen.current.has(m._id) ? { ...m, status: "seen" } : m
                )
            );
            pendingSeen.current.clear();
        }
    }, [messages]);

    const openChat = useCallback(async (user) => {
        setActiveUser(user);
        setError(null);
        setIsLoading(true);
        try {
            const res = await axiosInstance.get(
                `/v4/chat/messages/${currentUser.userId}/${user.userId}`
            );
            setMessages(res.data.map(normalizeMessage));
            socket.emit("mark_seen", {
                senderId: user.userId,
                receiverId: currentUser.userId,
            });
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === user._id ? { ...u, unreadCount: 0 } : u
                )
            );
        } catch (err) {
            setError("Failed to load messages. Please try again.");
            console.error("Open chat error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const sendMessage = useCallback(async () => {
        if (!msg.trim() || !activeUser) return;

        try {
            const res = await axiosInstance.post("/v4/chat/messages", {
                senderId: currentUser.userId,
                receiverId: activeUser.userId,
                message: msg,
                status: "sent",
            });
            const savedMsg = normalizeMessage(res.data);
            setMessages((prev) => [...prev, savedMsg]);
            socket.emit("send_message", savedMsg);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === activeUser._id
                        ? { ...user, lastMessage: savedMsg }
                        : user
                )
            );
            setMsg("");
        } catch (err) {
            setError("Failed to send message. Please try again.");
            console.error("Error sending message:", err);
        }
    }, [msg, activeUser, currentUser]);

    return (
        <div className="flex h-full bg-gray-100">
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
                {/* <h4 className="p-2.5 m-0 bg-green-600 text-white font-semibold sticky top-0 z-10">
                    Users
                </h4> */}
                {error && <div className="text-red-500 text-center p-2.5">{error}</div>}
                {isLoading && <div className="text-gray-500 text-center p-2.5">Loading users...</div>}
                {!isLoading && users.length === 0 && !error && (
                    <div className="text-gray-500 text-center p-2.5">No users found</div>
                )}
                {users.map((user) => (
                    <motion.div
                        key={user._id}
                        onClick={() => openChat(user)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 cursor-pointer flex items-center justify-between border-b border-gray-200 ${activeUser?._id === user._id ? "bg-green-50" : "bg-white"
                            } hover:bg-green-100 hover:shadow-sm`}
                    >

                        <div>
                            <strong className="text-gray-800 block">{user.name}</strong>
                            <div className="text-xs text-gray-500 truncate ">
                                {user.lastMessage?.message?.slice(0, 10) || "No messages"}
                            </div>
                        </div>
                        {user.unreadCount > 0 && (
                            <span className="inline-block bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 shadow-md">
                                {user.unreadCount}
                            </span>
                        )}
                    </motion.div>
                ))}

            </div>
            <div className="flex-1 flex flex-col">
                {activeUser ? (
                    <>
                        <div className="p-3 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-gray-600 text-sm">Chat with</span>{" "}
                                <strong className="text-gray-900">{activeUser.name}</strong>
                            </div>
                            <span className="text-green-600 text-xs font-medium">● Online</span>
                        </div>

                        <div className="flex-1 p-2.5 overflow-y-auto bg-gray-50">
                            {isLoading && (
                                <div className="text-gray-500 text-center p-2.5">Loading messages...</div>
                            )}
                            {messages.map((m, index) => {
                                const msgDate = formatDate(m.createdAt);
                                const prevMsg = index > 0 ? messages[index - 1] : null;
                                const showDateSeparator = !prevMsg || formatDate(prevMsg.createdAt) !== msgDate;

                                return (
                                    <React.Fragment key={m._id}>
                                        {showDateSeparator && (
                                            <motion.div
                                                className="text-center my-2"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                                                    {msgDate}
                                                </span>
                                            </motion.div>

                                        )}
                                        <motion.div
                                            className={`my-1.5 ${m.senderId === currentUser?.userId ? "text-right" : "text-left"}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >

                                            <div
                                                className={`px-4 py-2 rounded-2xl  shadow-sm break-words ${m.senderId === currentUser?.userId
                                                    ? "bg-green-500 text-white"
                                                    : "bg-white text-gray-800 border border-gray-200"
                                                    }`}
                                            >
                                                <div>{m.message}</div>
                                                <div
                                                    className={`flex items-center mt-1 text-xs ${m.senderId === currentUser?.userId ? "justify-end" : "justify-start"
                                                        }`}
                                                >
                                                    <span className="text-gray-400 ml-1">
                                                        {moment(m.createdAt).format("hh:mm A")}
                                                    </span>
                                                    <div className="flex items-center ml-1">

                                                        {m.status === "sent" && (
                                                            <MdDone size={14} className="text-gray-500" />
                                                        )}
                                                        {m.status === "delivered" && (
                                                            <>
                                                                <MdDone size={14} className="text-gray-300" />
                                                                <MdDone size={14} className="text-gray-300 -ml-1.5" />
                                                            </>
                                                        )}
                                                        {m.status === "seen" && (
                                                            <>
                                                                <MdDone size={14} className="text-blue-500" />
                                                                <MdDone size={14} className="text-blue-500 -ml-[1.03rem]" />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </motion.div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex border-t border-gray-200 bg-white p-2">
                            <input
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                                maxLength={250}
                                className="flex-1 border-none p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500 outline-none text-gray-800 transition"
                            />
                            <motion.button
                                onClick={sendMessage}
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 shadow-md flex items-center justify-center"
                            >
                                <FiSend size={20} />
                            </motion.button>


                        </div>

                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                        Select a user to start chat
                    </div>
                )}
            </div>
        </div>
    );
}