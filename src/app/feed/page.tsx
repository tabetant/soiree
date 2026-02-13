"use client";

/**
 * Feed Page — Social Feed
 *
 * Twitter-style text-first feed with sorting tabs:
 * Nearby | Trending | Following | Newest
 *
 * Uses real Supabase data when dev mode is OFF.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Post, Comment } from "@/lib/types";
import { isDevMode } from "@/lib/devMode";
import { createClient } from "@/lib/supabase";
import { MOCK_POSTS, MOCK_COMMENTS } from "@/lib/feedMockData";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import NotificationBell from "@/components/feed/NotificationBell";
import BottomNav from "@/components/BottomNav";

const POSTS_PER_PAGE = 10;

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

    // Real data state
    const [posts, setPosts] = useState<Post[]>([]);
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [notifCount, setNotifCount] = useState(0);

    // ── Load posts ──
    const loadPosts = useCallback(async () => {
        // Dev mode: use mock data
        if (isDevMode()) {
            console.log("[Feed] Dev mode ON → using mock data");
            setPosts(MOCK_POSTS);
            setCommentsMap(MOCK_COMMENTS);
            setLoading(false);
            return;
        }

        console.log("[Feed] Dev mode OFF → fetching from Supabase, tab:", activeTab);
        setLoading(true);

        try {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || null;
            setCurrentUserId(userId);

            // Build base query — fetch posts with user profile, venue, counts
            let query = supabase
                .from("posts")
                .select(`
                    id,
                    user_id,
                    venue_id,
                    caption,
                    image_urls,
                    location_name,
                    created_at,
                    user:profiles!posts_user_id_fkey (
                        username,
                        display_name,
                        profile_picture_url
                    ),
                    venue:venues!posts_venue_id_fkey (
                        name,
                        latitude,
                        longitude
                    )
                `)
                .eq("is_public", true)
                .order("created_at", { ascending: false })
                .limit(50);

            // Apply tab filters
            if (activeTab === "following" && userId) {
                const { data: following } = await supabase
                    .from("user_follows")
                    .select("following_id")
                    .eq("follower_id", userId);

                const followingIds = following?.map(f => f.following_id) || [];
                if (followingIds.length > 0) {
                    query = query.in("user_id", followingIds);
                } else {
                    setPosts([]);
                    setLoading(false);
                    return;
                }
            } else if (activeTab === "nearby") {
                query = query.not("venue_id", "is", null);
            }

            const { data: rawPosts, error } = await query;
            if (error) throw error;

            if (!rawPosts || rawPosts.length === 0) {
                console.log("[Feed] No posts found");
                setPosts([]);
                setLoading(false);
                return;
            }

            const postIds = rawPosts.map(p => p.id);

            // Batch fetch like counts
            const { data: likeCounts } = await supabase
                .from("post_likes")
                .select("post_id")
                .in("post_id", postIds);

            // Batch fetch comment counts
            const { data: commentCounts } = await supabase
                .from("post_comments")
                .select("post_id")
                .in("post_id", postIds);

            // Batch fetch user's likes
            let userLikedPostIds = new Set<string>();
            if (userId) {
                const { data: userLikes } = await supabase
                    .from("post_likes")
                    .select("post_id")
                    .eq("user_id", userId)
                    .in("post_id", postIds);

                userLikedPostIds = new Set((userLikes || []).map(l => l.post_id));
            }

            // Count likes/comments per post
            const likeCountMap: Record<string, number> = {};
            const commentCountMap: Record<string, number> = {};

            for (const l of (likeCounts || [])) {
                likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
            }
            for (const c of (commentCounts || [])) {
                commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
            }

            // Build Post objects matching the Post type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedPosts: Post[] = rawPosts.map((p: any) => ({
                id: p.id,
                user_id: p.user_id,
                user: {
                    username: p.user?.username || "unknown",
                    display_name: p.user?.display_name || null,
                    profile_picture_url: p.user?.profile_picture_url || null,
                },
                venue_id: p.venue_id,
                venue: p.venue ? {
                    name: p.venue.name,
                    latitude: p.venue.latitude,
                    longitude: p.venue.longitude,
                } : null,
                caption: p.caption,
                image_urls: p.image_urls || [],
                location_name: p.location_name,
                created_at: p.created_at,
                like_count: likeCountMap[p.id] || 0,
                comment_count: commentCountMap[p.id] || 0,
                is_liked_by_user: userLikedPostIds.has(p.id),
            }));

            // Sort for trending by engagement
            if (activeTab === "trending") {
                enrichedPosts.sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count));
            }

            setPosts(enrichedPosts);

            // Fetch comments for visible posts
            const { data: commentsData } = await supabase
                .from("post_comments")
                .select(`
                    id,
                    post_id,
                    comment_text,
                    created_at,
                    user:profiles!post_comments_user_id_fkey (
                        username,
                        display_name,
                        profile_picture_url
                    )
                `)
                .in("post_id", postIds)
                .order("created_at", { ascending: true });

            const cMap: Record<string, Comment[]> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const c of (commentsData || []) as any[]) {
                const postId = c.post_id as string;
                if (!cMap[postId]) cMap[postId] = [];
                cMap[postId].push({
                    id: c.id,
                    user: {
                        username: c.user?.username || "unknown",
                        display_name: c.user?.display_name || null,
                        profile_picture_url: c.user?.profile_picture_url || null,
                    },
                    comment_text: c.comment_text,
                    created_at: c.created_at,
                });
            }
            setCommentsMap(cMap);

            // Fetch unread notification count
            if (userId) {
                const { count } = await supabase
                    .from("notifications")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .eq("is_read", false);

                setNotifCount(count || 0);
            }

            console.log(`[Feed] Loaded ${enrichedPosts.length} posts`);
        } catch (err) {
            console.error("[Feed] Error loading posts:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Paginated visible posts
    const visiblePosts = posts.slice(0, page * POSTS_PER_PAGE);
    const hasMore = visiblePosts.length < posts.length;

    const loadMore = useCallback(() => {
        setPage((p) => p + 1);
    }, []);

    // ── Create post handler ──
    const handleCreatePost = useCallback(
        async (data: { caption: string; imageUrl: string; venueName: string | null; venueId: string | null }) => {
            if (isDevMode()) {
                // Mock create
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
                setPosts((prev) => [newPost, ...prev]);
                setPage(1);
                return;
            }

            // Real create
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { error } = await supabase.from("posts").insert({
                    user_id: user.id,
                    caption: data.caption || null,
                    image_urls: data.imageUrl ? [data.imageUrl] : [],
                    venue_id: data.venueId || null,
                    location_name: data.venueName || null,
                    is_public: true,
                });

                if (error) throw error;
                console.log("[Feed] Post created successfully");
                // Reload feed
                loadPosts();
            } catch (err) {
                console.error("[Feed] Error creating post:", err);
            }
        },
        [loadPosts]
    );

    // ── Like/Unlike handler ──
    const handleLike = useCallback(
        async (postId: string, isCurrentlyLiked: boolean) => {
            if (isDevMode()) {
                // Just toggle locally
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId
                            ? {
                                ...p,
                                is_liked_by_user: !isCurrentlyLiked,
                                like_count: isCurrentlyLiked ? p.like_count - 1 : p.like_count + 1,
                            }
                            : p
                    )
                );
                return;
            }

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                if (isCurrentlyLiked) {
                    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
                } else {
                    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });

                    // Create notification for post author
                    const post = posts.find(p => p.id === postId);
                    if (post && post.user_id !== user.id) {
                        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
                        await supabase.from("notifications").insert({
                            user_id: post.user_id,
                            type: "like",
                            from_user_id: user.id,
                            post_id: postId,
                            message: `${profile?.username || "Someone"} liked your post`,
                        });
                    }
                }

                // Optimistic update
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId
                            ? {
                                ...p,
                                is_liked_by_user: !isCurrentlyLiked,
                                like_count: isCurrentlyLiked ? p.like_count - 1 : p.like_count + 1,
                            }
                            : p
                    )
                );
            } catch (err) {
                console.error("[Feed] Like error:", err);
            }
        },
        [posts]
    );

    // ── Post comment handler ──
    const handleComment = useCallback(
        async (postId: string, commentText: string) => {
            if (isDevMode()) {
                console.log("[Feed] Mock comment:", commentText);
                return;
            }

            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { error } = await supabase.from("post_comments").insert({
                    post_id: postId,
                    user_id: user.id,
                    comment_text: commentText,
                });

                if (error) throw error;

                // Create notification
                const post = posts.find(p => p.id === postId);
                if (post && post.user_id !== user.id) {
                    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
                    await supabase.from("notifications").insert({
                        user_id: post.user_id,
                        type: "comment",
                        from_user_id: user.id,
                        post_id: postId,
                        message: `${profile?.username || "Someone"} commented on your post`,
                    });
                }

                // Reload to get updated comments
                loadPosts();
            } catch (err) {
                console.error("[Feed] Comment error:", err);
            }
        },
        [posts, loadPosts]
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
                    <NotificationBell unreadCount={isDevMode() ? 3 : notifCount} />
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="animate-float text-5xl mb-4">🌙</div>
                        <p className="text-sm text-foreground-muted">Loading feed…</p>
                    </div>
                ) : visiblePosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <span className="text-5xl mb-4">📸</span>
                        <p className="text-lg font-semibold text-foreground mb-1">
                            No posts yet
                        </p>
                        <p className="text-sm text-foreground-muted max-w-xs">
                            {activeTab === "following"
                                ? "Follow people to see their posts here!"
                                : "Be the first to share your night! Tap the + button to create a post."}
                        </p>
                    </div>
                ) : (
                    <>
                        {visiblePosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                comments={commentsMap[post.id] || []}
                                onLike={handleLike}
                                onComment={handleComment}
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
