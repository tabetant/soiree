"use client";

import { useState, useEffect } from "react";
import { isDevMode, toggleDevMode } from "@/lib/devMode";

export default function DevModeToggle() {
    const [devMode, setDevMode] = useState(false);

    useEffect(() => {
        setDevMode(isDevMode());
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                bottom: 16,
                left: 16,
                zIndex: 9999,
                background: "rgba(0 ,0, 0, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 10,
                padding: "10px 14px",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
            }}
        >
            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    color: devMode ? "#a78bfa" : "rgba(255, 255, 255, 0.5)",
                    fontWeight: 500,
                }}
            >
                <input
                    type="checkbox"
                    checked={devMode}
                    onChange={toggleDevMode}
                    style={{ accentColor: "#a78bfa", width: 16, height: 16 }}
                />
                {devMode ? "🧪 Dev Mode (Mock Data)" : "🔌 Live Mode (Supabase)"}
            </label>
        </div>
    );
}
