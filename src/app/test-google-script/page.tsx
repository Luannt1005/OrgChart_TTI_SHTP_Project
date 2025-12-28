"use client";

import { useState } from "react";

export default function TestGoogleScriptPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testGetUser = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbyhiTwcOfP6G2Ys2xzFp7Wx7DCTRFfOgFAWvW-Rz9LgqdAUPhSbupQUcyAVm0-tF5cb/exec",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "getUser", username: "admin1" })
                }
            );
            const data = await res.json();
            setResult({ type: "getUser", data });
        } catch (error) {
            setResult({ type: "getUser", error: String(error) });
        }
        setLoading(false);
    };

    const testOldLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbyhiTwcOfP6G2Ys2xzFp7Wx7DCTRFfOgFAWvW-Rz9LgqdAUPhSbupQUcyAVm0-tF5cb/exec",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: "admin1", password: "111111" })
                }
            );
            const data = await res.json();
            setResult({ type: "oldLogin", data });
        } catch (error) {
            setResult({ type: "oldLogin", error: String(error) });
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Test Google Apps Script</h1>

            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={testGetUser}
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        marginRight: "10px",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    Test getUser Action
                </button>

                <button
                    onClick={testOldLogin}
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    Test Old Login
                </button>
            </div>

            {loading && <p>Loading...</p>}

            {result && (
                <div style={{
                    marginTop: "20px",
                    padding: "20px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "5px",
                    border: "1px solid #ddd"
                }}>
                    <h3>Result ({result.type}):</h3>
                    <pre style={{
                        backgroundColor: "#fff",
                        padding: "15px",
                        borderRadius: "5px",
                        overflow: "auto",
                        maxHeight: "400px"
                    }}>
                        {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "5px" }}>
                <h3>📝 Instructions:</h3>
                <ol>
                    <li><strong>Test getUser Action</strong>: Kiểm tra xem Google Apps Script có hỗ trợ action "getUser" không</li>
                    <li><strong>Test Old Login</strong>: Kiểm tra login theo cách cũ (plain password)</li>
                </ol>
                <p><strong>Expected for admin1/111111:</strong></p>
                <ul>
                    <li>getUser: Nếu đã update script → trả về user data với hashed password</li>
                    <li>Old Login: Nếu chưa update → trả về success: true với user data</li>
                </ul>
            </div>
        </div>
    );
}
