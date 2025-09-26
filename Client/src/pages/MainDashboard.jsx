import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChartLine,
    FaCode,
    FaUsers,
    FaBullhorn,
    FaGoogle,
    FaCogs,
} from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.jpg';
import axiosInstance from '../axiosInstance'; // Ensure this is correctly imported

// Card items with label, optional route, icon, and role identifier
const cardItems = [
    { label: 'SEO', to: '/adminDashboard', icon: <FaChartLine size={28} />, role: 'user' },
    { label: 'Developer', icon: <FaCode size={28} />, role: 'dev' },
    { label: 'Sales & Marketing', icon: <FaUsers size={28} />, role: 'sales' },
    { label: 'Accounts', to: '/accountDashboard', icon: <FaBullhorn size={28} />, role: 'accounts' },
    { label: 'Google Add', icon: <FaGoogle size={28} />, role: 'ads' },
    { label: 'Operations', icon: <FaCogs size={28} />, role: 'operations' },
];

const MainDashboard = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const name = localStorage.getItem('userName');
        const id = localStorage.getItem('userId');
        if (name) setUserName(name);
        if (id) setUserId(id);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get("/v1/admin/users");
                setUsers(res.data);
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
            }
        };
        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        document.cookie.split(';').forEach((cookie) => {
            document.cookie = cookie
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
        });
        window.location.href = '/';
    };

    const getUserCountByRole = (role) => {
        return users.filter((user) => user.role?.toLowerCase() === role.toLowerCase()).length;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <motion.div
                className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-2 z-50"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center justify-between">
                    <img src={logo} className="h-12 w-auto object-contain" alt="Logo" />

                    <div className="md:hidden">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-green-600 text-2xl focus:outline-none"
                        >
                            {menuOpen ? <HiX /> : <HiMenu />}
                        </motion.button>
                    </div>

                    <div className="hidden md:flex items-center space-x-6 text-sm md:text-base">
                        <span className="text-green-600 font-bold hidden sm:inline">
                            {userName}
                        </span>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
                        >
                            Logout
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            className="md:hidden mt-4 space-y-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
                            >
                                Logout
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Main Content */}
            <div className="bg-gradient-to-r from-green-50 to-green-200 p-4 rounded-xl min-h-screen md:mt-20">
                <div className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {cardItems.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className="bg-gradient-to-br from-white via-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-2xl border border-transparent hover:border-green-500 transition-all duration-300"
                            >
                                <div className="flex flex-col items-center justify-center text-center space-y-2">
                                    {item.to ? (
                                        <Link to={item.to} className="flex flex-col items-center space-y-2 text-gray-800">
                                            <div className="text-green-600">{item.icon}</div>
                                            <span className="text-lg font-semibold">{item.label}</span>
                                            <span className="text-sm text-gray-600">
                                                Users: {getUserCountByRole(item.role)}
                                            </span>
                                        </Link>
                                    ) : (
                                        <>
                                            <div className="text-green-600">{item.icon}</div>
                                            <span className="text-lg font-semibold text-gray-800">{item.label}</span>
                                            <span className="text-sm text-gray-600">
                                                Users: {getUserCountByRole(item.role)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;
