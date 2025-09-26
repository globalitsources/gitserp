import Account from "../models/accountsModel.js";

// Add a new client
const addClients = async (req, res) => {
  try {
    const { company, address, gstin, rates, invoiceDate, serviceType } = req.body;

    if (!company || !address || !gstin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAccount = new Account({
      company,
      address,
      gstin,
      rates,
      invoiceDate,
      serviceType,
    });

    const savedAccount = await newAccount.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: "Error adding client", error: error.message });
  }
};

// Get all clients
const allClients = async (req, res) => {
  try {
    const clients = await Account.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error: error.message });
  }
};

//get clients by id
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Account.findById(id);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error: error.message });
  }
};

//update client
const handleUpdate=async(req,res)=>{
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedClient = await Account.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(updatedClient);
    } catch (error) {
    res.status(500).json({ message: "Error updating client", error: error.message });
    }
}

export { addClients, allClients , getClientById ,handleUpdate };

