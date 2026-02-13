"use client";

/**
 * CommentSection Component
 *
 * Displays a preview of comments on a post (first 2) with
 * a "View all" link, and an inline "Add a comment" input.
 */

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { timeAgo, getInitials, stringToHue } from "@/lib/feedUtils";

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
    totalCount: number;
    previewCount?: number;
    onComment?: (postId: string, commentText: string) => void;
}

export default function CommentSection({
    postId,
    comments,
    totalCount,
    previewCount = 2,
    onComment,
}: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? comments : comments.slice(0, previewCount);

    const handlePost = () => {
        if (!newComment.trim()) return;
        const text = newComment.trim();
        console.log("[Soirée] New comment:", text);
        if (onComment) onComment(postId, text);
        setNewComment("");
    };

    return (
        <div className="px-4 pb-3 space-y-2">
            {/* View all comments link */}
            {totalCount > previewCount && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                    View all {totalCount} comments
                </button>
            )}

            {/* Comment list */}
            {visible.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                    {/* Mini avatar */}
                    <div
                        className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
                        style={{
                            background: `hsl(${stringToHue(comment.user.username)}, 60%, 45%)`,
                        }}
                    >
                        {getInitials(comment.user.display_name || comment.user.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                            <span className="font-semibold text-foreground">{comment.user.username}</span>
                            {" "}
                            <span className="text-foreground-muted">{comment.comment_text}</span>
                        </p>
                        <span className="text-[10px] text-foreground-muted/60">{timeAgo(comment.created_at)}</span>
                    </div>
                </div>
            ))}

            {/* Add comment input */}
            <div className="flex items-center gap-2 pt-1">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted/50 outline-none border-none"
                    onKeyDown={(e) => e.key === "Enter" && handlePost()}
                />
                {newComment.trim() && (
                    <button
                        onClick={handlePost}
                        className="text-sm font-semibold text-accent hover:text-accent-glow transition-colors"
                    >
                        Post
                    </button>
                )}
            </div>
        </div>
    );
}
