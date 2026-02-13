/**
 * Mock Feed Data for Soirée MVP
 *
 * Sample posts, comments, and notifications for the social feed.
 */

import type { Post, Comment } from "./types";

// Mock authors
const AUTHORS = {
    alex: { username: "alex.nights", display_name: "Alex Chen", profile_picture_url: null },
    maya: { username: "maya.vibes", display_name: "Maya Patel", profile_picture_url: null },
    jordan: { username: "jord_toronto", display_name: "Jordan Williams", profile_picture_url: null },
    priya: { username: "priya.party", display_name: "Priya Sharma", profile_picture_url: null },
    marcus: { username: "marcusdj", display_name: "Marcus Lee", profile_picture_url: null },
    sofia: { username: "sofia.soiree", display_name: "Sofia Reyes", profile_picture_url: null },
    ethan: { username: "ethan.up", display_name: "Ethan Park", profile_picture_url: null },
};

// Time helpers — produce ISO strings offset from now
function hoursAgo(h: number): string {
    return new Date(Date.now() - h * 3600_000).toISOString();
}

export const MOCK_POSTS: Post[] = [
    {
        id: "p-001",
        user_id: "u-001",
        user: AUTHORS.alex,
        venue_id: "v-001",
        venue: { name: "Rebel", latitude: 43.6398, longitude: -79.3553 },
        caption: "Best night at Rebel 🔥 The energy was unreal tonight — caught the whole crowd going off during the drop 🎶",
        image_urls: ["linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)"],
        location_name: "Rebel",
        created_at: hoursAgo(2),
        like_count: 127,
        comment_count: 14,
        is_liked_by_user: false,
    },
    {
        id: "p-002",
        user_id: "u-002",
        user: AUTHORS.maya,
        venue_id: "v-005",
        venue: { name: "Lavelle", latitude: 43.6446, longitude: -79.4007 },
        caption: "Rooftop vibes on a Friday night ✨ Toronto skyline hits different from up here",
        image_urls: [
            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        ],
        location_name: "Lavelle",
        created_at: hoursAgo(4),
        like_count: 89,
        comment_count: 7,
        is_liked_by_user: true,
    },
    {
        id: "p-003",
        user_id: "u-003",
        user: AUTHORS.jordan,
        venue_id: "v-002",
        venue: { name: "Toybox", latitude: 43.6464, longitude: -79.3979 },
        caption: "Toybox never disappoints 🪩 The DJ set was insane — who else was there??",
        image_urls: ["linear-gradient(135deg, #7c3aed 0%, #f43f5e 100%)"],
        location_name: "Toybox",
        created_at: hoursAgo(6),
        like_count: 234,
        comment_count: 31,
        is_liked_by_user: false,
    },
    {
        id: "p-004",
        user_id: "u-004",
        user: AUTHORS.priya,
        venue_id: "v-008",
        venue: { name: "The Mahjong Bar", latitude: 43.6463, longitude: -79.4222 },
        caption: "Finally tried this spot — not disappointed 🍸 The cocktails here are on another level",
        image_urls: [
            "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
            "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)",
            "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
        ],
        location_name: "The Mahjong Bar",
        created_at: hoursAgo(8),
        like_count: 56,
        comment_count: 5,
        is_liked_by_user: false,
    },
    {
        id: "p-005",
        user_id: "u-005",
        user: AUTHORS.marcus,
        venue_id: "v-003",
        venue: { name: "CODA", latitude: 43.6631, longitude: -79.4113 },
        caption: "Underground techno night at CODA 🎧 This venue is a vibe. Pure sound, zero distractions.",
        image_urls: ["linear-gradient(135deg, #0f172a 0%, #581c87 100%)"],
        location_name: "CODA",
        created_at: hoursAgo(12),
        like_count: 178,
        comment_count: 22,
        is_liked_by_user: true,
    },
    {
        id: "p-006",
        user_id: "u-006",
        user: AUTHORS.sofia,
        venue_id: "v-011",
        venue: { name: "Lost & Found", latitude: 43.6448, longitude: -79.3985 },
        caption: "The vibes were unmatched tonight 💃🏽 Lost & Found with the crew — perfect way to end the week",
        image_urls: [
            "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
            "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
        ],
        location_name: "Lost & Found",
        created_at: hoursAgo(16),
        like_count: 312,
        comment_count: 45,
        is_liked_by_user: false,
    },
    {
        id: "p-007",
        user_id: "u-007",
        user: AUTHORS.ethan,
        venue_id: "v-004",
        venue: { name: "EFS Toronto", latitude: 43.6443, longitude: -79.4015 },
        caption: "VIP night at EFS 🥂 When they say upscale, they mean it. Every detail is premium.",
        image_urls: ["linear-gradient(135deg, #f59e0b 0%, #78350f 100%)"],
        location_name: "EFS Toronto",
        created_at: hoursAgo(20),
        like_count: 94,
        comment_count: 11,
        is_liked_by_user: false,
    },
    {
        id: "p-008",
        user_id: "u-001",
        user: AUTHORS.alex,
        venue_id: "v-010",
        venue: { name: "Cube Nightclub", latitude: 43.6498, longitude: -79.3932 },
        caption: "Cube goes hard on event nights 🎉 The lineup was stacked — every set was fire",
        image_urls: [
            "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        ],
        location_name: "Cube Nightclub",
        created_at: hoursAgo(28),
        like_count: 67,
        comment_count: 8,
        is_liked_by_user: false,
    },
];

// Mock comments per post
export const MOCK_COMMENTS: Record<string, Comment[]> = {
    "p-001": [
        { id: "c-001", user: AUTHORS.maya, comment_text: "Looks insane! 🔥 Wish I was there", created_at: hoursAgo(1.5) },
        { id: "c-002", user: AUTHORS.jordan, comment_text: "That drop was crazy, the whole floor was moving", created_at: hoursAgo(1.8) },
        { id: "c-003", user: AUTHORS.priya, comment_text: "Rebel never misses", created_at: hoursAgo(1.9) },
    ],
    "p-002": [
        { id: "c-004", user: AUTHORS.alex, comment_text: "The skyline view 😍", created_at: hoursAgo(3.5) },
        { id: "c-005", user: AUTHORS.sofia, comment_text: "Need to check this out asap", created_at: hoursAgo(3.8) },
    ],
    "p-003": [
        { id: "c-006", user: AUTHORS.marcus, comment_text: "Was there! That DJ set was next level", created_at: hoursAgo(5.5) },
        { id: "c-007", user: AUTHORS.priya, comment_text: "Toybox on a Friday = elite", created_at: hoursAgo(5.7) },
        { id: "c-008", user: AUTHORS.alex, comment_text: "Who was the second DJ? Need to find their set", created_at: hoursAgo(5.9) },
    ],
    "p-004": [
        { id: "c-009", user: AUTHORS.maya, comment_text: "Their signature cocktail is unreal 🍸", created_at: hoursAgo(7.5) },
    ],
    "p-005": [
        { id: "c-010", user: AUTHORS.jordan, comment_text: "CODA is the best venue for techno in Toronto hands down", created_at: hoursAgo(11) },
        { id: "c-011", user: AUTHORS.sofia, comment_text: "Pure vibe 🎧", created_at: hoursAgo(11.5) },
    ],
    "p-006": [
        { id: "c-012", user: AUTHORS.marcus, comment_text: "Lost & Found is always a movie 🎬", created_at: hoursAgo(15) },
        { id: "c-013", user: AUTHORS.ethan, comment_text: "Crew nights > everything", created_at: hoursAgo(15.2) },
        { id: "c-014", user: AUTHORS.alex, comment_text: "Love this place, the energy is always right", created_at: hoursAgo(15.5) },
    ],
};
