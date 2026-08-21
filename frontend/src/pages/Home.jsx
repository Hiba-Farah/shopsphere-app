import { Link } from "react-router-dom";
export default function Home() {

    return (

        <div
           style={{
               textAlign: "center",
               padding: "60px 20px",
               maxWidth: "900px",
               margin: "0 auto",
               background: "linear-gradient(135deg, #eef6ff, #dbeafe)",
               borderRadius: "20px",
               marginTop: "30px",
               boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
           }}
        >

            <h1
                style={{
                    fontSize: "48px",
                    color: "#2563eb",
                    marginBottom: "10px"
                }}
            >
                🛍️ Welcome to ShopSphere
            </h1>

            <p
                style={{
                    fontSize: "22px",
                    color: "#555",
                    marginBottom: "40px"
                }}
            >
                Discover quality products at the best prices.
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "25px",
                    flexWrap: "wrap",
                    marginBottom: "50px"
                }}
            >

                <div
                    style={{
                        width: "220px",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "20px"
                    }}
                >
                    <h3>💻 Electronics</h3>
                    <p>Laptops, accessories and more.</p>
                </div>

                <div
                    style={{
                        width: "220px",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "20px"
                    }}
                >
                    <h3>🚚 Fast Delivery</h3>
                    <p>Quick and reliable shipping.</p>
                </div>

                <div
                    style={{
                        width: "220px",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "20px"
                    }}
                >
                    <h3>🔒 Secure Shopping</h3>
                    <p>Your data is protected.</p>
                </div>

            </div>

            <Link
                href="/products"
                style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    textDecoration: "none",
                    padding: "14px 28px",
                    borderRadius: "8px",
                    fontSize: "18px",
                    fontWeight: "bold"
                }}
            >
                Shop Now
            </Link>

        </div>

    );

}