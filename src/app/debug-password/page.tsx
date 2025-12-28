"use client";

import { useState } from "react";

export default function PasswordDebugPage() {
    const [password, setPassword] = useState("111111");
    const [hash, setHash] = useState("");
    const [result, setResult] = useState<any>(null);

    const generateHash = async () => {
        const res = await fetch("/api/debug-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        const data = await res.json();
        setResult(data);
        if (data.hash) {
            setHash(data.hash);
        }
    };

    const verifyHash = async () => {
        const res = await fetch("/api/debug-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, hash }),
        });
        const data = await res.json();
        setResult(data);
    };

    const testLogin = async () => {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin1", password }),
        });
        const data = await res.json();
        setResult(data);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "monospace" }}>
            <h1>Password Debug Tool</h1>

            <div style={{ marginBottom: "20px" }}>
                <label>Password:</label>
                <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label>Hash:</label>
                <input
                    type="text"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px", width: "400px" }}
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <button onClick={generateHash} style={{ marginRight: "10px", padding: "10px" }}>
                    Generate Hash
                </button>
                <button onClick={verifyHash} style={{ marginRight: "10px", padding: "10px" }}>
                    Verify Hash
                </button>
                <button onClick={testLogin} style={{ padding: "10px" }}>
                    Test Login (admin1)
                </button>
            </div>

            {result && (
                <div style={{
                    marginTop: "20px",
                    padding: "20px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px"
                }}>
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
