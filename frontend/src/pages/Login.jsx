import { useState } from "react";
import api from "../api/api";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("/users/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);

            alert("Login successful!");

            console.log(response.data);

            setEmail("");
            setPassword("");

        } catch (error) {

            console.error(error);

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Login failed");
            }
        }
    };

    return (
        <div style={{ padding: "30px" }}>

            <h2>Login</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}