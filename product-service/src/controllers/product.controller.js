const productModel = require("../models/product.model");

// Liste des produits
exports.getProducts = async (req, res) => {
    try {

        const products = await productModel.getAllProducts();

        res.status(200).json(products);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch products"
        });

    }
};

// Ajouter un produit
exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            stock,
            image_url
        } = req.body;

        const product = await productModel.createProduct(
            name,
            description,
            price,
            stock,
            image_url
        );

        res.status(201).json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Product creation failed"
        });

    }

};

// Récupérer un produit par ID
exports.getProductById = async (req, res) => {

    try {

        const product = await productModel.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

};

// Modifier un produit
exports.updateProduct = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            stock,
            image_url
        } = req.body;

        const product = await productModel.updateProduct(
            req.params.id,
            name,
            description,
            price,
            stock,
            image_url
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Update failed"
        });

    }

};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {

    try {

        const product = await productModel.deleteProduct(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Delete failed"
        });

    }

};