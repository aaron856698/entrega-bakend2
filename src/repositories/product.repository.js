import { productModel } from "../models/product.model.js";

class ProductRepository {
    async create(productData) {
        try {
            const product = new productModel(productData);
            return await product.save();
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    async findAll(options = {}) {
        try {
            return await productModel.paginate({}, options);
        } catch (error) {
            throw new Error(`Error finding products: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await productModel.findById(id);
        } catch (error) {
            throw new Error(`Error finding product by id: ${error.message}`);
        }
    }

    async findByCode(code) {
        try {
            return await productModel.findOne({ code });
        } catch (error) {
            throw new Error(`Error finding product by code: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            return await productModel.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            return await productModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    async updateStock(id, quantity) {
        try {
            return await productModel.findByIdAndUpdate(
                id,
                { $inc: { stock: -quantity } },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }

    async findWithFilter(filter, options = {}) {
        try {
            return await productModel.paginate(filter, options);
        } catch (error) {
            throw new Error(`Error finding products with filter: ${error.message}`);
        }
    }
}

export const productRepository = new ProductRepository(); 