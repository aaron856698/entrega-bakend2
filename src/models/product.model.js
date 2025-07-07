import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    category: String,
    stock: Number,
    available: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: "/images/logo.svg"
    }
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model("products", productSchema);