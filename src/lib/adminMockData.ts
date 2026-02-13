/**
 * Admin Mock Data
 *
 * Realistic test data for admin dashboard:
 * suppliers (various statuses), users, events, admin actions, flags,
 * platform stats, and growth data.
 */

import type {
    Supplier,
    SupplierEvent,
    EventAnalytics,
} from "@/lib/types";

// ── Helpers ─────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
};

// ── Admin Types (local to mock) ─────────────────────────────

export interface AdminAction {
    id: string;
    admin_id: string;
    admin_name: string;
    action_type: string;
    target_type: string;
    target_id: string;
    target_name: string;
    reason?: string;
    created_at: string;
}

export interface Flag {
    id: string;
    reporter_id: string;
    reporter_name: string;
    target_type: "user" | "event" | "post" | "comment";
    target_id: string;
    target_name: string;
    reason: string;
    status: "pending" | "reviewed" | "dismissed" | "actioned";
    reviewed_by?: string;
    notes?: string;
    created_at: string;
}

export interface AdminUser {
    id: string;
    username: string;
    display_name?: string;
    email: string;
    role: "consumer" | "supplier" | "admin";
    level: number;
    total_xp: number;
    stars: number;
    date_of_birth: string;
    music_preferences: string[];
    vibe_preferences: string[];
    is_banned: boolean;
    ban_reason?: string;
    checkins_count: number;
    posts_count: number;
    flags_count: number;
    created_at: string;
}

export interface AdminSupplier extends Supplier {
    contact_name?: string;
    email?: string;
    venues_count: number;
    events_count: number;
    total_checkins: number;
    rejection_reason?: string;
}

export interface PlatformGrowthPoint {
    date: string;
    new_users: number;
    new_suppliers: number;
    check_ins: number;
    events_published: number;
}

export interface AdminStats {
    totalUsers: number;
    usersChange: number;
    totalSuppliers: number;
    suppliersPending: number;
    suppliersApproved: number;
    suppliersRejected: number;
    activeEvents: number;
    totalCheckins7d: number;
    checkinsChange: number;
    pendingFlags: number;
    flaggedEvents: number;
    flaggedUsers: number;
}

// ── Mock Suppliers ──────────────────────────────────────────

export const MOCK_ADMIN_SUPPLIERS: AdminSupplier[] = [
    {
        id: "sup-001",
        user_id: "user-sup-001",
        business_name: "Rebel Nightclub",
        contact_name: "Marcus Chen",
        contact_email: "manager@rebelnightclub.com",
        email: "manager@rebelnightclub.com",
        phone: "+1 416-555-0199",
        website: "https://rebelnightclub.com",
        verification_status: "approved",
        stripe_connect_id: "MOCK_acct_000000001",
        plan: "pro",
        social_links: { instagram: "@rebeltoronto", facebook: "RebelNightclub", tiktok: "@rebelnightclub" },
        venues_count: 1,
        events_count: 12,
        total_checkins: 4820,
        created_at: fmt(daysAgo(180)),
        updated_at: fmt(daysAgo(2)),
    },
    {
        id: "sup-002",
        user_id: "user-sup-002",
        business_name: "Toybox Toronto",
        contact_name: "Aisha Patel",
        contact_email: "info@toyboxtoronto.com",
        email: "info@toyboxtoronto.com",
        phone: "+1 416-555-0234",
        website: "https://toyboxtoronto.com",
        verification_status: "pending",
        plan: "basic",
        venues_count: 1,
        events_count: 0,
        total_checkins: 0,
        created_at: fmt(daysAgo(3)),
        updated_at: fmt(daysAgo(3)),
    },
    {
        id: "sup-003",
        user_id: "user-sup-003",
        business_name: "EFS Toronto",
        contact_name: "Jordan Blake",
        contact_email: "jordan@efstoronto.com",
        email: "jordan@efstoronto.com",
        verification_status: "approved",
        stripe_connect_id: "MOCK_acct_000000003",
        plan: "tickets",
        venues_count: 1,
        events_count: 8,
        total_checkins: 2340,
        created_at: fmt(daysAgo(120)),
        updated_at: fmt(daysAgo(5)),
    },
    {
        id: "sup-004",
        user_id: "user-sup-004",
        business_name: "The Velvet Room",
        contact_name: "Sofia Reyes",
        contact_email: "sofia@velvetroom.ca",
        email: "sofia@velvetroom.ca",
        verification_status: "pending",
        plan: "pro",
        venues_count: 0,
        events_count: 0,
        total_checkins: 0,
        created_at: fmt(daysAgo(1)),
        updated_at: fmt(daysAgo(1)),
    },
    {
        id: "sup-005",
        user_id: "user-sup-005",
        business_name: "Night Owl Lounge",
        contact_name: "Derek Osei",
        contact_email: "derek@nightowllounge.com",
        email: "derek@nightowllounge.com",
        verification_status: "rejected",
        plan: "basic",
        rejection_reason: "Business license not provided. Please resubmit with valid documentation.",
        venues_count: 0,
        events_count: 0,
        total_checkins: 0,
        created_at: fmt(daysAgo(14)),
        updated_at: fmt(daysAgo(10)),
    },
    {
        id: "sup-006",
        user_id: "user-sup-006",
        business_name: "Club Underground",
        contact_name: "Rick Novak",
        contact_email: "rick@clubunderground.ca",
        email: "rick@clubunderground.ca",
        verification_status: "banned",
        plan: "basic",
        venues_count: 1,
        events_count: 3,
        total_checkins: 150,
        created_at: fmt(daysAgo(90)),
        updated_at: fmt(daysAgo(7)),
    },
];

// ── Mock Users ──────────────────────────────────────────────

export const MOCK_ADMIN_USERS: AdminUser[] = [
    {
        id: "u-001", username: "alex.nights", display_name: "Alex Nights",
        email: "alex@example.com", role: "consumer", level: 8, total_xp: 840, stars: 72,
        date_of_birth: "2001-05-15", music_preferences: ["House", "Techno"], vibe_preferences: ["Rave", "Late night"],
        is_banned: false, checkins_count: 34, posts_count: 12, flags_count: 0, created_at: fmt(daysAgo(90)),
    },
    {
        id: "u-002", username: "maya_dance", display_name: "Maya Dance",
        email: "maya@example.com", role: "consumer", level: 12, total_xp: 1340, stars: 88,
        date_of_birth: "2000-11-02", music_preferences: ["R&B", "Pop", "Latin"], vibe_preferences: ["Upscale", "Party"],
        is_banned: false, checkins_count: 56, posts_count: 28, flags_count: 0, created_at: fmt(daysAgo(150)),
    },
    {
        id: "u-003", username: "torontovibes", display_name: "Toronto Vibes",
        email: "tvibes@example.com", role: "consumer", level: 5, total_xp: 480, stars: 45,
        date_of_birth: "1999-08-20", music_preferences: ["Hip-Hop", "R&B"], vibe_preferences: ["Hip hop", "Party"],
        is_banned: false, checkins_count: 18, posts_count: 5, flags_count: 2, created_at: fmt(daysAgo(60)),
    },
    {
        id: "u-004", username: "nightowl99", display_name: "Night Owl",
        email: "nightowl@example.com", role: "consumer", level: 3, total_xp: 280, stars: 30,
        date_of_birth: "2002-01-10", music_preferences: ["EDM", "House"], vibe_preferences: ["Rave"],
        is_banned: false, checkins_count: 9, posts_count: 2, flags_count: 0, created_at: fmt(daysAgo(30)),
    },
    {
        id: "u-005", username: "beatsandbars", display_name: "Beats & Bars",
        email: "beats@example.com", role: "consumer", level: 15, total_xp: 1800, stars: 92,
        date_of_birth: "1998-03-25", music_preferences: ["Hip-Hop", "Afrobeats", "R&B"], vibe_preferences: ["Party", "Live music"],
        is_banned: false, checkins_count: 78, posts_count: 45, flags_count: 0, created_at: fmt(daysAgo(200)),
    },
    {
        id: "u-006", username: "spammer420", display_name: "Spam Bot",
        email: "spam@example.com", role: "consumer", level: 1, total_xp: 20, stars: 5,
        date_of_birth: "2003-07-01", music_preferences: [], vibe_preferences: [],
        is_banned: true, ban_reason: "Spam posts and fake check-ins", checkins_count: 2, posts_count: 50, flags_count: 8,
        created_at: fmt(daysAgo(15)),
    },
    {
        id: "u-007", username: "latenight_lena", display_name: "Lena K",
        email: "lena@example.com", role: "consumer", level: 6, total_xp: 620, stars: 55,
        date_of_birth: "2001-12-18", music_preferences: ["Techno", "House"], vibe_preferences: ["Late night", "Intimate"],
        is_banned: false, checkins_count: 22, posts_count: 8, flags_count: 1, created_at: fmt(daysAgo(70)),
    },
    {
        id: "u-008", username: "dj_marco", display_name: "DJ Marco",
        email: "marco@example.com", role: "consumer", level: 10, total_xp: 1100, stars: 80,
        date_of_birth: "1997-06-30", music_preferences: ["House", "Disco", "Techno"], vibe_preferences: ["Rave", "Live music"],
        is_banned: false, checkins_count: 44, posts_count: 18, flags_count: 0, created_at: fmt(daysAgo(130)),
    },
];

// ── Mock Admin Events (broader platform view) ──────────────

export const MOCK_ADMIN_EVENTS: SupplierEvent[] = [
    {
        id: "evt-a01", supplier_id: "sup-001", venue_id: "v-rebel", venue_name: "Rebel Nightclub",
        name: "Saturday Night Fever", venue_type: "nights", venue_category: "club",
        event_date: fmt(daysAgo(-2)), age_requirement: 19,
        music_types: ["House", "EDM"], vibes: ["Rave", "Party"],
        cover_range: "$20-30", price_tier: "$$", capacity: 2500,
        gallery_images: ["linear-gradient(135deg, #667eea, #764ba2)"],
        checkin_qr_secret: "MOCK_qr_a01", status: "published",
        tasks_enabled: true, rewards_enabled: true, created_at: fmt(daysAgo(14)),
        views: 2340, opens: 892, saves: 156, checkins: 423,
    },
    {
        id: "evt-a02", supplier_id: "sup-001", venue_id: "v-rebel", venue_name: "Rebel Nightclub",
        name: "Neon Dreams — Valentine's Special", venue_type: "tickets", venue_category: "club",
        event_date: fmt(daysAgo(-1)), age_requirement: 19,
        music_types: ["R&B", "Pop"], vibes: ["Upscale", "Intimate"],
        price_tier: "$$$", capacity: 1800,
        gallery_images: ["linear-gradient(135deg, #ff6b6b, #ee5a24)"],
        checkin_qr_secret: "MOCK_qr_a02", status: "published",
        tasks_enabled: true, rewards_enabled: true,
        refund_policy: "Full refund until 24 hours before", created_at: fmt(daysAgo(7)),
        views: 4120, opens: 1560, saves: 312, checkins: 0,
    },
    {
        id: "evt-a03", supplier_id: "sup-003", venue_id: "v-efs", venue_name: "EFS Toronto",
        name: "R&B Fridays", venue_type: "nights", venue_category: "lounge",
        event_date: fmt(daysAgo(-5)), age_requirement: 19,
        music_types: ["R&B", "Hip-Hop"], vibes: ["Upscale", "Lounge"],
        cover_range: "$15-25", price_tier: "$$", capacity: 800,
        gallery_images: ["linear-gradient(135deg, #a78bfa, #8b5cf6)"],
        checkin_qr_secret: "MOCK_qr_a03", status: "published",
        tasks_enabled: false, rewards_enabled: true, created_at: fmt(daysAgo(21)),
        views: 1560, opens: 580, saves: 92, checkins: 310,
    },
    {
        id: "evt-a04", supplier_id: "sup-003", venue_id: "v-efs", venue_name: "EFS Toronto",
        name: "Latin Heat Night", venue_type: "tickets", venue_category: "lounge",
        event_date: fmt(daysAgo(3)), age_requirement: 19,
        music_types: ["Latin", "Pop"], vibes: ["Party"],
        price_tier: "$$", capacity: 800,
        gallery_images: ["linear-gradient(135deg, #f7971e, #ffd200)"],
        checkin_qr_secret: "MOCK_qr_a04", status: "ended",
        tasks_enabled: true, rewards_enabled: false, created_at: fmt(daysAgo(30)),
        views: 2100, opens: 780, saves: 64, checkins: 520,
    },
    {
        id: "evt-a05", supplier_id: "sup-001", venue_id: "v-rebel", venue_name: "Rebel Nightclub",
        name: "Techno Underground", venue_type: "nights", venue_category: "club",
        event_date: fmt(daysAgo(-9)), age_requirement: 19,
        music_types: ["Techno", "House"], vibes: ["Rave", "Late night"],
        cover_range: "$15-25", price_tier: "$$", capacity: 2000,
        gallery_images: ["linear-gradient(135deg, #0f0c29, #302b63)"],
        checkin_qr_secret: "MOCK_qr_a05", status: "draft",
        tasks_enabled: false, rewards_enabled: false, created_at: fmt(daysAgo(2)),
    },
    {
        id: "evt-a06", supplier_id: "sup-006", venue_id: "v-underground", venue_name: "Club Underground",
        name: "Bass Drop Saturdays", venue_type: "nights", venue_category: "club",
        event_date: fmt(daysAgo(10)), age_requirement: 19,
        music_types: ["EDM", "House"], vibes: ["Rave"],
        cover_range: "$10", price_tier: "$", capacity: 500,
        gallery_images: ["linear-gradient(135deg, #434343, #000000)"],
        checkin_qr_secret: "MOCK_qr_a06", status: "ended",
        tasks_enabled: false, rewards_enabled: false, created_at: fmt(daysAgo(40)),
        views: 450, opens: 120, saves: 8, checkins: 85,
    },
];

// ── Mock Flags ──────────────────────────────────────────────

export const MOCK_FLAGS: Flag[] = [
    {
        id: "flag-001", reporter_id: "u-002", reporter_name: "maya_dance",
        target_type: "event", target_id: "evt-a06", target_name: "Bass Drop Saturdays",
        reason: "Event promoted underage drinking",
        status: "pending", created_at: fmt(daysAgo(2)),
    },
    {
        id: "flag-002", reporter_id: "u-001", reporter_name: "alex.nights",
        target_type: "user", target_id: "u-006", target_name: "spammer420",
        reason: "Posting spam and fake check-ins repeatedly",
        status: "actioned", reviewed_by: "admin-001", notes: "User banned",
        created_at: fmt(daysAgo(8)),
    },
    {
        id: "flag-003", reporter_id: "u-005", reporter_name: "beatsandbars",
        target_type: "user", target_id: "u-003", target_name: "torontovibes",
        reason: "Inappropriate comments on posts",
        status: "pending", created_at: fmt(daysAgo(1)),
    },
    {
        id: "flag-004", reporter_id: "u-004", reporter_name: "nightowl99",
        target_type: "event", target_id: "evt-a01", target_name: "Saturday Night Fever",
        reason: "Misleading event description",
        status: "dismissed", reviewed_by: "admin-001", notes: "Event description is accurate",
        created_at: fmt(daysAgo(5)),
    },
    {
        id: "flag-005", reporter_id: "u-007", reporter_name: "latenight_lena",
        target_type: "user", target_id: "u-006", target_name: "spammer420",
        reason: "Harassment in comments",
        status: "actioned", reviewed_by: "admin-001", notes: "Already banned",
        created_at: fmt(daysAgo(7)),
    },
];

// ── Mock Admin Actions ──────────────────────────────────────

export const MOCK_ADMIN_ACTIONS: AdminAction[] = [
    {
        id: "aa-001", admin_id: "admin-001", admin_name: "Admin",
        action_type: "approve_supplier", target_type: "supplier", target_id: "sup-001", target_name: "Rebel Nightclub",
        created_at: fmt(daysAgo(180)),
    },
    {
        id: "aa-002", admin_id: "admin-001", admin_name: "Admin",
        action_type: "approve_supplier", target_type: "supplier", target_id: "sup-003", target_name: "EFS Toronto",
        created_at: fmt(daysAgo(120)),
    },
    {
        id: "aa-003", admin_id: "admin-001", admin_name: "Admin",
        action_type: "reject_supplier", target_type: "supplier", target_id: "sup-005", target_name: "Night Owl Lounge",
        reason: "Business license not provided",
        created_at: fmt(daysAgo(10)),
    },
    {
        id: "aa-004", admin_id: "admin-001", admin_name: "Admin",
        action_type: "ban_user", target_type: "user", target_id: "u-006", target_name: "spammer420",
        reason: "Spam posts and fake check-ins",
        created_at: fmt(daysAgo(8)),
    },
    {
        id: "aa-005", admin_id: "admin-001", admin_name: "Admin",
        action_type: "ban_supplier", target_type: "supplier", target_id: "sup-006", target_name: "Club Underground",
        reason: "Safety violations and repeated policy breaches",
        created_at: fmt(daysAgo(7)),
    },
    {
        id: "aa-006", admin_id: "admin-001", admin_name: "Admin",
        action_type: "dismiss_flag", target_type: "event", target_id: "evt-a01", target_name: "Saturday Night Fever",
        created_at: fmt(daysAgo(5)),
    },
    {
        id: "aa-007", admin_id: "admin-001", admin_name: "Admin",
        action_type: "unpublish_event", target_type: "event", target_id: "evt-a06", target_name: "Bass Drop Saturdays",
        reason: "Supplier account banned",
        created_at: fmt(daysAgo(7)),
    },
];

// ── Platform Growth (last 30 days) ──────────────────────────

export const MOCK_GROWTH_DATA: PlatformGrowthPoint[] = Array.from({ length: 30 }, (_, i) => {
    const d = daysAgo(29 - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
    const weekFactor = isWeekend ? 1.8 : 1.0;
    const trendFactor = 1 + (i / 30) * 0.3; // growth trend

    return {
        date: d.toISOString().split("T")[0],
        new_users: Math.round((8 + Math.random() * 6) * weekFactor * trendFactor),
        new_suppliers: Math.round(Math.random() * 2),
        check_ins: Math.round((40 + Math.random() * 30) * weekFactor * trendFactor),
        events_published: Math.round((1 + Math.random() * 3) * (isWeekend ? 1.5 : 1)),
    };
});

// ── Analytics (for top venues) ──────────────────────────────

export const MOCK_VENUE_ANALYTICS: { venue_name: string; supplier: string; checkins: number; opens: number; saves: number; status: string }[] = [
    { venue_name: "Rebel Nightclub", supplier: "Rebel Nightclub", checkins: 423, opens: 892, saves: 156, status: "Active" },
    { venue_name: "EFS Toronto", supplier: "EFS Toronto", checkins: 310, opens: 580, saves: 92, status: "Active" },
    { venue_name: "KBox Karaoke", supplier: "—", checkins: 120, opens: 340, saves: 45, status: "Listing" },
    { venue_name: "Sing Sing Karaoke", supplier: "—", checkins: 85, opens: 220, saves: 32, status: "Listing" },
    { venue_name: "Club Underground", supplier: "Club Underground", checkins: 0, opens: 0, saves: 0, status: "Banned" },
];

// ── Computed Platform Stats ─────────────────────────────────

export function getAdminStats(): AdminStats {
    const pendingSuppliers = MOCK_ADMIN_SUPPLIERS.filter(s => s.verification_status === "pending").length;
    const approvedSuppliers = MOCK_ADMIN_SUPPLIERS.filter(s => s.verification_status === "approved").length;
    const rejectedSuppliers = MOCK_ADMIN_SUPPLIERS.filter(s => s.verification_status === "rejected").length;
    const activeEvents = MOCK_ADMIN_EVENTS.filter(e => e.status === "published").length;
    const totalCheckins = MOCK_ADMIN_EVENTS.reduce((sum, e) => sum + (e.checkins || 0), 0);
    const pendingFlags = MOCK_FLAGS.filter(f => f.status === "pending").length;
    const flaggedEvents = MOCK_FLAGS.filter(f => f.target_type === "event" && f.status === "pending").length;
    const flaggedUsers = MOCK_FLAGS.filter(f => f.target_type === "user" && f.status === "pending").length;

    return {
        totalUsers: MOCK_ADMIN_USERS.length,
        usersChange: 14.2,
        totalSuppliers: MOCK_ADMIN_SUPPLIERS.length,
        suppliersPending: pendingSuppliers,
        suppliersApproved: approvedSuppliers,
        suppliersRejected: rejectedSuppliers,
        activeEvents,
        totalCheckins7d: totalCheckins,
        checkinsChange: 8.5,
        pendingFlags,
        flaggedEvents,
        flaggedUsers,
    };
}

// ── Action labels ───────────────────────────────────────────

export const ACTION_LABELS: Record<string, string> = {
    approve_supplier: "Approved supplier",
    reject_supplier: "Rejected supplier",
    ban_supplier: "Banned supplier",
    unban_supplier: "Unbanned supplier",
    ban_user: "Banned user",
    unban_user: "Unbanned user",
    unpublish_event: "Unpublished event",
    delete_event: "Deleted event",
    dismiss_flag: "Dismissed flag",
    action_flag: "Actioned flag",
    create_account: "Created account",
    create_supplier: "Created supplier",
    approve_application: "Approved application",
    reject_application: "Rejected application",
    event_published: "Published event",
    supplier_application: "Supplier applied",
    user_registered: "New user registered",
};
