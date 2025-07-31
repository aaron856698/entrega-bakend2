import { userModel } from "../models/user.model.js";

class UserRepository {
    async create(userData) {
        return await userModel.create(userData);
    }

    async findByEmail(email) {
        return await userModel.findOne({ email });
    }

    async findById(id) {
        return await userModel.findById(id);
    }

    async updatePassword(userId, hashedPassword) {
        return await userModel.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );
    }

    async updateResetToken(userId, resetToken, resetTokenExpiry) {
        return await userModel.findByIdAndUpdate(
            userId,
            { 
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpiry
            },
            { new: true }
        );
    }

    async findByResetToken(token) {
        return await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
    }

    async clearResetToken(userId) {
        return await userModel.findByIdAndUpdate(
            userId,
            { 
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            },
            { new: true }
        );
    }
}

export const userRepository = new UserRepository(); 