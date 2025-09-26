
import Query from '../models/queryModel.js'
const createQuery = async (req, res) => {
    try {
        const { userId, message } = req.body;
        console.log(req.body)
        if (!userId || !message) {
            return res.status(400).json({ error: "userId and message are required" });
        }

        const query = new Query({ userId, message });
        await query.save();

        res.status(201).json({ message: "Query created successfully", query });
    } catch (err) {
        console.error("Error creating query:", err);
        res.status(500).json({ error: "Failed to create query" });
    }
};

const getAllQueries = async (req, res) => {
    try {
        const queries = await Query.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(queries);
    } catch (err) {
        console.error("Error fetching queries:", err);
        res.status(500).json({ error: "Failed to fetch queries" });
    }
};

const getUserQueries = async (req, res) => {
    try {
        const { userId } = req.params;
        const queries = await Query.find({ userId }).sort({ createdAt: -1 });

        res.json(queries);
    } catch (err) {
        console.error("Error fetching user queries:", err);
        res.status(500).json({ error: "Failed to fetch user queries" });
    }
};

const updateQueryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("Update request:", req.params, req.body);

        if (!["pending", "executed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const query = await Query.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!query) {
            return res.status(404).json({ error: "Query not found" });
        }

        res.json({ message: "Query status updated", query });
    } catch (err) {
        console.error("Error updating query:", err);
        res.status(500).json({ error: "Failed to update query" });
    }
};

const deleteQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const query = await Query.findByIdAndDelete(id);

        if (!query) {
            return res.status(404).json({ error: "Query not found" });
        }

        res.json({ message: "Query deleted successfully" });
    } catch (err) {
        console.error("Error deleting query:", err);
        res.status(500).json({ error: "Failed to delete query" });
    }
};


export {
    createQuery,
    getAllQueries,
    getUserQueries,
    updateQueryStatus,
    deleteQuery,
};
