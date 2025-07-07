import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts", default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});
userSchema.plugin(mongoosePaginate)

userSchema.pre("save", function(next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

export const userModel = mongoose.model(userCollection, userSchema);