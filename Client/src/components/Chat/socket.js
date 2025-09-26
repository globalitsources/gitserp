import { io } from "socket.io-client";

const socket = io("https://gitserp.in", {
    //const socket = io("http://localhost:8000", {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 300,
    transports: ["websocket"],
});

export default socket;
