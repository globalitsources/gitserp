import React, { useState, useEffect } from 'react';
import AccountsNav from './AccountsNav';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../../axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FaFileInvoice, FaEdit } from 'react-icons/fa';



const AddClients = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);


    const [clientData, setClientData] = useState({
        company: '',
        address: '',
        gstin: '',
        rates: '',
        invoiceDate: null,
        serviceType: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get('/v5/accounts/allClients');
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        fetchClients();
    }, []);
    const handleGenerateInvoice = (client) => {
        console.log('Generating invoice for:', client);
        navigate(`/invoice/${client._id}`);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setClientData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDateChange = (date) => {
        setClientData((prevData) => ({
            ...prevData,
            invoiceDate: date,
        }));
    };
    const handleUpdate = (client) => {
        setSelectedClient(client);
        setIsEditing(true);
        setClientData({
            company: client.company,
            address: client.address,
            gstin: client.gstin,
            rates: client.rates,
            invoiceDate: client.invoiceDate ? new Date(client.invoiceDate) : null,
            serviceType: client.serviceType,
        });
        setIsModalOpen(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && selectedClient) {

                await axiosInstance.put(`/v5/accounts/updateClient/${selectedClient._id}`, clientData);
            } else {

                await axiosInstance.post('/v5/accounts/addClients', clientData);
            }

            const response = await axiosInstance.get('/v5/accounts/allClients');
            setClients(response.data);

            setClientData({
                company: '',
                address: '',
                gstin: '',
                rates: '',
                invoiceDate: null,
                serviceType: '',
            });
            setIsEditing(false);
            setSelectedClient(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AccountsNav />

            <div className="mt-24 max-w-7xl mx-auto text-center">
                <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow mb-6"
                >
                    Add Clients
                </motion.button>

                <h1 className="text-2xl font-bold text-green-600 mb-4">All Clients</h1>

                {/* Search bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by company name..."
                        onChange={(e) => {
                            const search = e.target.value.toLowerCase();
                            setClients((prev) =>
                                prev.map((c) => ({ ...c, hidden: !c.company.toLowerCase().includes(search) }))
                            );
                        }}
                        className="px-4 py-2 w-full max-w-md border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse">
                        <thead>
                            <tr className="bg-green-700 text-white">
                                <th className="px-4 py-2 cursor-pointer">Company</th>
                                <th className="px-4 py-2">Address</th>
                                <th className="px-4 py-2">GSTIN</th>
                                <th className="px-4 py-2">Rates</th>
                                <th className="px-4 py-2 cursor-pointer">Invoice Date</th>
                                <th className="px-4 py-2">Service Type</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-gray-500">
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                                {clients.map((client, index) => (
                                    !client.hidden && (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm hover:bg-green-50 transition-colors"
                                        >
                                            <td className="border px-4 py-2">{client.company}</td>
                                            <td className="border px-4 py-2">{client.address}</td>
                                            <td className="border px-4 py-2">{client.gstin}</td>
                                            <td className="border px-4 py-2">{client.rates}</td>
                                            <td className="border px-4 py-2">
                                                {client.invoiceDate ? moment(client.invoiceDate).format('DD/MM/YYYY') : '-'}
                                            </td>
                                            <td className="border px-4 py-2">{client.serviceType}</td>
                                            <td className="border px-4 py-3 flex gap-2">
                                                <button
                                                    onClick={() => handleGenerateInvoice(client)}
                                                    className="bg-green-500 cursor-pointer text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center"
                                                    title="Generate Invoice"
                                                >
                                                    <FaFileInvoice size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(client)}
                                                    className="bg-blue-500 cursor-pointer text-white p-2 rounded hover:bg-blue-600 transition flex items-center justify-center"
                                                    title="Update"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                            </td>

                                        </motion.tr>
                                    )
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>


                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl text-left"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold text-green-700 mb-6">
                                    {isEditing ? 'Update Client' : 'Add New Client'}
                                </h2>


                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            id="company"
                                            value={clientData.company}
                                            onChange={handleChange}
                                            placeholder="Enter company name"
                                            className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            value={clientData.address}
                                            onChange={handleChange}
                                            placeholder="Enter address"
                                            className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">
                                                GSTIN/UIN
                                            </label>
                                            <input
                                                type="text"
                                                name="gstin"
                                                id="gstin"
                                                value={clientData.gstin}
                                                onChange={handleChange}
                                                placeholder="Enter GSTIN/UIN"
                                                className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="rates" className="block text-sm font-medium text-gray-700 mb-1">
                                                Rates
                                            </label>
                                            <input
                                                type="number"
                                                name="rates"
                                                id="rates"
                                                value={clientData.rates}
                                                onChange={handleChange}
                                                placeholder="Enter service rates"
                                                className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Invoice Date
                                            </label>
                                            <DatePicker
                                                selected={clientData.invoiceDate}
                                                onChange={handleDateChange}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="DD/MM/YYYY"
                                                className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                                id="invoiceDate"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                                                Service Type
                                            </label>
                                            <input
                                                type="text"
                                                name="serviceType"
                                                id="serviceType"
                                                value={clientData.serviceType}
                                                onChange={handleChange}
                                                placeholder="Enter service type"
                                                className="w-full border border-gray-300 px-4 py-2 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                        >
                                            {loading ? 'Saving...' : isEditing ? 'Update Client' : 'Save Client'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </>
    );
};

export default AddClients;
