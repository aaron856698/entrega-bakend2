import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
});

export const cartModel = mongoose.model("carts", cartSchema);