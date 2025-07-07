import { Router } from "express";
import { userModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "../passport.js";

const router = Router();
const JWT_SECRET = "secretJWTkey"; 


router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).json({ error: "El email ya está registrado" });
        const user = new userModel({ first_name, last_name, email, age, password });
        await user.save();
        res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/current", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 