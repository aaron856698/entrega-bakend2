import { Router } from "express";
import { productModel } from "../models/product.model.js";

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
                { available: query === 'true' }
            ];
        }

        const result = await productModel.paginate(filter, options);

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
        const product = await productModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ status: "error", error: "Product not found" });
        }
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;