"use client";

/**
 * Create / Edit Event — Multi-section form
 *
 * Sections: Basic Info → Date/Time → Details → Pricing → Tasks & Rewards → Gallery
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import SupplierNav from "@/components/SupplierNav";
import { MUSIC_GENRES, VIBE_OPTIONS, VENUE_CATEGORIES, VENUE_TYPES, VENUE_TYPE_LABELS, VENUE_CATEGORY_LABELS } from "@/lib/types";
import type { VenueType, VenueCategory, PriceTier, TaskType, RewardType, ExpiryType } from "@/lib/types";

// ── Form State Types ────────────────────────────────────────

interface TaskForm {
    task_type: TaskType;
    xp_value: number;
    early_checkin_time: string;
}

interface RewardForm {
    name: string;
    reward_type: RewardType;
    description: string;
    min_level: number;
    expiry_type: ExpiryType;
    expiry_date: string;
    inventory_limit: string;
    redemption_limit_per_user: number;
}

interface TicketTypeForm {
    name: string;
    price: string;
    quantity: string;
    sales_start: string;
    sales_end: string;
    description: string;
}

// ── Helpers ─────────────────────────────────────────────────

const SECTIONS = [
    "Basic Info",
    "Date & Time",
    "Details",
    "Pricing",
    "Tasks & Rewards",
    "Gallery",
] as const;

const REFUND_POLICIES = [
    { value: "none", label: "No refunds" },
    { value: "24h", label: "Full refund until 24 hours before" },
    { value: "1w", label: "Full refund until 1 week before" },
    { value: "custom", label: "Custom policy" },
];

const REWARD_TYPE_OPTIONS: { value: RewardType; label: string }[] = [
    { value: "free_drink", label: "Free Drink" },
    { value: "discount", label: "Discount" },
    { value: "vip_access", label: "VIP Access" },
    { value: "skip_line", label: "Skip Line" },
    { value: "custom", label: "Custom" },
];

// ── Component ───────────────────────────────────────────────

export default function CreateEventPage() {
    const router = useRouter();
    const [currentSection, setCurrentSection] = useState(0);

    // ── Basic Info ──
    const [eventName, setEventName] = useState("");
    const [venueName, setVenueName] = useState("");
    const [address, setAddress] = useState("");
    const [eventType, setEventType] = useState<VenueType>("nights");

    // ── Date & Time ──
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");

    // ── Details ──
    const [ageReq, setAgeReq] = useState("19");
    const [venueCategory, setVenueCategory] = useState<VenueCategory>("club");
    const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

    // ── Pricing ──
    const [coverRange, setCoverRange] = useState("");
    const [priceTier, setPriceTier] = useState<PriceTier>("$$");
    const [capacity, setCapacity] = useState("");
    const [refundPolicy, setRefundPolicy] = useState("none");
    const [customRefundPolicy, setCustomRefundPolicy] = useState("");

    // ── Tickets (for type = tickets) ──
    const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([]);

    // ── Tasks & Rewards ──
    const [tasksEnabled, setTasksEnabled] = useState(false);
    const [tasks, setTasks] = useState<TaskForm[]>([]);
    const [rewardsEnabled, setRewardsEnabled] = useState(false);
    const [rewards, setRewards] = useState<RewardForm[]>([]);

    // ── Gallery ──
    const [description, setDescription] = useState("");

    // ── Toggle helpers ──
    const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
        setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
    };

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { name: "", price: "", quantity: "", sales_start: "", sales_end: "", description: "" }]);
    };

    const removeTicketType = (idx: number) => {
        setTicketTypes(ticketTypes.filter((_, i) => i !== idx));
    };

    const updateTicketType = (idx: number, field: keyof TicketTypeForm, value: string) => {
        const updated = [...ticketTypes];
        updated[idx] = { ...updated[idx], [field]: value };
        setTicketTypes(updated);
    };

    const addTask = () => {
        setTasks([...tasks, { task_type: "checkin", xp_value: 10, early_checkin_time: "23:00" }]);
    };

    const removeTask = (idx: number) => setTasks(tasks.filter((_, i) => i !== idx));

    const updateTask = (idx: number, field: keyof TaskForm, value: string | number) => {
        const updated = [...tasks];
        updated[idx] = { ...updated[idx], [field]: value };
        setTasks(updated);
    };

    const addReward = () => {
        setRewards([...rewards, {
            name: "",
            reward_type: "free_drink",
            description: "",
            min_level: 0,
            expiry_type: "same_night",
            expiry_date: "",
            inventory_limit: "",
            redemption_limit_per_user: 1,
        }]);
    };

    const removeReward = (idx: number) => setRewards(rewards.filter((_, i) => i !== idx));

    const updateReward = (idx: number, field: keyof RewardForm, value: string | number) => {
        const updated = [...rewards];
        updated[idx] = { ...updated[idx], [field]: value } as RewardForm;
        setRewards(updated);
    };

    const handleSave = (publish: boolean) => {
        // For MVP — just log and navigate back
        console.log("[CreateEvent]", {
            eventName, venueName, address, eventType,
            startDate, startTime, endDate, endTime,
            ageReq, venueCategory, selectedMusic, selectedVibes,
            coverRange, priceTier, capacity, refundPolicy,
            ticketTypes, tasksEnabled, tasks, rewardsEnabled, rewards,
            description, publish,
        });
        router.push("/supplier/events");
    };

    // ── Input styles ──
    const inputClass = "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50";
    const labelClass = "block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1.5";
    const tagClass = (active: boolean) =>
        `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${active ? "border-accent bg-accent/15 text-accent" : "border-border bg-surface text-foreground-muted hover:border-foreground-muted"
        }`;

    // ── Section renderers ───────────────────────────────────

    const renderBasicInfo = () => (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Event Name *</label>
                <input className={inputClass} placeholder="e.g. Saturday Night Fever" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div>
                <label className={labelClass}>Venue Name *</label>
                <input className={inputClass} placeholder="e.g. Rebel Nightclub" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
            </div>
            <div>
                <label className={labelClass}>Address</label>
                <input className={inputClass} placeholder="e.g. 11 Polson St, Toronto" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
                <label className={labelClass}>Event Type *</label>
                <div className="grid grid-cols-3 gap-2">
                    {VENUE_TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setEventType(t)}
                            className={`py-3 rounded-xl text-xs font-semibold border transition-colors ${eventType === t
                                ? "border-accent bg-accent/15 text-accent"
                                : "border-border bg-surface text-foreground-muted hover:border-foreground-muted"
                                }`}
                        >
                            {eventType === t && "✓ "}{VENUE_TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDateTime = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Start Date *</label>
                    <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>Start Time *</label>
                    <input type="time" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>End Date</label>
                    <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                    <label className={labelClass}>End Time</label>
                    <input type="time" className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
            </div>
        </div>
    );

    const renderDetails = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Age Requirement</label>
                    <select className={inputClass} value={ageReq} onChange={(e) => setAgeReq(e.target.value)}>
                        <option value="0">All Ages</option>
                        <option value="19">19+</option>
                        <option value="21">21+</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Venue Category</label>
                    <select className={inputClass} value={venueCategory} onChange={(e) => setVenueCategory(e.target.value as VenueCategory)}>
                        {VENUE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{VENUE_CATEGORY_LABELS[c]}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Music Tags</label>
                <div className="flex flex-wrap gap-2">
                    {MUSIC_GENRES.map((genre) => (
                        <button key={genre} className={tagClass(selectedMusic.includes(genre))} onClick={() => toggleItem(selectedMusic, genre, setSelectedMusic)}>
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className={labelClass}>Vibe Tags</label>
                <div className="flex flex-wrap gap-2">
                    {VIBE_OPTIONS.map((vibe) => (
                        <button key={vibe} className={tagClass(selectedVibes.includes(vibe))} onClick={() => toggleItem(selectedVibes, vibe, setSelectedVibes)}>
                            {vibe}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPricing = () => (
        <div className="space-y-5">
            {eventType === "nights" && (
                <>
                    <div>
                        <label className={labelClass}>Cover Range</label>
                        <input className={inputClass} placeholder='e.g. "$10-20" or "Free"' value={coverRange} onChange={(e) => setCoverRange(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Price Tier</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["$", "$$", "$$$"] as PriceTier[]).map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => setPriceTier(tier)}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-colors ${priceTier === tier ? "border-accent bg-accent/15 text-accent" : "border-border bg-surface text-foreground-muted"
                                        }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {eventType === "tickets" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Ticket Types</label>
                        <button onClick={addTicketType} className="text-xs text-accent font-medium">+ Add Ticket Type</button>
                    </div>
                    {ticketTypes.map((tt, idx) => (
                        <div key={idx} className="rounded-xl border border-border bg-surface-hover p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">Ticket #{idx + 1}</span>
                                <button onClick={() => removeTicketType(idx)} className="text-xs text-red-400">Remove</button>
                            </div>
                            <input className={inputClass} placeholder="Name (e.g. General Admission)" value={tt.name} onChange={(e) => updateTicketType(idx, "name", e.target.value)} />
                            <div className="grid grid-cols-2 gap-3">
                                <input className={inputClass} type="number" placeholder="Price ($)" value={tt.price} onChange={(e) => updateTicketType(idx, "price", e.target.value)} />
                                <input className={inputClass} type="number" placeholder="Quantity" value={tt.quantity} onChange={(e) => updateTicketType(idx, "quantity", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-foreground-muted">Sales Start</label>
                                    <input type="datetime-local" className={inputClass} value={tt.sales_start} onChange={(e) => updateTicketType(idx, "sales_start", e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-foreground-muted">Sales End</label>
                                    <input type="datetime-local" className={inputClass} value={tt.sales_end} onChange={(e) => updateTicketType(idx, "sales_end", e.target.value)} />
                                </div>
                            </div>
                            <input className={inputClass} placeholder="Description (optional)" value={tt.description} onChange={(e) => updateTicketType(idx, "description", e.target.value)} />
                        </div>
                    ))}
                    {ticketTypes.length === 0 && (
                        <p className="text-xs text-foreground-muted text-center py-4">No ticket types added yet. Click &ldquo;+ Add Ticket Type&rdquo; above.</p>
                    )}

                    <div>
                        <label className={labelClass}>Refund Policy</label>
                        <select className={inputClass} value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)}>
                            {REFUND_POLICIES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        {refundPolicy === "custom" && (
                            <textarea className={`${inputClass} mt-2`} rows={3} placeholder="Describe your refund policy..." value={customRefundPolicy} onChange={(e) => setCustomRefundPolicy(e.target.value)} />
                        )}
                    </div>
                </div>
            )}

            <div>
                <label className={labelClass}>Max Capacity (optional)</label>
                <input type="number" className={inputClass} placeholder="e.g. 2500" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
        </div>
    );

    const renderTasksRewards = () => (
        <div className="space-y-6">
            {/* Tasks */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className={labelClass}>Tasks</label>
                    <button
                        onClick={() => setTasksEnabled(!tasksEnabled)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${tasksEnabled ? "bg-accent" : "bg-border"}`}
                    >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${tasksEnabled ? "left-5.5 translate-x-0" : "left-0.5"}`} />
                    </button>
                </div>
                {tasksEnabled && (
                    <div className="space-y-3">
                        {tasks.map((task, idx) => (
                            <div key={idx} className="rounded-xl border border-border bg-surface-hover p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">Task #{idx + 1}</span>
                                    <button onClick={() => removeTask(idx)} className="text-xs text-red-400">Remove</button>
                                </div>
                                <div>
                                    <label className="text-[10px] text-foreground-muted">Task Type</label>
                                    <select className={inputClass} value={task.task_type} onChange={(e) => updateTask(idx, "task_type", e.target.value)}>
                                        <option value="checkin">Check-in (auto)</option>
                                        <option value="early_checkin">Early Check-in</option>
                                        <option value="bring_friend">Bring a Friend</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-foreground-muted">XP Value</label>
                                        <input type="number" className={inputClass} value={task.xp_value} onChange={(e) => updateTask(idx, "xp_value", parseInt(e.target.value) || 0)} />
                                    </div>
                                    {task.task_type === "early_checkin" && (
                                        <div>
                                            <label className="text-[10px] text-foreground-muted">Before Time</label>
                                            <input type="time" className={inputClass} value={task.early_checkin_time} onChange={(e) => updateTask(idx, "early_checkin_time", e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button onClick={addTask} className="w-full py-2 rounded-xl border-2 border-dashed border-border text-xs text-foreground-muted hover:border-accent hover:text-accent transition-colors">
                            + Add Task
                        </button>
                    </div>
                )}
            </div>

            {/* Rewards */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className={labelClass}>Rewards</label>
                    <button
                        onClick={() => setRewardsEnabled(!rewardsEnabled)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${rewardsEnabled ? "bg-accent" : "bg-border"}`}
                    >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rewardsEnabled ? "left-5.5 translate-x-0" : "left-0.5"}`} />
                    </button>
                </div>
                {rewardsEnabled && (
                    <div className="space-y-3">
                        {rewards.map((reward, idx) => (
                            <div key={idx} className="rounded-xl border border-border bg-surface-hover p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">Reward #{idx + 1}</span>
                                    <button onClick={() => removeReward(idx)} className="text-xs text-red-400">Remove</button>
                                </div>
                                <input className={inputClass} placeholder="Reward name (e.g. Free Shot)" value={reward.name} onChange={(e) => updateReward(idx, "name", e.target.value)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-foreground-muted">Type</label>
                                        <select className={inputClass} value={reward.reward_type} onChange={(e) => updateReward(idx, "reward_type", e.target.value)}>
                                            {REWARD_TYPE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-foreground-muted">Min Level</label>
                                        <input type="number" className={inputClass} value={reward.min_level} onChange={(e) => updateReward(idx, "min_level", parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <textarea className={inputClass} rows={2} placeholder="Staff instructions (what to give/do)" value={reward.description} onChange={(e) => updateReward(idx, "description", e.target.value)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-foreground-muted">Expiry</label>
                                        <select className={inputClass} value={reward.expiry_type} onChange={(e) => updateReward(idx, "expiry_type", e.target.value)}>
                                            <option value="same_night">Same Night</option>
                                            <option value="date_range">Date Range</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-foreground-muted">Inventory Limit</label>
                                        <input type="number" className={inputClass} placeholder="∞" value={reward.inventory_limit} onChange={(e) => updateReward(idx, "inventory_limit", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addReward} className="w-full py-2 rounded-xl border-2 border-dashed border-border text-xs text-foreground-muted hover:border-accent hover:text-accent transition-colors">
                            + Add Reward
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderGallery = () => (
        <div className="space-y-5">
            <div>
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={4} placeholder="Describe the experience for your guests..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
                <label className={labelClass}>Gallery Images</label>
                <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="aspect-square rounded-xl border-2 border-dashed border-border bg-surface-hover flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors"
                        >
                            <span className="text-foreground-muted text-lg">+</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-foreground-muted mt-2">Up to 10 images. Drag to reorder.</p>
            </div>
        </div>
    );

    const SECTION_RENDERERS = [renderBasicInfo, renderDateTime, renderDetails, renderPricing, renderTasksRewards, renderGallery];

    return (
        <div className="min-h-dvh bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border">
                <div className="flex items-center justify-between px-5 pt-12 pb-3">
                    <button onClick={() => router.back()} className="text-foreground-muted hover:text-foreground transition-colors">
                        ← Back
                    </button>
                    <h1 className="text-base font-bold text-foreground">Create Event</h1>
                    <div className="w-10" />
                </div>

                {/* Section pills */}
                <div className="flex items-center gap-1.5 px-5 pb-3 overflow-x-auto scrollbar-hide">
                    {SECTIONS.map((section, idx) => (
                        <button
                            key={section}
                            onClick={() => setCurrentSection(idx)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${currentSection === idx
                                ? "bg-accent text-white"
                                : "bg-surface text-foreground-muted hover:text-foreground border border-border"
                                }`}
                        >
                            {section}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form content */}
            <div className="px-5 py-5">
                {SECTION_RENDERERS[currentSection]()}
            </div>

            {/* Bottom actions */}
            <div className="fixed bottom-16 inset-x-0 bg-background/90 backdrop-blur-lg border-t border-border p-4">
                <div className="flex gap-3 max-w-lg mx-auto">
                    {currentSection < SECTIONS.length - 1 ? (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => setCurrentSection(currentSection + 1)}
                                className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors"
                            >
                                Next →
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-colors"
                            >
                                ✓ Publish Event
                            </button>
                        </>
                    )}
                </div>
            </div>

            <SupplierNav />
        </div>
    );
}
