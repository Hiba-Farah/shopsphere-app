import { useEffect, useState } from "react";
import api from "../api/api";

export default function Orders() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {

        try {

            const response = await api.get("/orders");

            setOrders(response.data);

        } catch (error) {

            console.error(error);

            alert("Failed to load orders");

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>My Orders</h2>

            {
                orders.length === 0
                ? (
                    <p>No orders found.</p>
                )
                : (
                    orders.map((order) => (

                        <div
                            key={order.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "20px",
                                marginBottom: "20px"
                            }}
                        >

                            <h3>Order #{order.id}</h3>

                            <p>
                                <strong>User :</strong> {order.user_id}
                            </p>

                            <p>
                                <strong>Total :</strong> ${order.total_price}
                            </p>

                            <p>
                                <strong>Status :</strong> {order.status}
                            </p>

                        </div>

                    ))
                )
            }

        </div>

    );

}