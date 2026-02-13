"use client";

/**
 * QR Code Page — Generate check-in QR for an event
 *
 * Shows QR code, event info, and download/print buttons.
 */

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { MOCK_EVENTS } from "@/lib/supplierMockData";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EventQRPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const event = useMemo(() => MOCK_EVENTS.find((e) => e.id === id), [id]);

    if (!event) {
        return (
            <div className="min-h-dvh bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-foreground-muted text-sm">Event not found</p>
                    <button onClick={() => router.back()} className="text-accent text-sm mt-2">← Go back</button>
                </div>
            </div>
        );
    }

    const qrValue = `soiree://checkin/${event.id}?secret=${event.checkin_qr_secret}`;
    const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    const handleDownload = () => {
        const svg = document.getElementById("event-qr-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = 1024;
            canvas.height = 1024;
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 1024, 1024);
                ctx.drawImage(img, 0, 0, 1024, 1024);
            }
            const link = document.createElement("a");
            link.download = `soiree-qr-${event.name.toLowerCase().replace(/\s+/g, "-")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const handlePrint = () => window.print();

    return (
        <div className="min-h-dvh bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <button onClick={() => router.back()} className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                    ← Back
                </button>
                <h1 className="text-base font-bold text-foreground">Check-in QR Code</h1>
                <div className="w-10" />
            </div>

            {/* QR Display */}
            <div className="px-5 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center">
                    <QRCodeSVG
                        id="event-qr-svg"
                        value={qrValue}
                        size={256}
                        level="H"
                        includeMargin
                        bgColor="#ffffff"
                        fgColor="#000000"
                        className="mx-auto"
                    />
                    <h2 className="text-lg font-bold text-gray-900 mt-4">{event.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{eventDate}</p>
                    <p className="text-xs text-gray-400 mt-1">{event.venue_name}</p>
                </div>

                {/* Instructions */}
                <div className="w-full max-w-sm mt-6 rounded-2xl border border-border bg-surface p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">📍 How to use</h3>
                    <ol className="space-y-2 text-xs text-foreground-muted">
                        <li className="flex gap-2">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-bold">1</span>
                            Display this QR code at your venue entrance
                        </li>
                        <li className="flex gap-2">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-bold">2</span>
                            Guests scan with the Soirée app to check in
                        </li>
                        <li className="flex gap-2">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-bold">3</span>
                            They earn XP and unlock rewards automatically
                        </li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-4 pb-8">
                    <button
                        onClick={handleDownload}
                        className="py-3 rounded-2xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors"
                    >
                        ⬇ Download PNG
                    </button>
                    <button
                        onClick={handlePrint}
                        className="py-3 rounded-2xl border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
                    >
                        🖨 Print
                    </button>
                </div>
            </div>
        </div>
    );
}
