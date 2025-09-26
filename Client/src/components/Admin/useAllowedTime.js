import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";


const useAllowedTime = () => {
    const [isAllowedTime, setIsAllowedTime] = useState(false);
    const [serverTime, setServerTime] = useState(null);
    const [message, setMessage] = useState("");

    const fetchTimeStatus = async () => {
        try {
            const res = await axiosInstance.get("/v2/user/currentTime");
            setIsAllowedTime(res.data.allowed);
            setMessage(res.data.message);
            setServerTime(res.data.currentIST);
        } catch (error) {
            console.error("Error fetching time status:", error);
        }
    };

    useEffect(() => {
        fetchTimeStatus();
        const interval = setInterval(fetchTimeStatus, 30 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { isAllowedTime, message, serverTime };
};

export default useAllowedTime;
