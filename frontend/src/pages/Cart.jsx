import { useEffect, useState } from "react";
import api from "../api/api";

export default function Cart() {

    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchCart();
        fetchProducts();
    }, []);

    const fetchCart = async () => {

        try {

            const response = await api.get("/cart/1");

            setCart(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const fetchProducts = async () => {

        try {

            const response = await api.get("/products");

            setProducts(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const removeProduct = async (productId) => {

        try {

            await api.delete("/cart/remove", {
                data: {
                    userId: 1,
                    productId
                }
            });

            fetchCart();

        } catch (error) {

            console.error(error);

        }

    };

    const checkout = async () => {

        try {

            let total = 0;

            cart.forEach((item) => {

                const product = products.find(
                    p => p.id === item.productId
                );

                if (product) {
                    total += Number(product.price) * item.quantity;
                }

            });

            await api.post("/orders", {
                user_id: 1,
                total_price: total
            });

            await api.delete("/cart/clear/1");

            fetchCart();
            
            alert("Order created successfully!");


        } catch (error) {

            console.error(error);

            alert("Checkout failed");

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>My Cart</h2>

            {
                cart.length > 0 && (

                    <>
                        <button onClick={checkout}>
                            Checkout
                        </button>

                        <br />
                        <br />
                    </>

                )
            }

            {
                cart.length === 0
                ? (
                    <p>Your cart is empty.</p>
                )
                : (
                    cart.map((item) => {

                        const product = products.find(
                            p => p.id === item.productId
                        );

                        return (

                            <div
                                key={item.productId}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    marginBottom: "20px"
                                }}
                            >

                                <h3>{product?.name}</h3>

                                <p>{product?.description}</p>

                                <p>
                                    <strong>Price :</strong> ${product?.price}
                                </p>

                                <p>
                                    <strong>Quantity :</strong> {item.quantity}
                                </p>

                                <button
                                    onClick={() => removeProduct(item.productId)}
                                >
                                    Remove
                                </button>

                            </div>

                        );

                    })
                )
            }

        </div>

    );

}