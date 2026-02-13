"use client";

/**
 * Feed Page — Social Feed
 *
 * Twitter-style text-first feed with sorting tabs:
 * Nearby | Trending | Following | Newest
 */

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/types";
import { MOCK_POSTS, MOCK_COMMENTS } from "@/lib/feedMockData";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import NotificationBell from "@/components/feed/NotificationBell";
import BottomNav from "@/components/BottomNav";

const POSTS_PER_PAGE = 5;

type SortTab = "nearby" | "trending" | "following" | "newest";

const SORT_TABS: { id: SortTab; label: string }[] = [
    { id: "nearby", label: "Nearby" },
    { id: "trending", label: "Trending" },
    { id: "following", label: "Following" },
    { id: "newest", label: "Newest" },
];

export default function FeedPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SortTab>("nearby");
    const [showCreate, setShowCreate] = useState(false);
    const [page, setPage] = useState(1);

    // Sort posts based on active tab (MVP: simple stubs)
    const sortedPosts = useMemo(() => {
        const posts = [...MOCK_POSTS];
        switch (activeTab) {
            case "trending":
                return posts.sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count));
            case "newest":
                return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            case "following":
                // MVP: show all posts (no follow graph yet)
                return posts;
            case "nearby":
            default:
                // MVP: default order (would be geo-sorted with real data)
                return posts;
        }
    }, [activeTab]);

    const visiblePosts = sortedPosts.slice(0, page * POSTS_PER_PAGE);
    const hasMore = visiblePosts.length < sortedPosts.length;

    const loadMore = useCallback(() => {
        setPage((p) => p + 1);
    }, []);

    const handleCreatePost = useCallback(
        (data: { caption: string; imageUrl: string; venueName: string | null; venueId: string | null }) => {
            const newPost: Post = {
                id: `p-new-${Date.now()}`,
                user_id: "me",
                user: { username: "you", display_name: "You", profile_picture_url: null },
                venue_id: data.venueId,
                venue: data.venueName ? { name: data.venueName, latitude: 0, longitude: 0 } : null,
                caption: data.caption,
                image_urls: data.imageUrl ? [data.imageUrl] : [],
                location_name: data.venueName,
                created_at: new Date().toISOString(),
                like_count: 0,
                comment_count: 0,
                is_liked_by_user: false,
            };
            MOCK_POSTS.unshift(newPost);
            setPage(1);
            console.log("[Soirée] New post created:", newPost);
        },
        []
    );

    return (
        <div className="min-h-dvh bg-background pb-20">
            {/* ── Top Navigation ──────────────────────────── */}
            <nav className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-lg border-b border-border">
                {/* Logo */}
                <button
                    onClick={() => router.push("/home")}
                    className="flex items-center gap-2"
                >
                    <span className="text-lg">🌙</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-accent-glow via-accent to-neon-pink bg-clip-text text-transparent">
                        Soirée
                    </span>
                </button>

                {/* Right actions */}
                <div className="flex items-center gap-1">
                    {/* Search */}
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-hover transition-colors"
                        aria-label="Search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>

                    {/* Notifications */}
                    <NotificationBell unreadCount={3} />
                </div>
            </nav>

            {/* ── Sorting Tabs ────────────────────────────── */}
            <div className="sticky top-[57px] z-20 flex items-center border-b border-border bg-background/90 backdrop-blur-lg">
                {SORT_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setPage(1);
                        }}
                        className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${activeTab === tab.id
                                ? "text-accent"
                                : "text-foreground-muted hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-accent" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Feed ────────────────────────────────────── */}
            <main>
                {visiblePosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <span className="text-5xl mb-4">📸</span>
                        <p className="text-lg font-semibold text-foreground mb-1">
                            No posts yet
                        </p>
                        <p className="text-sm text-foreground-muted max-w-xs">
                            Be the first to share your night! Tap the + button to create a post.
                        </p>
                    </div>
                ) : (
                    <>
                        {visiblePosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                comments={MOCK_COMMENTS[post.id] || []}
                            />
                        ))}

                        {/* Load more */}
                        {hasMore && (
                            <div className="flex justify-center py-6">
                                <button
                                    onClick={loadMore}
                                    className="rounded-full bg-surface border border-border px-6 py-2.5 text-sm font-medium text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                                >
                                    Load more
                                </button>
                            </div>
                        )}

                        {!hasMore && visiblePosts.length > 0 && (
                            <div className="text-center py-8">
                                <p className="text-xs text-foreground-muted/50">
                                    You&apos;re all caught up 🌙
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Create Post FAB ─────────────────────────── */}
            <button
                onClick={() => setShowCreate(true)}
                className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 text-white text-2xl font-light hover:bg-accent-glow active:scale-95 transition-all duration-200"
                aria-label="Create post"
            >
                +
            </button>

            {/* ── Create Post Modal ───────────────────────── */}
            <CreatePostModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onPost={handleCreatePost}
            />

            {/* ── Bottom Navigation ──────────────────────── */}
            <BottomNav />
        </div>
    );
}
