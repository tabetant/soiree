"use client";

/**
 * PostCard Component
 *
 * Instagram-style post card with:
 * - User header (avatar, username, venue, time)
 * - Image carousel (swipeable gradient placeholders)
 * - Engagement bar (like, comment, share, save)
 * - Caption with "See more" truncation
 * - Comments preview
 */

import { useState, useCallback } from "react";
import type { Post, Comment } from "@/lib/types";
import { timeAgo, getInitials, stringToHue, formatCount } from "@/lib/feedUtils";
import CommentSection from "./CommentSection";

interface PostCardProps {
    post: Post;
    comments: Comment[];
}

export default function PostCard({ post, comments }: PostCardProps) {
    const [liked, setLiked] = useState(post.is_liked_by_user);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [saved, setSaved] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [showLikeAnim, setShowLikeAnim] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const hue = stringToHue(post.user.username);

    const handleLike = useCallback(() => {
        setLiked((prev) => {
            setLikeCount((c) => (prev ? c - 1 : c + 1));
            return !prev;
        });
        // TODO: Supabase insert/delete
    }, []);

    const handleDoubleTap = useCallback(() => {
        if (!liked) {
            setLiked(true);
            setLikeCount((c) => c + 1);
        }
        setShowLikeAnim(true);
        setTimeout(() => setShowLikeAnim(false), 800);
    }, [liked]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${post.user.username} on Soirée`,
                    text: post.caption || "Check this out on Soirée!",
                    url: window.location.href,
                });
            } catch { /* User cancelled */ }
        }
    };

    const captionTooLong = (post.caption?.length || 0) > 120;
    const displayCaption =
        captionTooLong && !showFullCaption
            ? post.caption!.slice(0, 120) + "…"
            : post.caption;

    return (
        <article className="border-b border-border animate-fade-in">
            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                        className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-accent/30"
                        style={{ background: `hsl(${hue}, 60%, 40%)` }}
                    >
                        {getInitials(post.user.display_name || post.user.username)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {post.user.username}
                        </p>
                        {post.location_name && (
                            <p className="text-xs text-foreground-muted truncate flex items-center gap-1">
                                <span>📍</span>
                                <span>{post.location_name}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground-muted">{timeAgo(post.created_at)}</span>
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover transition-colors"
                            aria-label="Post options"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                            </svg>
                        </button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-9 z-50 w-40 rounded-xl border border-border bg-background-secondary shadow-xl py-1">
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors">
                                        Share
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors">
                                        Report
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Image Carousel ──────────────────────────── */}
            <div
                className="relative w-full aspect-square bg-surface overflow-hidden select-none"
                onDoubleClick={handleDoubleTap}
            >
                {/* Current image */}
                <div
                    className="h-full w-full"
                    style={{
                        background: post.image_urls[currentImage].startsWith("linear-gradient")
                            ? post.image_urls[currentImage]
                            : undefined,
                    }}
                >
                    {!post.image_urls[currentImage].startsWith("linear-gradient") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={post.image_urls[currentImage]}
                            alt={`Post by ${post.user.username}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    )}
                </div>

                {/* Double-tap like animation */}
                {showLikeAnim && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-7xl animate-like-pop">❤️</span>
                    </div>
                )}

                {/* Carousel indicators */}
                {post.image_urls.length > 1 && (
                    <>
                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {post.image_urls.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImage(i)}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${i === currentImage
                                            ? "w-4 bg-white"
                                            : "w-1.5 bg-white/40"
                                        }`}
                                    aria-label={`Image ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Navigation arrows */}
                        {currentImage > 0 && (
                            <button
                                onClick={() => setCurrentImage((p) => p - 1)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition-colors"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                        )}
                        {currentImage < post.image_urls.length - 1 && (
                            <button
                                onClick={() => setCurrentImage((p) => p + 1)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition-colors"
                                aria-label="Next image"
                            >
                                ›
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* ── Engagement Bar ──────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-4">
                    {/* Like */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 transition-colors ${liked ? "text-neon-pink" : "text-foreground hover:text-foreground-muted"
                            }`}
                        aria-label={liked ? "Unlike" : "Like"}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill={liked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={liked ? "animate-like-bounce" : ""}
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        <span className="text-sm font-medium">{formatCount(likeCount)}</span>
                    </button>

                    {/* Comment */}
                    <button
                        className="flex items-center gap-1.5 text-foreground hover:text-foreground-muted transition-colors"
                        aria-label="Comments"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        <span className="text-sm font-medium">{formatCount(post.comment_count)}</span>
                    </button>

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="text-foreground hover:text-foreground-muted transition-colors"
                        aria-label="Share"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </button>
                </div>

                {/* Save */}
                <button
                    onClick={() => setSaved(!saved)}
                    className={`transition-colors ${saved ? "text-accent" : "text-foreground hover:text-foreground-muted"
                        }`}
                    aria-label={saved ? "Unsave" : "Save"}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={saved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                </button>
            </div>

            {/* ── Caption ─────────────────────────────────── */}
            {post.caption && (
                <div className="px-4 pb-2">
                    <p className="text-sm leading-relaxed">
                        <span className="font-semibold text-foreground">{post.user.username}</span>
                        {" "}
                        <span className="text-foreground-muted">{displayCaption}</span>
                    </p>
                    {captionTooLong && !showFullCaption && (
                        <button
                            onClick={() => setShowFullCaption(true)}
                            className="text-xs text-foreground-muted/60 hover:text-foreground-muted transition-colors mt-0.5"
                        >
                            See more
                        </button>
                    )}
                </div>
            )}

            {/* ── Comments ────────────────────────────────── */}
            <CommentSection
                postId={post.id}
                comments={comments}
                totalCount={post.comment_count}
            />
        </article>
    );
}
