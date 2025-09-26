import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const AccountsNav = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('userName');
        if (name) setUserName(name);
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

    return (
        <motion.div
            className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-2 z-50"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between">
                <Link to="/mainDashboard">
                    {" "}
                    <img
                        src={logo}
                        className="h-12 w-auto max-h-15 object-contain"
                        alt="Logo"
                    />
                </Link>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-green-600 text-2xl focus:outline-none"
                    >
                        {menuOpen ? <HiX /> : <HiMenu />}
                    </motion.button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6 text-sm md:text-base">
                    {/* <Link
                        to="/invoice"
                        className="text-green-700 hover:text-green-900 font-medium"
                    >
                        Invoice
                    </Link> */}

                    <Link
                        to="/addClients"
                        className="text-green-700 hover:text-green-900 font-medium"
                    >
                        Add Clients
                    </Link>

                    <span className="text-green-600 font-bold hidden sm:inline">
                        {userName}
                    </span>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
                    >
                        Logout
                    </motion.button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="md:hidden mt-4 space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link
                            to="/invoices"
                            className="block text-green-700 hover:text-green-900 font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Invoice
                        </Link>

                        <Link
                            to="/add-clients"
                            className="block text-green-700 hover:text-green-900 font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Add Clients
                        </Link>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
                        >
                            Logout
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AccountsNav;
