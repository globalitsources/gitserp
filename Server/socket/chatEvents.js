import Message from "../models/messageModel.js";
import Admin from "../models/adminModel.js";
import { resolveToObjectId } from "../controllers/chatController.js";

const onlineUsers = new Map();

const chatEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register_user", async (userId) => {
      const userObjectId = await resolveToObjectId(userId);
      if (!userObjectId) {
        console.error(`Failed to resolve userId to ObjectId: ${userId}`);
        return;
      }

      console.log(`🔄 Attempting to register user: ${userId}, Socket: ${socket.id}`);

      if (onlineUsers.has(userId)) {
        const socketSet = onlineUsers.get(userId);
        console.log(` Found ${socketSet.size} existing sockets for user ${userId}: ${[...socketSet].join(", ")}`);
        for (const oldSocketId of socketSet) {
          if (oldSocketId !== socket.id) {
            try {
              const oldSocket = io.sockets.sockets.get(oldSocketId);
              if (oldSocket) {
                console.log(`Disconnecting old socket ${oldSocketId} for user ${userId}`);
                oldSocket.disconnect(true);
              } else {
                console.log(` Old socket ${oldSocketId} not found, removing from set`);
                socketSet.delete(oldSocketId);
              }
            } catch (err) {
              console.error(`Error disconnecting old socket ${oldSocketId} for user ${userId}:`, err);
              socketSet.delete(oldSocketId);
            }
          }
        }
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      socket.join(userId);
      console.log(` Registered: ${userId} with socket: ${socket.id}, Total sockets: ${onlineUsers.get(userId).size}`);


      const unreadCounts = await Message.aggregate([
        { $match: { receiverId: userObjectId, status: { $ne: "seen" } } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]);
      unreadCounts.forEach(({ _id, count }) => {
        console.log(` Emitting initial unread_update to ${userId} (Socket: ${socket.id}) from ${_id}:`, { count });
        io.to(userId).emit("unread_update", { from: _id.toString(), count });
      });
    });

    socket.on("send_message", async (data) => {
      const { senderId, receiverId, message, _id } = data;
      try {
        const senderObjectId = await resolveToObjectId(senderId);
        const receiverObjectId = await resolveToObjectId(receiverId);
        if (!senderObjectId || !receiverObjectId) {
          console.error("Invalid sender or receiver ID", { senderId, receiverId });
          return;
        }

        const newMsg = await Message.findById(_id);
        if (!newMsg) {
          console.error("Message not found:", _id);
          return;
        }

        if (onlineUsers.has(senderId)) {
          console.log(` Emitting receive_message to sender ${senderId}, Active sockets: ${[...onlineUsers.get(senderId)].join(", ")}`);
          io.to(senderId).emit("receive_message", newMsg);
          io.to(senderId).emit("message_status_updated", {
            messageId: newMsg._id.toString(),
            status: "sent",
          });
        } else {
          console.log(` Sender ${senderId} not online`);
        }

        if (onlineUsers.has(receiverId)) {
          newMsg.status = "delivered";
          await newMsg.save();
          console.log(`Emitting receive_message to receiver ${receiverId}, Active sockets: ${[...onlineUsers.get(receiverId)].join(", ")}`);
          io.to(receiverId).emit("receive_message", newMsg);
          io.to(senderId).emit("message_delivered", { messageId: newMsg._id.toString() });
          io.to(receiverId).emit("message_status_updated", {
            messageId: newMsg._id.toString(),
            status: "delivered",
          });
        } else {
          console.log(` Receiver ${receiverId} not online`);
        }

        const unreadCount = await Message.countDocuments({
          senderId: senderObjectId,
          receiverId: receiverObjectId,
          status: { $ne: "seen" },
        });
        console.log(` Unread count for ${receiverId} from ${senderId}: ${unreadCount}`);
        if (onlineUsers.has(receiverId)) {
          console.log(` Emitting unread_update to ${receiverId} (Socket: ${socket.id}):`, { from: String(senderId), count: unreadCount });
          io.to(receiverId).emit("unread_update", { from: String(senderId), count: unreadCount });
        } else {
          console.log(`No unread_update emitted: receiver ${receiverId} not online`);
        }
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    socket.on("mark_seen", async ({ senderId, receiverId }) => {
      try {
        const senderObjectId = await resolveToObjectId(senderId);
        const receiverObjectId = await resolveToObjectId(receiverId);
        if (!senderObjectId || !receiverObjectId) {
          console.error("Invalid sender or receiver ID", { senderId, receiverId });
          return;
        }

        const unseenMessages = await Message.find({
          senderId: senderObjectId,
          receiverId: receiverObjectId,
          status: { $ne: "seen" },
        }).select("_id");

        if (unseenMessages.length === 0) {
          console.log(` No unseen messages to mark for sender ${senderId}, receiver ${receiverId}`);
          return;
        }

        await Message.updateMany(
          { _id: { $in: unseenMessages.map((m) => m._id) } },
          { $set: { status: "seen" } }
        );

        const seenIds = unseenMessages.map((m) => m._id.toString());
        console.log(`👁 Marked ${seenIds.length} messages as seen for sender ${senderId}, receiver ${receiverId}`);

        if (onlineUsers.has(senderId)) {
          console.log(` Emitting messages_seen to sender ${senderId} (Socket: ${socket.id}), Active sockets: ${[...onlineUsers.get(senderId)].join(", ")}`);
          io.to(senderId).emit("messages_seen", { by: String(receiverId), messageIds: seenIds });
        } else {
          console.log(` No messages_seen emitted: sender ${senderId} not online`);
        }

        const unreadCount = await Message.countDocuments({
          senderId: senderObjectId,
          receiverId: receiverObjectId,
          status: { $ne: "seen" },
        });
        console.log(` Unread count after mark_seen for ${receiverId} from ${senderId}: ${unreadCount}`);

        if (onlineUsers.has(receiverId)) {
          console.log(` Emitting unread_update to ${receiverId} (Socket: ${socket.id}):`, { from: String(senderId), count: unreadCount });
          io.to(receiverId).emit("unread_update", { from: String(senderId), count: unreadCount });
        }
        if (onlineUsers.has(senderId)) {
          console.log(`Emitting unread_update to ${senderId} (Socket: ${socket.id}):`, { from: String(receiverId), count: unreadCount });
          io.to(senderId).emit("unread_update", { from: String(receiverId), count: unreadCount });
        }
      } catch (err) {
        console.error("mark_seen error:", err);
      }
    });

    socket.on("disconnect", () => {
      let userRemoved = false;
      for (let [userId, socketSet] of onlineUsers.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          console.log(` Removed socket ${socket.id} for user ${userId}, Remaining sockets: ${socketSet.size}`);
          if (socketSet.size === 0) {
            onlineUsers.delete(userId);
            console.log(` Removed user ${userId} from onlineUsers, no sockets left`);
            userRemoved = true;
          }
          break;
        }
      }
      if (!userRemoved) {
        console.log(` Disconnect event for ${socket.id} not associated with any user`);
      }
      console.log(" User disconnected:", socket.id, "Total online users:", onlineUsers.size);
    });
  });
};

export default chatEvents;