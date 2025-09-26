// import mongoose from "mongoose";
// import Admin from "../models/adminModel.js";
// import Message from "../models/messageModel.js";

// // 🔑 Helper: convert userId or _id → Mongo ObjectId
// const resolveToObjectId = async (id) => {
//     if (mongoose.Types.ObjectId.isValid(id)) {
//         return id; // already an _id
//     }
//     const user = await Admin.findOne({ userId: id }, "_id");
//     return user ? user._id : null;
// };


// const getUsers = async (req, res) => {
//     try {
//         const { currentUserId } = req.query;

//         let currentUser;
//         if (mongoose.Types.ObjectId.isValid(currentUserId)) {
//             currentUser = await Admin.findById(currentUserId);
//         }
//         if (!currentUser) {
//             currentUser = await Admin.findOne({ userId: currentUserId });
//         }

//         if (!currentUser) {
//             return res.status(404).json({ error: "Current user not found" });
//         }

//         const users = await Admin.find({}, "_id name userId role").lean();

//         const result = await Promise.all(
//             users.map(async (user) => {
//                 if (user._id.toString() === currentUser._id.toString()) return null;

//                 const lastMessage = await Message.findOne({
//                     $or: [
//                         { senderId: currentUser._id, receiverId: user._id },
//                         { senderId: user._id, receiverId: currentUser._id },
//                     ],
//                 })
//                     .sort({ createdAt: -1 })
//                     .lean();

//                 const unreadCount = await Message.countDocuments({
//                     senderId: user._id,
//                     receiverId: currentUser._id,
//                     status: { $ne: "seen" },
//                 });

//                 return { ...user, lastMessage, unreadCount };
//             })
//         );

//         res.json(result.filter(Boolean));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };


// // ✅ Get messages between two users (supports userId or _id)
// const getMessages = async (req, res) => {
//     const { senderId, receiverId } = req.params;
//     try {
//         const senderObjectId = await resolveToObjectId(senderId);
//         const receiverObjectId = await resolveToObjectId(receiverId);

//         if (!senderObjectId || !receiverObjectId) {
//             return res.status(404).json({ error: "Sender or Receiver not found" });
//         }

//         const messages = await Message.find({
//             $or: [
//                 { senderId: senderObjectId, receiverId: receiverObjectId },
//                 { senderId: receiverObjectId, receiverId: senderObjectId },
//             ],
//         }).sort({ createdAt: 1 });

//         res.json(messages);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // ✅ Send a new message (supports userId or _id)
// const sendMessage = async (req, res) => {
//     const { senderId, receiverId, message } = req.body;
//     try {
//         const senderObjectId = await resolveToObjectId(senderId);
//         const receiverObjectId = await resolveToObjectId(receiverId);

//         if (!senderObjectId || !receiverObjectId) {
//             return res.status(404).json({ error: "Sender or Receiver not found" });
//         }

//         const newMessage = new Message({
//             senderId: senderObjectId,
//             receiverId: receiverObjectId,
//             message,
//         });

//         await newMessage.save();
//         res.status(201).json(newMessage);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export { sendMessage, getMessages, getUsers };


import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import Message from "../models/messageModel.js";

const resolveToObjectId = async (id) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
        return id;
    }
    const user = await Admin.findOne({ $or: [{ userId: id }, { adminId: id }] }, "_id userId adminId role");
    console.log("resolveToObjectId:", { id, resolved: user ? user._id : null });
    return user ? user._id : null;
};

const getUsers = async (req, res) => {
    try {
        const { currentUserId } = req.query;
        console.log("getUsers:", { currentUserId });
        const currentUserObjectId = await resolveToObjectId(currentUserId);
        if (!currentUserObjectId) {
            return res.status(404).json({ error: "Current user not found" });
        }

        const users = await Admin.find(
            { _id: { $ne: currentUserObjectId } },
            "_id name userId adminId role"
        ).lean();

        const result = await Promise.all(
            users.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: currentUserObjectId, receiverId: user._id },
                        { senderId: user._id, receiverId: currentUserObjectId },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .lean();

                const unreadCount = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: currentUserObjectId,
                    status: { $ne: "seen" },
                });

                return { ...user, lastMessage, unreadCount };
            })
        );

        res.json(result.filter(Boolean));
    } catch (err) {
        console.error("getUsers error:", err);
        res.status(500).json({ error: err.message });
    }
};

const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        const senderObjectId = await resolveToObjectId(senderId);
        const receiverObjectId = await resolveToObjectId(receiverId);

        if (!senderObjectId || !receiverObjectId) {
            return res.status(404).json({ error: "Sender or Receiver not found" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: senderObjectId, receiverId: receiverObjectId },
                { senderId: receiverObjectId, receiverId: senderObjectId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ error: err.message });
    }
};

const sendMessage = async (req, res) => {
    const { senderId, receiverId, message, status = "sent" } = req.body;
    try {
        const senderObjectId = await resolveToObjectId(senderId);
        const receiverObjectId = await resolveToObjectId(receiverId);

        if (!senderObjectId || !receiverObjectId) {
            return res.status(404).json({ error: "Sender or Receiver not found" });
        }

        const newMessage = new Message({
            senderId: senderObjectId,
            receiverId: receiverObjectId,
            message,
            status,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error("sendMessage error:", err);
        res.status(500).json({ error: err.message });
    }
};

const markDelivered = async (req, res) => {
    try {
        const { messageId, receiverId } = req.body;
        const receiverObjectId = await resolveToObjectId(receiverId);
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.receiverId.toString() === receiverObjectId.toString() && message.status === "sent") {
            message.status = "delivered";
            await message.save();
            res.json({ messageId, status: "delivered" });
        } else {
            res.status(400).json({ error: "Invalid request" });
        }
    } catch (err) {
        console.error("markDelivered error:", err);
        res.status(500).json({ error: err.message });
    }
};

export { resolveToObjectId, getUsers, getMessages, sendMessage, markDelivered };
