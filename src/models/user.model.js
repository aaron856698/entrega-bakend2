import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    role: { type: String, default: "user" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

userSchema.pre("save", function(next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

export const userModel = mongoose.model("users", userSchema);