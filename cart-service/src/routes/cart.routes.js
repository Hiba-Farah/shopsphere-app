const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cart.controller");


// Ajouter au panier
router.post("/add", cartController.addToCart);


// Voir panier
router.get("/:userId", cartController.getCart);


// Supprimer produit
router.delete("/remove", cartController.removeFromCart);

router.delete("/clear/:userId", cartController.clearCart);


module.exports = router;