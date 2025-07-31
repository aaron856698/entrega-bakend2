import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "../passport.js";
import { userRepository } from "../repositories/user.repository.js";
import { UserDTO, UserProfileDTO } from "../dtos/user.dto.js";
import { emailService } from "../services/email.service.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretJWTkey";

router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        
        const exists = await userRepository.findByEmail(email);
        if (exists) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }
        
        const user = await userRepository.create({ first_name, last_name, email, age, password });
        const userDTO = UserDTO.fromUser(user);
        
        res.status(201).json({ 
            message: "Usuario registrado correctamente",
            user: userDTO
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
    try {
        const token = jwt.sign(
            { id: req.user._id, role: req.user.role, email: req.user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        const userDTO = UserDTO.fromUser(req.user);
        res.json({ token, user: userDTO });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/current", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const userProfileDTO = UserProfileDTO.fromUser(req.user);
        res.json({ user: userProfileDTO });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email es requerido" });
        }
        
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        
        await userRepository.updateResetToken(user._id, resetToken, resetTokenExpiry);
        
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
        
        if (emailSent) {
            res.json({ message: "Email de recuperación enviado" });
        } else {
            res.status(500).json({ error: "Error enviando email" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
        }
        
        const user = await userRepository.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: "Token inválido o expirado" });
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        
        if (bcrypt.compareSync(newPassword, user.password)) {
            return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior" });
        }
        
        await userRepository.updatePassword(user._id, hashedPassword);
        await userRepository.clearResetToken(user._id);
        
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 