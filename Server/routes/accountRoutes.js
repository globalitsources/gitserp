import  { addClients, allClients, getClientById, handleUpdate } from '../controllers/accountController.js';
import { Router } from 'express';
const router = Router();


router.post("/addClients",addClients)
router.get("/allClients", allClients);
router.get("/client/:id", getClientById);
router.put("/updateClient/:id", handleUpdate);

export default router;