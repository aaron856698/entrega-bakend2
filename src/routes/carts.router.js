import { Router } from "express";
import { cartModel } from "../models/cart.model.js";
import { ticketRepository } from "../repositories/ticket.repository.js";
import passport from "passport";
import { isUser } from "../middleware/authorization.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const newCart = new cartModel({ products: [] });
        const savedCart = await newCart.save();
        res.json({ status: "success", payload: savedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.get("/:cid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).json({ status: "error", error: "Cart not found" });
        }
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.post("/:cid/purchase", passport.authenticate("jwt", { session: false }), isUser, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const userEmail = req.user.email;

        const result = await ticketRepository.processPurchase(cartId, userEmail);

        res.json({
            status: "success",
            message: "Compra realizada exitosamente",
            ticket: result.ticket,
            productsWithoutStock: result.productsWithoutStock,
            totalAmount: result.totalAmount
        });
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message });
    }
});

router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: "error", error: "Cart not found" });
        }

        cart.products = cart.products.filter(item => item.product.toString() !== req.params.pid);
        await cart.save();

        res.json({ status: "success", message: "Product removed from cart" });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.put("/:cid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: "error", error: "Cart not found" });
        }

        
        if (Array.isArray(req.body.products)) {
            cart.products = req.body.products;
        }
        
        else if (req.body.product && req.body.quantity) {
            const existingProduct = cart.products.find(item => 
                item.product.toString() === req.body.product
            );
            
            if (existingProduct) {
                existingProduct.quantity += req.body.quantity;
            } else {
                cart.products.push({
                    product: req.body.product,
                    quantity: req.body.quantity
                });
            }
        }

        await cart.save();

        res.json({ status: "success", message: "Cart updated", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: "error", error: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === req.params.pid);
        if (productIndex === -1) {
            return res.status(404).json({ status: "error", error: "Product not found in cart" });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.json({ status: "success", message: "Product quantity updated" });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.delete("/:cid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: "error", error: "Cart not found" });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: "success", message: "Cart emptied" });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;