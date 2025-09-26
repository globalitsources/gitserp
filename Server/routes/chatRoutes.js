import express from "express";
import { getUsers, getMessages, sendMessage } from "../controllers/chatController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();


router.get("/users",auth, getUsers);
router.get("/messages/:senderId/:receiverId",auth, getMessages);
router.post("/messages", auth,sendMessage);

export default router;
