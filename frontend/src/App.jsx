import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/products" element={<Products />} />

                <Route path="/cart" element={<Cart />} />

                <Route path="/orders" element={<Orders />} />
            </Routes>

        </BrowserRouter>
    );
}

export default App;