import { Router } from "express";
import { userModel } from "../models/user.model.js";

const router = Router();


router.get("/", async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post("/", async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).json({ error: "El email ya está registrado" });
        const user = new userModel({ first_name, last_name, email, age, password });
        await user.save();
        res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { first_name, last_name, email, age, role } = req.body;
        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            { first_name, last_name, email, age, role },
            { new: true }
        ).select("-password");
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 