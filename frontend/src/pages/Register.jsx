import { useState } from "react";
import api from "../api/api";

export default function Register() {

    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post("/users/register", {
                fullname,
                email,
                password
            });

            alert("User created successfully!");

            console.log(response.data);

            setFullname("");
            setEmail("");
            setPassword("");

        } catch (error) {

            console.error(error);

            alert("Registration failed");
        }
    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>Register</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Full name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                />

                <br /><br />

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
                    Register
                </button>

            </form>

        </div>

    );
}