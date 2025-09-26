const ipCheck = (req, res, next) => {
    const allowedIps = ["122.176.159.43", "127.0.0.1","122.161.53.140"];

    let clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;


    if (clientIp === "::1" || clientIp === "127.0.0.1") {
        clientIp = "127.0.0.1";
    }


    if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.replace("::ffff:", "");
    }

    console.log("Client IP:", clientIp);

    if (!allowedIps.includes(clientIp)) {
        return res.status(403).json({ error: "Access denied from this IP" });
    }

    next();
};

export default ipCheck;
