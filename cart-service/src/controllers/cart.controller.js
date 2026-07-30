const redisClient = require("../config/redis");


// Ajouter un produit au panier
exports.addToCart = async (req, res) => {

    try {

        const { userId, productId, quantity } = req.body;


        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                message: "userId, productId and quantity are required"
            });
        }


        const cartKey = `cart:${userId}`;


        const cart = await redisClient.get(cartKey);


        let items = cart ? JSON.parse(cart) : [];


        const existingProduct = items.find(
            item => item.productId === productId
        );


        if (existingProduct) {

            existingProduct.quantity += quantity;

        } else {

            items.push({
                productId,
                quantity
            });
        }


        await redisClient.set(
            cartKey,
            JSON.stringify(items)
        );


        res.status(201).json({
            message: "Product added to cart",
            cart: items
        });


    } catch(error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to add product"
        });
    }
};



// Voir le panier
exports.getCart = async (req,res)=>{

    try {

        const userId = req.params.userId;

        const cartKey = `cart:${userId}`;


        const cart = await redisClient.get(cartKey);


        res.json(
            cart ? JSON.parse(cart) : []
        );


    } catch(error){

        res.status(500).json({
            message:"Failed to get cart"
        });
    }
};



// Supprimer un produit du panier
exports.removeFromCart = async(req,res)=>{

    try {

        const {userId, productId}=req.body;


        const cartKey=`cart:${userId}`;


        const cart = await redisClient.get(cartKey);


        if(!cart){
            return res.status(404).json({
                message:"Cart empty"
            });
        }


        let items=JSON.parse(cart);


        items = items.filter(
            item => item.productId !== productId
        );


        await redisClient.set(
            cartKey,
            JSON.stringify(items)
        );


        res.json({
            message:"Product removed",
            cart:items
        });


    } catch(error){

        res.status(500).json({
            message:"Failed to remove product"
        });
    }
};

// Vider complètement le panier
exports.clearCart = async (req, res) => {

    try {

        const userId = req.params.userId;

        const cartKey = `cart:${userId}`;

        await redisClient.del(cartKey);

        res.json({
            message: "Cart cleared"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to clear cart"
        });

    }

};