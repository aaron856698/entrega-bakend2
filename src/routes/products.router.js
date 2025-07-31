import { Router } from "express";
import passport from "passport";
import { productRepository } from "../repositories/product.repository.js";
import { isAdmin } from "../middleware/authorization.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const filter = {};
        if (query) {
            filter.$or = [
                { category: { $regex: query, $options: 'i' } },
                { status: query === 'true' }
            ];
        }

        const result = await productRepository.findWithFilter(filter, options);

        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `${baseUrl}?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            nextLink: result.hasNextPage ? `${baseUrl}?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const product = await productRepository.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: "error", error: "Product not found" });
        }
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        
        const existingProduct = await productRepository.findByCode(code);
        if (existingProduct) {
            return res.status(400).json({ error: "El código del producto ya existe" });
        }
        
        const product = await productRepository.create({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails: thumbnails || []
        });
        
        res.status(201).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.put("/:pid", passport.authenticate("jwt", { session: false }), isAdmin, async (req, res) => {
    try {
        const product = await productRepository.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        const updatedProduct = await productRepository.update(req.params.pid, req.body);
        res.json({ status: "success", payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.delete("/:pid", passport.authenticate("jwt", { session: false }), isAdmin, async (req, res) => {
    try {
        const product = await productRepository.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        await productRepository.delete(req.params.pid);
        res.json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;