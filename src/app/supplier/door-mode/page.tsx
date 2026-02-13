"use client";

/**
 * Door Mode — Staff scanning interface
 *
 * Two tabs: Scan Tickets (Entry) | Scan Rewards (Redemption)
 * Uses camera + QR scanning for real-time validation.
 * Falls back to manual entry if camera unavailable.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_EVENTS, MOCK_TICKET_PURCHASES } from "@/lib/supplierMockData";

type ScanMode = "tickets" | "rewards";

interface ScanResult {
    success: boolean;
    name: string;
    detail: string;
    message: string;
}

export default function DoorModePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEvent = searchParams.get("event") || MOCK_EVENTS[0]?.id || "";

    const [selectedEventId, setSelectedEventId] = useState(initialEvent);
    const [scanMode, setScanMode] = useState<ScanMode>("tickets");
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [showManual, setShowManual] = useState(false);
    const [ticketsScanned, setTicketsScanned] = useState(0);
    const [rewardsRedeemed, setRewardsRedeemed] = useState(0);
    const [flashOn, setFlashOn] = useState(false);
    const [cameraActive, setCameraActive] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const activeEvents = MOCK_EVENTS.filter((e) => e.status === "published");

    // Camera setup
    useEffect(() => {
        if (!cameraActive) return;

        let mounted = true;
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                if (mounted && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch {
                // Camera unavailable — show manual entry
                if (mounted) {
                    setCameraActive(false);
                    setShowManual(true);
                }
            }
        }
        startCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, [cameraActive]);

    const processCode = useCallback((code: string) => {
        if (scanMode === "tickets") {
            // Look up ticket purchase by QR secret
            const purchase = MOCK_TICKET_PURCHASES.find(
                (tp) => tp.ticket_qr_secret === code && tp.event_id === selectedEventId
            );

            if (!purchase) {
                setScanResult({
                    success: false,
                    name: "",
                    detail: "",
                    message: code.length > 0 ? "Invalid ticket — not found for this event" : "Please enter a ticket code",
                });
                return;
            }

            if (purchase.status === "used") {
                setScanResult({
                    success: false,
                    name: purchase.buyer_name || "Unknown",
                    detail: purchase.ticket_type_name || "Ticket",
                    message: "Ticket already used",
                });
                return;
            }

            // Success!
            setScanResult({
                success: true,
                name: purchase.buyer_name || "Guest",
                detail: purchase.ticket_type_name || "General Admission",
                message: "Entry approved ✓",
            });
            setTicketsScanned((prev) => prev + 1);

            // Vibrate if available
            if (navigator.vibrate) navigator.vibrate(100);
        } else {
            // Reward scanning — simplified mock
            setScanResult({
                success: true,
                name: "Maya Dance",
                detail: "Free Shot — Give guest one complimentary shot at the bar",
                message: "Reward redeemed ✓",
            });
            setRewardsRedeemed((prev) => prev + 1);
            if (navigator.vibrate) navigator.vibrate(100);
        }
    }, [scanMode, selectedEventId]);

    const handleManualScan = () => {
        processCode(manualCode.trim());
        setManualCode("");
    };

    const clearResult = () => setScanResult(null);

    return (
        <div className="min-h-dvh bg-black text-white flex flex-col">
            {/* ── Top Bar ─────────────────────────── */}
            <div className="px-4 pt-12 pb-3 flex items-center justify-between bg-black/80 backdrop-blur-lg z-20">
                <button onClick={() => router.push("/supplier/dashboard")} className="text-sm text-gray-400 hover:text-white transition-colors">
                    ← Exit
                </button>
                <h1 className="text-base font-bold">🚪 Door Mode</h1>
                <button
                    onClick={() => setFlashOn(!flashOn)}
                    className={`text-sm ${flashOn ? "text-yellow-400" : "text-gray-400"}`}
                >
                    {flashOn ? "🔦 On" : "🔦 Off"}
                </button>
            </div>

            {/* Event Selector */}
            <div className="px-4 pb-2 bg-black/80">
                <select
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 text-xs text-white"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    {activeEvents.map((evt) => (
                        <option key={evt.id} value={evt.id}>{evt.name}</option>
                    ))}
                </select>
            </div>

            {/* ── Scan Mode Tabs ─────────────────── */}
            <div className="flex mx-4 rounded-xl bg-gray-900 p-1 mb-3">
                {[
                    { id: "tickets" as ScanMode, label: "🎫 Scan Tickets" },
                    { id: "rewards" as ScanMode, label: "🎁 Scan Rewards" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setScanMode(tab.id); setScanResult(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${scanMode === tab.id ? "bg-white text-black" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Camera / Scanner ───────────────── */}
            <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden bg-gray-900 mb-3">
                {cameraActive ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        {/* Scanner overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-56 h-56 border-2 border-white/30 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                                {/* Scanning line animation */}
                                <div className="absolute top-2 left-2 right-2 h-0.5 bg-accent rounded-full animate-pulse" />
                            </div>
                        </div>
                        <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
                            Point camera at {scanMode === "tickets" ? "ticket" : "reward"} QR code
                        </p>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-3 p-8">
                        <span className="text-4xl">📷</span>
                        <p className="text-sm text-gray-400 text-center">Camera not available</p>
                        <p className="text-xs text-gray-500 text-center">Use manual entry below</p>
                    </div>
                )}

                {/* Scan Result Overlay */}
                {scanResult && (
                    <div
                        className={`absolute inset-0 flex items-center justify-center backdrop-blur-md ${scanResult.success ? "bg-green-900/70" : "bg-red-900/70"
                            }`}
                        onClick={clearResult}
                    >
                        <div className="text-center p-6">
                            <div className={`text-6xl mb-3 ${scanResult.success ? "animate-bounce" : ""}`}>
                                {scanResult.success ? "✅" : "❌"}
                            </div>
                            <p className="text-lg font-bold">{scanResult.message}</p>
                            {scanResult.name && (
                                <p className="text-sm mt-1">{scanResult.name}</p>
                            )}
                            {scanResult.detail && (
                                <p className="text-xs mt-1 text-gray-300">{scanResult.detail}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-4">Tap to dismiss</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Manual Entry ───────────────────── */}
            <div className="px-4 mb-3">
                <button
                    onClick={() => setShowManual(!showManual)}
                    className="w-full text-xs text-gray-400 hover:text-white transition-colors mb-2"
                >
                    {showManual ? "Hide" : "Show"} manual entry
                </button>
                {showManual && (
                    <div className="flex gap-2">
                        <input
                            className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-3 py-2.5 text-sm text-white placeholder:text-gray-600"
                            placeholder={`Enter ${scanMode === "tickets" ? "ticket" : "reward"} code...`}
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
                        />
                        <button
                            onClick={handleManualScan}
                            className="px-4 rounded-xl bg-white text-black text-sm font-semibold"
                        >
                            Scan
                        </button>
                    </div>
                )}
            </div>

            {/* ── Bottom Stats ───────────────────── */}
            <div className="px-4 pb-6 pt-2 flex items-center justify-around bg-black/80 border-t border-gray-800">
                <div className="text-center">
                    <p className="text-xl font-bold tabular-nums text-green-400">{ticketsScanned}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tickets Scanned</p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-center">
                    <p className="text-xl font-bold tabular-nums text-purple-400">{rewardsRedeemed}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rewards Redeemed</p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-center">
                    <p className="text-xl font-bold tabular-nums text-white">{activeEvents.find(e => e.id === selectedEventId)?.capacity ?? "—"}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Capacity</p>
                </div>
            </div>
        </div>
    );
}
