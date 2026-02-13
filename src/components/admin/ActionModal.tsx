"use client";

/**
 * Reusable Action Modal
 *
 * Used for approve, reject, ban, and other admin actions.
 * Includes optional reason field and confirmation text.
 */

import { useState } from "react";

interface ActionModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant?: "success" | "danger" | "warning";
    requireReason?: boolean;
    reasonLabel?: string;
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
}

export default function ActionModal({
    open,
    title,
    description,
    confirmLabel,
    confirmVariant = "danger",
    requireReason = false,
    reasonLabel = "Reason",
    onConfirm,
    onCancel,
}: ActionModalProps) {
    const [reason, setReason] = useState("");

    if (!open) return null;

    const canConfirm = !requireReason || reason.trim().length > 0;

    const variantClass: Record<string, string> = {
        success: "admin-btn--success",
        danger: "admin-btn--danger",
        warning: "admin-btn--warning",
    };

    return (
        <div className="admin-modal-overlay" onClick={onCancel}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="admin-modal__title">{title}</h3>
                <p className="admin-modal__desc">{description}</p>

                {requireReason && (
                    <div className="admin-modal__field">
                        <label className="admin-modal__label">{reasonLabel}</label>
                        <textarea
                            className="admin-modal__textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={`Enter ${reasonLabel.toLowerCase()}...`}
                            rows={3}
                        />
                    </div>
                )}

                <div className="admin-modal__actions">
                    <button className="admin-btn admin-btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={`admin-btn ${variantClass[confirmVariant]}`}
                        disabled={!canConfirm}
                        onClick={() => {
                            onConfirm(reason || undefined);
                            setReason("");
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
