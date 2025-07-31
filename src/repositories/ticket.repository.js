import { ticketModel } from "../models/ticket.model.js";
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";
import { userModel } from "../models/user.model.js";

class TicketRepository {
    async create(ticketData) {
        try {
            const ticket = new ticketModel(ticketData);
            return await ticket.save();
        } catch (error) {
            throw new Error(`Error creating ticket: ${error.message}`);
        }
    }

    async generateTicketCode() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `TICKET-${timestamp}-${random}`;
    }

    async processPurchase(cartId, userEmail) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            if (cart.products.length === 0) {
                throw new Error("El carrito está vacío");
            }

            const productsToPurchase = [];
            const productsWithoutStock = [];
            let totalAmount = 0;

            for (const item of cart.products) {
                const product = await productModel.findById(item.product._id);
                
                if (!product) {
                    productsWithoutStock.push({
                        product: item.product._id,
                        reason: "Producto no encontrado"
                    });
                    continue;
                }

                if (product.stock < item.quantity) {
                    productsWithoutStock.push({
                        product: item.product._id,
                        reason: `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
                    });
                    continue;
                }

                productsToPurchase.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: product.price
                });

                totalAmount += product.price * item.quantity;
            }

            if (productsToPurchase.length === 0) {
                throw new Error("No hay productos con stock suficiente para comprar");
            }

            const ticketCode = await this.generateTicketCode();
            
            const ticket = await this.create({
                code: ticketCode,
                amount: totalAmount,
                purchaser: userEmail,
                products: productsToPurchase
            });

            for (const item of productsToPurchase) {
                await productModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } }
                );
            }

            cart.products = [];
            await cart.save();

            return {
                ticket,
                productsWithoutStock,
                totalAmount
            };
        } catch (error) {
            throw new Error(`Error processing purchase: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await ticketModel.findById(id).populate('products.product');
        } catch (error) {
            throw new Error(`Error finding ticket: ${error.message}`);
        }
    }

    async findByCode(code) {
        try {
            return await ticketModel.findOne({ code }).populate('products.product');
        } catch (error) {
            throw new Error(`Error finding ticket by code: ${error.message}`);
        }
    }
}

export const ticketRepository = new TicketRepository(); 