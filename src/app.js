import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/users.router.js";
import { productModel } from "./models/product.model.js";
import { cartModel } from "./models/cart.model.js";
import passport from "./passport.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);

app.get('/products', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const sampleProducts = [
                {
                    _id: "1",
                    title: "Smartphone XYZ",
                    description: "Un smartphone potente con la última tecnología",
                    code: "SMART001",
                    price: 599.99,
                    status: true,
                    stock: 50,
                    category: "Electrónicos",
                    thumbnails: ["/images/smartphone.jpg"]
                },
                {
                    _id: "2",
                    title: "Laptop Pro",
                    description: "Laptop profesional para trabajo y gaming",
                    code: "LAPTOP001",
                    price: 1299.99,
                    status: true,
                    stock: 25,
                    category: "Computadoras",
                    thumbnails: ["/images/laptop.jpg"]
                },
                {
                    _id: "3",
                    title: "Auriculares Wireless",
                    description: "Auriculares bluetooth con cancelación de ruido",
                    code: "AUDIO001",
                    price: 199.99,
                    status: true,
                    stock: 100,
                    category: "Accesorios",
                    thumbnails: ["/images/auiriculares.jpg"]
                }
            ];
            res.render('products', {
                products: sampleProducts,
                page: 1,
                totalPages: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: null,
                nextPage: null,
                query: req.query.query,
                sort: req.query.sort
            });
            return;
        }
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
        const result = await productModel.paginate(filter, options);
        res.render('products', {
            products: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            query: query,
            sort: sort
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

app.get('/products/:pid', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const sampleProducts = {
                "1": {
                    _id: "1",
                    title: "Smartphone XYZ",
                    description: "Un smartphone potente con la última tecnología",
                    code: "SMART001",
                    price: 599.99,
                    status: true,
                    stock: 50,
                    category: "Electrónicos",
                    thumbnails: ["/images/smartphone.jpg"]
                },
                "2": {
                    _id: "2",
                    title: "Laptop Pro",
                    description: "Laptop profesional para trabajo y gaming",
                    code: "LAPTOP001",
                    price: 1299.99,
                    status: true,
                    stock: 25,
                    category: "Computadoras",
                    thumbnails: ["/images/laptop.jpg"]
                },
                "3": {
                    _id: "3",
                    title: "Auriculares Wireless",
                    description: "Auriculares bluetooth con cancelación de ruido",
                    code: "AUDIO001",
                    price: 199.99,
                    status: true,
                    stock: 100,
                    category: "Accesorios",
                    thumbnails: ["/images/auiriculares.jpg"]
                }
            };
            const product = sampleProducts[req.params.pid];
            if (!product) {
                return res.status(404).render('error', { error: 'Producto no encontrado' });
            }
            res.render('product-detail', { product });
            return;
        }
        const product = await productModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).render('error', { error: 'Producto no encontrado' });
        }
        res.render('product-detail', { product });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

app.get('/seed', async (req, res) => {
    try {
        const sampleProducts = [
            {
                title: "Smartphone XYZ",
                description: "Un smartphone potente con la última tecnología",
                code: "SMART001",
                price: 599.99,
                status: true,
                stock: 50,
                category: "Electrónicos",
                thumbnails: ["/images/smartphone.jpg"]
            },
            {
                title: "Laptop Pro",
                description: "Laptop profesional para trabajo y gaming",
                code: "LAPTOP001",
                price: 1299.99,
                status: true,
                stock: 25,
                category: "Computadoras",
                thumbnails: ["/images/laptop.jpg"]
            },
            {
                title: "Auriculares Wireless",
                description: "Auriculares bluetooth con cancelación de ruido",
                code: "AUDIO001",
                price: 199.99,
                status: true,
                stock: 100,
                category: "Accesorios",
                thumbnails: ["/images/auiriculares.jpg"]
            }
        ];
        await productModel.deleteMany({});
        await productModel.insertMany(sampleProducts);
        res.json({ message: "Base de datos poblada con productos de ejemplo" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).render('error', { error: 'Carrito no encontrado' });
        }
        res.render('cart', { 
            cart,
            helpers: {
                multiply: function(a, b) { return a * b; },
                calculateTotal: function(products) {
                    return products.reduce((total, item) => {
                        return total + (item.product.price * item.quantity);
                    }, 0);
                }
            }
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

app.get('/cart', async (req, res) => {
    try {
        const newCart = new cartModel({ products: [] });
        const savedCart = await newCart.save();
        res.redirect(`/carts/${savedCart._id}`);
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

app.get('/', (req, res) => {
  res.redirect('/products');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Conectado a MongoDB Atlas");
        app.listen(port, () => {
            console.log(`Servidor activo en puerto: ${port}`);
        });
    })
    .catch(error => {
        console.error("Error al conectar a MongoDB Atlas:", error.message);
        console.log("Intentando conectar a MongoDB local...");
        mongoose.connect("mongodb://localhost:27017/ecommerce")
            .then(() => {
                console.log("Conectado a MongoDB local");
                app.listen(port, () => {
                    console.log(`Servidor activo en puerto: ${port}`);
                });
            })
            .catch(localError => {
                console.error("Error al conectar a MongoDB local:", localError.message);
                console.log("Iniciando servidor sin base de datos...");
                app.listen(port, () => {
                    console.log(`Servidor activo en puerto: ${port} (sin base de datos)`);
                });
            });
    });