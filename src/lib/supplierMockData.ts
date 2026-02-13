/**
 * Supplier Mock Data
 *
 * Realistic test data for a supplier with 5 events, analytics, tasks, rewards.
 */

import type {
    Supplier,
    SupplierEvent,
    EventTask,
    EventReward,
    TicketType,
    TicketPurchase,
    Attendance,
    EventAnalytics,
} from "@/lib/types";

// ── Supplier Profile ────────────────────────────────────────

export const MOCK_SUPPLIER: Supplier = {
    id: "sup-001",
    user_id: "user-supplier-001",
    business_name: "Rebel Nightclub",
    verification_status: "approved",
    stripe_connect_id: "MOCK_acct_000000001",
    plan: "pro",
    contact_email: "manager@rebelnightclub.com",
    phone: "+1 416-555-0199",
    website: "https://rebelnightclub.com",
    social_links: {
        instagram: "@rebeltoronto",
        facebook: "RebelNightclub",
        tiktok: "@rebelnightclub",
    },
    created_at: "2025-06-15T10:00:00Z",
    updated_at: "2026-02-01T15:30:00Z",
};

// ── Events ──────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
};
const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
};

export const MOCK_EVENTS: SupplierEvent[] = [
    {
        id: "evt-001",
        supplier_id: "sup-001",
        venue_id: "v-rebel",
        venue_name: "Rebel Nightclub",
        name: "Saturday Night Fever",
        description: "Toronto's hottest Saturday night party featuring top DJs and immersive light shows.",
        venue_type: "nights",
        venue_category: "club",
        event_date: fmt(daysFromNow(2)),
        end_date: fmt(daysFromNow(3)),
        age_requirement: 19,
        music_types: ["House", "EDM", "Techno"],
        vibes: ["Rave", "Party", "Late night"],
        cover_range: "$20-30",
        price_tier: "$$",
        capacity: 2500,
        gallery_images: [
            "linear-gradient(135deg, #667eea, #764ba2)",
            "linear-gradient(135deg, #f093fb, #f5576c)",
            "linear-gradient(135deg, #4facfe, #00f2fe)",
        ],
        checkin_qr_secret: "MOCK_qr_001",
        status: "published",
        tasks_enabled: true,
        rewards_enabled: true,
        refund_policy: null,
        created_at: fmt(daysAgo(14)),
        views: 2340,
        opens: 892,
        saves: 156,
        checkins: 423,
    },
    {
        id: "evt-002",
        supplier_id: "sup-001",
        venue_id: "v-rebel",
        venue_name: "Rebel Nightclub",
        name: "Neon Dreams — Valentine's Special",
        description: "A romantic yet electrifying Valentine's night with couples specials and live performances.",
        venue_type: "tickets",
        venue_category: "club",
        event_date: fmt(daysFromNow(1)),
        end_date: fmt(daysFromNow(1)),
        age_requirement: 19,
        music_types: ["R&B", "Pop", "Latin"],
        vibes: ["Upscale", "Intimate", "Party"],
        cover_range: null,
        price_tier: "$$$",
        capacity: 1800,
        gallery_images: [
            "linear-gradient(135deg, #ff6b6b, #ee5a24)",
            "linear-gradient(135deg, #fd79a8, #e84393)",
        ],
        checkin_qr_secret: "MOCK_qr_002",
        status: "published",
        tasks_enabled: true,
        rewards_enabled: true,
        refund_policy: "Full refund until 24 hours before",
        created_at: fmt(daysAgo(7)),
        views: 4120,
        opens: 1560,
        saves: 312,
        checkins: 0,
    },
    {
        id: "evt-003",
        supplier_id: "sup-001",
        venue_id: "v-rebel",
        venue_name: "Rebel Nightclub",
        name: "Techno Underground",
        description: "Deep techno marathon featuring Berlin-based DJs.",
        venue_type: "nights",
        venue_category: "club",
        event_date: fmt(daysFromNow(9)),
        end_date: fmt(daysFromNow(10)),
        age_requirement: 19,
        music_types: ["Techno", "House"],
        vibes: ["Rave", "Late night"],
        cover_range: "$15-25",
        price_tier: "$$",
        capacity: 2000,
        gallery_images: [
            "linear-gradient(135deg, #0f0c29, #302b63)",
        ],
        checkin_qr_secret: "MOCK_qr_003",
        status: "draft",
        tasks_enabled: false,
        rewards_enabled: false,
        refund_policy: null,
        created_at: fmt(daysAgo(2)),
        views: 0,
        opens: 0,
        saves: 0,
        checkins: 0,
    },
    {
        id: "evt-004",
        supplier_id: "sup-001",
        venue_id: "v-rebel",
        venue_name: "Rebel Nightclub",
        name: "Hip Hop Fridays",
        description: "Weekly hip hop night with Toronto's best MCs and DJs.",
        venue_type: "nights",
        venue_category: "club",
        event_date: fmt(daysAgo(3)),
        end_date: fmt(daysAgo(2)),
        age_requirement: 19,
        music_types: ["Hip-Hop", "R&B"],
        vibes: ["Hip hop", "Party"],
        cover_range: "$10-20",
        price_tier: "$",
        capacity: 2500,
        gallery_images: [
            "linear-gradient(135deg, #f7971e, #ffd200)",
        ],
        checkin_qr_secret: "MOCK_qr_004",
        status: "ended",
        tasks_enabled: true,
        rewards_enabled: true,
        refund_policy: null,
        created_at: fmt(daysAgo(30)),
        views: 3100,
        opens: 1200,
        saves: 89,
        checkins: 1540,
    },
    {
        id: "evt-005",
        supplier_id: "sup-001",
        venue_id: "v-rebel",
        venue_name: "Rebel Nightclub",
        name: "Afrobeats After Dark",
        description: "Afrobeats and amapiano night — pure vibes guaranteed.",
        venue_type: "tickets",
        venue_category: "club",
        event_date: fmt(daysFromNow(16)),
        end_date: fmt(daysFromNow(17)),
        age_requirement: 19,
        music_types: ["Afrobeats", "Latin"],
        vibes: ["Party", "Live music"],
        cover_range: null,
        price_tier: "$$",
        capacity: 2200,
        gallery_images: [
            "linear-gradient(135deg, #00b09b, #96c93d)",
        ],
        checkin_qr_secret: "MOCK_qr_005",
        status: "published",
        tasks_enabled: true,
        rewards_enabled: false,
        refund_policy: "Full refund until 1 week before",
        created_at: fmt(daysAgo(5)),
        views: 1800,
        opens: 640,
        saves: 210,
        checkins: 0,
    },
];

// ── Tasks ───────────────────────────────────────────────────

export const MOCK_TASKS: EventTask[] = [
    {
        id: "task-001",
        event_id: "evt-001",
        task_type: "checkin",
        xp_value: 10,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "task-002",
        event_id: "evt-001",
        task_type: "early_checkin",
        xp_value: 25,
        early_checkin_time: "23:00",
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "task-003",
        event_id: "evt-001",
        task_type: "bring_friend",
        xp_value: 50,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "task-004",
        event_id: "evt-004",
        task_type: "checkin",
        xp_value: 15,
        created_at: fmt(daysAgo(30)),
    },
];

// ── Rewards ─────────────────────────────────────────────────

export const MOCK_REWARDS: EventReward[] = [
    {
        id: "rwd-001",
        event_id: "evt-001",
        venue_id: "v-rebel",
        name: "Free Shot",
        reward_type: "free_drink",
        description: "Give guest one complimentary shot at the bar.",
        min_level: 0,
        expiry_type: "same_night",
        inventory_limit: 100,
        redemption_limit_per_user: 1,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "rwd-002",
        event_id: "evt-001",
        venue_id: "v-rebel",
        name: "Skip the Line",
        reward_type: "skip_line",
        description: "Allow guest to skip the entrance queue.",
        min_level: 3,
        expiry_type: "same_night",
        inventory_limit: 50,
        redemption_limit_per_user: 1,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "rwd-003",
        event_id: "evt-004",
        venue_id: "v-rebel",
        name: "10% Off Drinks",
        reward_type: "discount",
        description: "Apply 10% discount on all drink purchases.",
        min_level: 2,
        expiry_type: "same_night",
        inventory_limit: null,
        redemption_limit_per_user: 1,
        created_at: fmt(daysAgo(30)),
    },
];

// ── Ticket Types ────────────────────────────────────────────

export const MOCK_TICKET_TYPES: TicketType[] = [
    {
        id: "tkt-type-001",
        event_id: "evt-002",
        name: "General Admission",
        price: 35.0,
        quantity: 1500,
        sales_start: fmt(daysAgo(14)),
        sales_end: fmt(daysFromNow(1)),
        description: "Standard entry — includes coat check.",
        sold: 892,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "tkt-type-002",
        event_id: "evt-002",
        name: "VIP",
        price: 75.0,
        quantity: 200,
        sales_start: fmt(daysAgo(14)),
        sales_end: fmt(daysFromNow(1)),
        description: "VIP lounge access + one complimentary drink.",
        sold: 145,
        created_at: fmt(daysAgo(14)),
    },
    {
        id: "tkt-type-003",
        event_id: "evt-005",
        name: "Early Bird",
        price: 25.0,
        quantity: 500,
        sales_start: fmt(daysAgo(5)),
        sales_end: fmt(daysFromNow(7)),
        description: "Limited early bird pricing.",
        sold: 320,
        created_at: fmt(daysAgo(5)),
    },
    {
        id: "tkt-type-004",
        event_id: "evt-005",
        name: "General Admission",
        price: 40.0,
        quantity: 1700,
        sales_start: fmt(daysFromNow(7)),
        sales_end: fmt(daysFromNow(16)),
        description: "Standard entry.",
        sold: 0,
        created_at: fmt(daysAgo(5)),
    },
];

// ── Analytics (last 7 days) ─────────────────────────────────

export const MOCK_ANALYTICS: EventAnalytics[] = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
    const base = isWeekend ? 1.6 : 1.0;
    return {
        id: `ana-${i}`,
        event_id: "all",
        date: d.toISOString().split("T")[0],
        map_impressions: Math.round(320 * base + Math.random() * 100),
        event_opens: Math.round(120 * base + Math.random() * 40),
        saves: Math.round(18 * base + Math.random() * 10),
        shares: Math.round(5 * base + Math.random() * 4),
        check_ins: Math.round(60 * base + Math.random() * 30),
        ticket_sales: Math.round(15 * base + Math.random() * 10),
    };
});

// ── Attendances (recent check-ins) ──────────────────────────

export const MOCK_ATTENDANCES: Attendance[] = [
    { id: "att-1", user_id: "u1", username: "alex.nights", event_id: "evt-001", venue_id: "v-rebel", checked_in_at: fmt(daysAgo(0)), method: "qr" },
    { id: "att-2", user_id: "u2", username: "maya_dance", event_id: "evt-001", venue_id: "v-rebel", checked_in_at: fmt(daysAgo(0)), method: "qr" },
    { id: "att-3", user_id: "u3", username: "torontovibes", event_id: "evt-001", venue_id: "v-rebel", checked_in_at: fmt(daysAgo(0)), method: "manual" },
    { id: "att-4", user_id: "u4", username: "nightowl99", event_id: "evt-004", venue_id: "v-rebel", checked_in_at: fmt(daysAgo(3)), method: "qr" },
    { id: "att-5", user_id: "u5", username: "beatsandbars", event_id: "evt-004", venue_id: "v-rebel", checked_in_at: fmt(daysAgo(3)), method: "qr" },
];

// ── Ticket Purchases (for door mode) ────────────────────────

export const MOCK_TICKET_PURCHASES: TicketPurchase[] = [
    { id: "tp-1", user_id: "u1", event_id: "evt-002", ticket_id: "tkt-type-001", ticket_type_name: "General Admission", buyer_name: "Alex Nights", ticket_qr_secret: "MOCK_tqr_001", status: "valid", purchased_at: fmt(daysAgo(3)) },
    { id: "tp-2", user_id: "u2", event_id: "evt-002", ticket_id: "tkt-type-002", ticket_type_name: "VIP", buyer_name: "Maya Dance", ticket_qr_secret: "MOCK_tqr_002", status: "valid", purchased_at: fmt(daysAgo(2)) },
    { id: "tp-3", user_id: "u3", event_id: "evt-002", ticket_id: "tkt-type-001", ticket_type_name: "General Admission", buyer_name: "Toronto Vibes", ticket_qr_secret: "MOCK_tqr_003", status: "used", purchased_at: fmt(daysAgo(5)) },
];

// ── Computed Stats ──────────────────────────────────────────

export function getSupplierStats() {
    const thisWeek = MOCK_ANALYTICS;
    const totals = thisWeek.reduce(
        (acc, day) => ({
            impressions: acc.impressions + day.map_impressions,
            opens: acc.opens + day.event_opens,
            checkins: acc.checkins + day.check_ins,
            ticketSales: acc.ticketSales + day.ticket_sales,
        }),
        { impressions: 0, opens: 0, checkins: 0, ticketSales: 0 }
    );

    // Simulated previous week (lower numbers)
    return {
        impressions: { value: totals.impressions, change: 12.4 },
        opens: { value: totals.opens, change: 8.7 },
        checkins: { value: totals.checkins, change: -3.2 },
        ticketSales: { value: totals.ticketSales, change: 24.1 },
    };
}
