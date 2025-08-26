-- 数据库索引优化脚本
-- 执行此脚本以添加性能优化的索引

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);

-- 播客表索引
CREATE INDEX IF NOT EXISTS idx_podcasts_user_email ON podcasts(user_email);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at);
CREATE INDEX IF NOT EXISTS idx_podcasts_is_public ON podcasts(is_public);
CREATE INDEX IF NOT EXISTS idx_podcasts_language ON podcasts(language);
CREATE INDEX IF NOT EXISTS idx_podcasts_voice ON podcasts(voice);
CREATE INDEX IF NOT EXISTS idx_podcasts_title ON podcasts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_podcasts_content ON podcasts USING gin(to_tsvector('english', content));

-- 社交功能索引
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

CREATE INDEX IF NOT EXISTS idx_podcast_comments_podcast_id ON podcast_comments(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_user_email ON podcast_comments(user_email);
CREATE INDEX IF NOT EXISTS idx_podcast_comments_created_at ON podcast_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_podcast_likes_podcast_id ON podcast_likes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_user_email ON podcast_likes(user_email);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_created_at ON podcast_likes(created_at);

CREATE INDEX IF NOT EXISTS idx_podcast_shares_podcast_id ON podcast_shares(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_shares_user_email ON podcast_shares(user_email);
CREATE INDEX IF NOT EXISTS idx_podcast_shares_created_at ON podcast_shares(created_at);

-- 社区功能索引
CREATE INDEX IF NOT EXISTS idx_communities_creator_email ON communities(creator_email);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at);
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);

CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_email ON community_members(user_email);
CREATE INDEX IF NOT EXISTS idx_community_members_joined_at ON community_members(joined_at);

CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_email ON community_posts(user_email);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- 通知系统索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type ON notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_email ON notification_settings(user_email);

-- 复合索引（用于复杂查询）
CREATE INDEX IF NOT EXISTS idx_podcasts_user_public ON podcasts(user_email, is_public);
CREATE INDEX IF NOT EXISTS idx_podcasts_language_public ON podcasts(language, is_public);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_public ON podcasts(created_at, is_public);

-- 全文搜索索引（PostgreSQL）
-- 注意：这需要PostgreSQL的全文搜索扩展
-- CREATE INDEX IF NOT EXISTS idx_podcasts_search ON podcasts USING gin(
--     to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
-- );

-- 统计查询优化索引
CREATE INDEX IF NOT EXISTS idx_podcasts_stats ON podcasts(user_email, created_at, is_public);
CREATE INDEX IF NOT EXISTS idx_user_follows_stats ON user_follows(follower_id, following_id, created_at);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_stats ON podcast_likes(podcast_id, user_email, created_at);

-- 分析查询的索引
CREATE INDEX IF NOT EXISTS idx_podcasts_analytics ON podcasts(created_at, language, voice, is_public);
CREATE INDEX IF NOT EXISTS idx_user_activity ON users(created_at, last_login_at, monthly_generation_count);
