-- ================================================================
-- Soirée — User System + Social Feed Schema
-- ================================================================
-- Run AFTER 003_venue_details_loyalty.sql

-- ── Enhanced Profiles ───────────────────────────────────────

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS profile_picture_url text,
ADD COLUMN IF NOT EXISTS total_xp int DEFAULT 0,
ADD COLUMN IF NOT EXISTS level int DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Allow any authenticated user to read profiles (for feed/follows)
CREATE POLICY "Profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- ── User Follows ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_follows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
    ON user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others"
    ON user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow"
    ON user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- ── Achievements ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    icon text,
    xp_reward int NOT NULL,
    requirement_type text NOT NULL,
    requirement_value int NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by authenticated users"
    ON achievements FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id uuid REFERENCES achievements(id),
    earned_at timestamptz DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User achievements are viewable by authenticated users"
    ON user_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert user achievements"
    ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── User Ratings (venue-side) ───────────────────────────────

CREATE TABLE IF NOT EXISTS user_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
    rating int CHECK (rating >= 1 AND rating <= 5),
    is_flagged boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_venue ON user_ratings(venue_id);

ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ratings"
    ON user_ratings FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ── Posts ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
    caption text,
    image_urls text[] NOT NULL,
    location_name text,
    latitude decimal(10, 8),
    longitude decimal(11, 8),
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_venue ON posts(venue_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public posts"
    ON posts FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can view own posts"
    ON posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Post Likes ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
    ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts"
    ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"
    ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Post Comments ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
    ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments"
    ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
    ON post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
    ON post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Notifications ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── Sample Achievements ─────────────────────────────────────

INSERT INTO achievements (name, description, icon, xp_reward, requirement_type, requirement_value)
VALUES
    ('Night Owl', 'Check in to 5 different venues', '🦉', 50, 'check_ins', 5),
    ('Social Butterfly', 'Get 50 post likes', '🦋', 100, 'post_likes', 50),
    ('Influencer', 'Get 100 followers', '⭐', 150, 'followers', 100),
    ('Party Animal', 'Attend 10 events', '🎉', 75, 'events_attended', 10),
    ('Regular', 'Visit the same venue 5 times', '🏆', 60, 'venue_visits', 5),
    ('First Post', 'Share your first post', '📸', 10, 'posts', 1),
    ('Commentator', 'Leave 20 comments', '💬', 30, 'comments', 20),
    ('Explorer', 'Visit 3 different neighborhoods', '🗺️', 40, 'neighborhoods', 3);
