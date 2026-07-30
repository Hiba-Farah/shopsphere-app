import { useEffect, useState } from "react";
import api from "../api/api";

export default function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {

        try {

            const response = await api.get("/products");

            setProducts(response.data);

        } catch (error) {

            console.error(error);

            alert("Failed to load products");

        }
    };

    const addToCart = async (productId) => {

    try {

        await api.post("/cart/add", {
            userId: 1,
            productId,
            quantity: 1
        });

        alert("Product added to cart!");

    } catch (error) {

        console.error(error);

        alert("Failed to add product");

    }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>Products</h2>

            {
                products.length === 0
                ? (
                    <p>No products available.</p>
                )
                : (
                    products.map((product) => (

                        <div
                            key={product.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "20px",
                                marginBottom: "20px",
                                borderRadius: "10px"
                            }}
                        >

                            <h3>{product.name}</h3>

                            <p>{product.description}</p>

                            <p>
                                <strong>Price :</strong> ${product.price}
                            </p>

                            <p>
                                <strong>Stock :</strong> {product.stock}
                            </p>

                            <button onClick={() => addToCart(product.id)}>
                                Add to Cart
                            </button>

                        </div>

                    ))
                )
            }

        </div>

    );

}