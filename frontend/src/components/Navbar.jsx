import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav style={{
            padding: "15px",
            background: "#222",
            display: "flex",
            gap: "20px"
        }}>
            <Link to="/" style={{ color: "white" }}>Home</Link>

            <Link to="/products" style={{ color: "white" }}>Products</Link>

            <Link to="/cart" style={{ color: "white" }}>Cart</Link>

            <Link to="/orders" style={{ color: "white" }}>Orders</Link>

            <Link to="/login" style={{ color: "white" }}>Login</Link>

            <Link to="/register" style={{ color: "white" }}>Register</Link>
        </nav>
    );
}