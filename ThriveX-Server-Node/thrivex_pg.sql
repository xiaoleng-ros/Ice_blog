-- =====================================================
-- ThriveX PostgreSQL 完整初始化脚本
-- 包含：表结构 + 初始数据
-- 适用于：Neon PostgreSQL 数据库
-- 创建时间：2026-04-29
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 文章表
-- =====================================================
CREATE TABLE IF NOT EXISTS article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(200),
    content TEXT NOT NULL,
    cover VARCHAR(300),
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    create_time VARCHAR(255) NOT NULL
);

COMMENT ON TABLE article IS '文章表';
COMMENT ON COLUMN article.id IS '文章ID';
COMMENT ON COLUMN article.title IS '文章标题';
COMMENT ON COLUMN article.description IS '文章介绍';
COMMENT ON COLUMN article.content IS '文章内容';
COMMENT ON COLUMN article.cover IS '文章封面';
COMMENT ON COLUMN article.view_count IS '浏览量';
COMMENT ON COLUMN article.comment_count IS '评论数';
COMMENT ON COLUMN article.create_time IS '创建时间';

INSERT INTO article (id, title, description, content, cover, view_count, comment_count, create_time) VALUES
(1, 'Hello World', '当你看到这篇文章时就意味着安装成功，一切就绪！', '当你看到这篇文章时就意味着安装成功，一切就绪！', NULL, 10, 0, '1729224230508'),
(2, '🎉 ThriveX 现代化博客管理系统', 'ThriveX 是一个简而不简单的现代化博客管理系统，专注于分享技术文章和知识，为技术爱好者和从业者提供一个分享、交流和学习的平台。', '# 🎉 ThriveX 现代化博客管理系统\n\n🎉 ThriveX 是一个年轻、高颜值、全开源、永不收费的现代化博客管理系统\n\n🛠️ 技术架构：\n\n前端：React 19、Next.js 15、TailwindCSS 4、TypeScript、Zustand\n\n后端：Spring Boot、Mybatis Plus、MySQL', NULL, 100, 5, '1729224230508')
ON CONFLICT (id) DO NOTHING;

SELECT setval('article_id_seq', (SELECT MAX(id) FROM article));

-- =====================================================
-- 2. 文章配置表
-- =====================================================
CREATE TABLE IF NOT EXISTS article_config (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'default',
    password VARCHAR(100) DEFAULT '',
    is_encrypt BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_del BOOLEAN DEFAULT FALSE,
    article_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE
);

COMMENT ON TABLE article_config IS '文章配置表';
INSERT INTO article_config (id, status, password, is_encrypt, is_draft, is_del, article_id) VALUES
(1, 'default', '', FALSE, FALSE, FALSE, 1),
(2, 'default', '', FALSE, FALSE, FALSE, 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval('article_config_id_seq', (SELECT MAX(id) FROM article_config));

-- =====================================================
-- 3. 分类表
-- =====================================================
CREATE TABLE IF NOT EXISTS cate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    url VARCHAR(255) DEFAULT '/',
    mark VARCHAR(100) NOT NULL UNIQUE,
    level INTEGER,
    order INTEGER DEFAULT 0,
    type VARCHAR(10) DEFAULT 'cate'
);

COMMENT ON TABLE cate IS '分类表';
INSERT INTO cate (id, name, icon, url, mark, level, order, type) VALUES
(1, '默认分类', '💻', '/', 'kfbj', 0, 1, 'cate'),
(68, '足迹', '⛳️', '/footprint', 'zj', 83, 9, 'nav'),
(69, '关于我', '👋', '/my', 'my', 83, 16, 'nav'),
(70, '朋友圈', '😇', '/friend', 'pyq', 83, 11, 'nav'),
(71, '留言墙', '💌', '/wall/all', 'wall', 83, 12, 'nav'),
(72, 'GitHub', '🔥', 'https://github.com/xiaoleng-ros', 'github', 83, 999, 'nav'),
(73, '统计', '📊', '/data', 'data', 83, 8, 'nav'),
(74, '闪念', '🏕️', '/record', 'record', 83, 9, 'nav'),
(77, '我的设备', '🔭', '/equipment', 'wdsb', 83, 15, 'nav'),
(78, '标签墙', '🏷️', '/tags', 'bqy', 83, 13, 'nav'),
(79, '我的履历', '💪', '/resume', 'wdll', 83, 16, 'nav'),
(81, '鱼塘', '🐟', '/fishpond', 'yt', 83, 10, 'nav'),
(83, '探索', '🧩', '/', 'ts', 0, 999, 'nav')
ON CONFLICT (id) DO NOTHING;

SELECT setval('cate_id_seq', (SELECT MAX(id) FROM cate));

-- =====================================================
-- 4. 文章分类中间表
-- =====================================================
CREATE TABLE IF NOT EXISTS article_cate (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    cate_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    FOREIGN KEY (cate_id) REFERENCES cate(id) ON DELETE CASCADE
);

INSERT INTO article_cate (id, article_id, cate_id) VALUES
(1440, 1, 1),
(1444, 2, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('article_cate_id_seq', (SELECT MAX(id) FROM article_cate));

-- =====================================================
-- 5. 标签表
-- =====================================================
CREATE TABLE IF NOT EXISTS tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO tag (id, name) VALUES
(3, '测试标签')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tag_id_seq', (SELECT MAX(id) FROM tag));

-- =====================================================
-- 6. 文章标签中间表
-- =====================================================
CREATE TABLE IF NOT EXISTS article_tag (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

INSERT INTO article_tag (id, article_id, tag_id) VALUES
(1, 1, 3),
(2, 2, 3)
ON CONFLICT (id) DO NOTHING;

SELECT setval('article_tag_id_seq', (SELECT MAX(id) FROM article_tag));

-- =====================================================
-- 7. 评论表
-- =====================================================
CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    content TEXT NOT NULL,
    email VARCHAR(100),
    url VARCHAR(500),
    article_id INTEGER NOT NULL,
    comment_id INTEGER DEFAULT 0,
    audit_status INTEGER DEFAULT 0,
    create_time VARCHAR(255) NOT NULL
);

INSERT INTO comment (id, name, avatar, content, email, url, article_id, comment_id, audit_status, create_time) VALUES
(514, '宇阳', 'https://q1.qlogo.cn/g?b=qq&nk=3311118881&s=640', '记得点个star', '3311118881@qq.com', 'https://liuyuyang.net/', 2187, 0, 0, '1729225111457'),
(515, 'ThriveX', 'https://q1.qlogo.cn/g?b=qq&nk=3311118881&s=640', '太强了吧', '3311118881@qq.com', 'https://liuyuyang.net', 2, 0, 1, '1744980488518'),
(516, 'ThriveX', '', '太强了吧', '3311118881@qq.com', 'https://liuyuyang.net', 2, 0, 0, '1744980488518')
ON CONFLICT (id) DO NOTHING;

SELECT setval('comment_id_seq', (SELECT MAX(id) FROM comment));

-- =====================================================
-- 8. 足迹表
-- =====================================================
CREATE TABLE IF NOT EXISTS footprint (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(1500),
    address VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    images JSON DEFAULT '[]',
    create_time VARCHAR(255) NOT NULL
);

INSERT INTO footprint (id, title, content, address, position, images, create_time) VALUES
(33, '测试足迹', '测试足迹', '测试足迹', '119.138475,33.6119', '[]', '1599667200000'),
(44, '999', '99', '9999', '119.138475,33.6119', '[]', '1773748216600')
ON CONFLICT (id) DO NOTHING;

SELECT setval('footprint_id_seq', (SELECT MAX(id) FROM footprint));

-- =====================================================
-- 9. 留言墙分类表
-- =====================================================
CREATE TABLE IF NOT EXISTS wall_cate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    order INTEGER DEFAULT 0
);

INSERT INTO wall_cate (id, name, icon, order) VALUES
(1, '全部', 'all', 1),
(2, '想对我说的话', 'info', 2),
(3, '对我的建议', 'suggest', 3),
(6, '其他', 'other', 6),
(7, '精选', 'choice', 0)
ON CONFLICT (id) DO NOTHING;

SELECT setval('wall_cate_id_seq', (SELECT MAX(id) FROM wall_cate));

-- =====================================================
-- 10. 留言墙表
-- =====================================================
CREATE TABLE IF NOT EXISTS wall (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT '神秘人',
    cate_id INTEGER NOT NULL,
    color VARCHAR(50) DEFAULT '#ffe3944d',
    content TEXT NOT NULL,
    avatar VARCHAR(255),
    email VARCHAR(100),
    audit_status INTEGER DEFAULT 0,
    is_choice INTEGER DEFAULT 0,
    ip VARCHAR(50),
    created VARCHAR(255) NOT NULL
);

INSERT INTO wall (id, name, cate_id, color, content, avatar, email, audit_status, is_choice, created) VALUES
(104, '测试', 6, '#fcafa24d', '测试测试测试测试测试', '3311118881@qq.com', '3311118881@qq.com', 1, 0, '1729231268305'),
(107, '测试', 6, '#fcafa24d', '测试测试测试测试测试', '3311118881@qq.com', '3311118881@qq.com', 0, 0, '1729231268305'),
(108, '测试', 6, '#fcafa24d', '测试测试测试测试测试', '3311118881@qq.com', '3311118881@qq.com', 0, 0, '1729231268305')
ON CONFLICT (id) DO NOTHING;

SELECT setval('wall_id_seq', (SELECT MAX(id) FROM wall));

-- =====================================================
-- 11. 链接类型表
-- =====================================================
CREATE TABLE IF NOT EXISTS link_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_admin INTEGER DEFAULT 0,
    order INTEGER DEFAULT 0
);

INSERT INTO link_type (id, name, is_admin, order) VALUES
(1, '生活类', 0, 4),
(2, '技术类', 0, 5),
(3, '全站置顶', 1, 1),
(4, '推荐', 1, 2),
(5, '大佬', 1, 3),
(6, '聚合类', 0, 6)
ON CONFLICT (id) DO NOTHING;

SELECT setval('link_type_id_seq', (SELECT MAX(id) FROM link_type));

-- =====================================================
-- 12. 链接表
-- =====================================================
CREATE TABLE IF NOT EXISTS link (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    email VARCHAR(100),
    logo VARCHAR(500),
    url VARCHAR(500) NOT NULL,
    type_link VARCHAR(500),
    type_id INTEGER,
    status INTEGER DEFAULT 1,
    order INTEGER DEFAULT 0
);

INSERT INTO link (id, name, description, email, logo, url, type_link, type_id, status, order) VALUES
(50, '宇阳', 'ThriveX 博客管理系统作者', 'liuyuyang1024@yeah.net', 'https://q1.qlogo.cn/g?b=qq&nk=3311118881&s=640', 'https://liuyuyang.net/', 'https://liuyuyang.net/api/rss', 4, 1, 4),
(52, '这是一个网站', '这是一个网站的描述', 'liuyuyang1024@yeah.net', 'http://127.0.0.1:5000/1.jpg', '/', '/', 123, 1, 1),
(53, '这是一个网站', '这是一个网站的描述', 'liuyuyang1024@yeah.net', 'http://127.0.0.1:5000/1.jpg', '/', '/', 123, 1, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('link_id_seq', (SELECT MAX(id) FROM link));

-- =====================================================
-- 13. 轮播图表
-- =====================================================
CREATE TABLE IF NOT EXISTS swiper (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    cover VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1
);

INSERT INTO swiper (id, title, cover, url, order, status) VALUES
(1, 'ThriveX 3.0 来袭，不忘初心，保持热爱', 'https://bu.dusays.com/2025/06/15/684e8f3435c97.png', 'https://github.com/LiuYuYang01/ThriveX-Admin', 0, 1),
(29, 'ThriveX 官网全新发布 🎉', 'https://bu.dusays.com/2025/01/21/678f4a609f91f.png', 'https://thrivex.liuyuyang.net/', 0, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('swiper_id_seq', (SELECT MAX(id) FROM swiper));

-- =====================================================
-- 14. 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    info VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    status INTEGER DEFAULT 1,
    create_time VARCHAR(255)
);

INSERT INTO "user" (id, username, password, nickname, email, avatar, info, role, status, create_time) VALUES
(1, 'admin', '$2a$10$D/UsM0lirHIvi394iatFrOSKEopAt4AEiVvhctXjMnDQ9z98xtpuS', '宇阳', '3311118881@qq.com', 'https://bu.dusays.com/2024/11/17/6739adf188f64.png', 'ThriveX 博客管理系统作者', 'admin', 1, '1723533206613')
ON CONFLICT (id) DO NOTHING;

SELECT setval('user_id_seq', (SELECT MAX(id) FROM "user"));

-- =====================================================
-- 15. 用户Token表
-- =====================================================
CREATE TABLE IF NOT EXISTS user_token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expire_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- =====================================================
-- 16. 助手表
-- =====================================================
CREATE TABLE IF NOT EXISTS assistant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    key VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    model VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

INSERT INTO assistant (id, name, key, url, model, is_default) VALUES
(2, '测试助手', 'xxxxxxxxxxxxxxxxxx', 'https://api.deepseek.com', 'deepseek-chat', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('assistant_id_seq', (SELECT MAX(id) FROM assistant));

-- =====================================================
-- 17. 文件记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS file_detail (
    id VARCHAR(32) PRIMARY KEY,
    url VARCHAR(512) NOT NULL,
    size BIGINT,
    filename VARCHAR(256),
    original_filename VARCHAR(256),
    base_path VARCHAR(256),
    path VARCHAR(256),
    ext VARCHAR(32),
    content_type VARCHAR(128),
    platform VARCHAR(32),
    th_url VARCHAR(512),
    th_filename VARCHAR(256),
    th_size BIGINT,
    th_content_type VARCHAR(128),
    object_id VARCHAR(32),
    object_type VARCHAR(32),
    metadata TEXT,
    user_metadata TEXT,
    th_metadata TEXT,
    th_user_metadata TEXT,
    attr TEXT,
    file_acl VARCHAR(32),
    th_file_acl VARCHAR(32),
    hash_info TEXT,
    upload_id VARCHAR(128),
    upload_status INTEGER,
    create_time TIMESTAMP
);

-- =====================================================
-- 18. 环境配置表
-- =====================================================
CREATE TABLE IF NOT EXISTS env_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    value JSON NOT NULL,
    notes VARCHAR(255)
);

INSERT INTO env_config (id, name, value, notes) VALUES
(1, 'baidu_statis', '{"site_id": 0, "access_token": ""}', '百度统计配置'),
(2, 'email', '{"host": "smtp.qq.com", "port": 465, "password": "", "username": "xxx@qq.com"}', '邮件发送配置'),
(3, 'gaode_map', '{"key_code": "", "security_code": ""}', '高德地图配置'),
(4, 'gaode_coordinate', '{"key": ""}', '高德地图坐标配置')
ON CONFLICT (id) DO NOTHING;

SELECT setval('env_config_id_seq', (SELECT MAX(id) FROM env_config));

-- =====================================================
-- 19. 页面配置表
-- =====================================================
CREATE TABLE IF NOT EXISTS page_config (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL UNIQUE,
    config JSON NOT NULL
);

-- =====================================================
-- 20. RSS表
-- =====================================================
CREATE TABLE IF NOT EXISTS rss (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    rule JSON,
    created VARCHAR(255) NOT NULL
);

-- =====================================================
-- 21. 闪念表
-- =====================================================
CREATE TABLE IF NOT EXISTS record (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    images JSON,
    created VARCHAR(255) NOT NULL
);

-- =====================================================
-- 22. OSS配置表
-- =====================================================
CREATE TABLE IF NOT EXISTS oss (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    access_key VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    bucket VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255),
    domain VARCHAR(255),
    status INTEGER DEFAULT 1
);

-- =====================================================
-- 23. 网站配置表（核心配置 - 解决前端报错）
-- =====================================================
CREATE TABLE IF NOT EXISTS web_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    value JSON NOT NULL
);

INSERT INTO web_config (id, name, value) VALUES
(1, 'web', '{"url": "https://liuyuyang.net", "title": "ThriveX", "subhead": "现代化博客管理系统", "favicon": "https://res.liuyuyang.net/usr/images/favicon.ico", "keyword": "ThriveX,博客,Blog", "footer": "© 2024 ThriveX. All rights reserved.", "icp": "豫ICP备2020031040号-1", "create_time": 1547568000000, "description": "也许会是最好用的博客管理系统"}'),
(2, 'theme', '{"is_article_layout": "classics", "right_sidebar": ["author", "hotArticle", "randomArticle", "newComments", "runTime"], "light_logo": "https://bu.dusays.com/2024/05/03/663481106e2a4.png", "dark_logo": "https://bu.dusays.com/2024/05/03/663481106dcfd.png", "swiper_image": "https://bu.dusays.com/2025/06/15/684e8f3435c97.png", "swiper_text": ["欢迎来到 ThriveX", "一个现代化博客管理系统", "简洁而不简单"], "reco_article": [1, 2], "social": [{"name": "GitHub", "url": "https://github.com/LiuYuYang01"}], "covers": ["https://bu.dusays.com/2023/11/10/654e2da1d80f8.jpg", "https://bu.dusays.com/2023/11/10/654e2d719d31c.jpg", "https://bu.dusays.com/2023/11/10/654e2cf92cd45.jpg", "https://bu.dusays.com/2023/11/10/654e2cf6055b0.jpg", "https://bu.dusays.com/2023/11/10/654e2db0889fe.jpg"], "record_name": "👋 Liu 宇阳", "record_info": "🎯 梦想做一名技术顶尖的架构师"}'),
(3, 'other', '{"baidu_token": "", "hcaptcha_key": ""}')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;

SELECT setval('web_config_id_seq', (SELECT MAX(id) FROM web_config));

-- =====================================================
-- 创建索引
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_article_create_time ON article(create_time);
CREATE INDEX IF NOT EXISTS idx_comment_article_id ON comment(article_id);
CREATE INDEX IF NOT EXISTS idx_footprint_create_time ON footprint(create_time);
CREATE INDEX IF NOT EXISTS idx_wall_cate_id ON wall(cate_id);

-- =====================================================
-- 验证数据
-- =====================================================
SELECT '=== ThriveX 初始化完成 ===' AS status;
SELECT 
    'web_config: ' || COUNT(*) || ' 条' as data_count FROM web_config
UNION ALL SELECT 'article: ' || COUNT(*) || ' 条' FROM article
UNION ALL SELECT 'cate: ' || COUNT(*) || ' 条' FROM cate
UNION ALL SELECT 'user: ' || COUNT(*) || ' 条' FROM "user"
UNION ALL SELECT 'swiper: ' || COUNT(*) || ' 条' FROM swiper
UNION ALL SELECT 'comment: ' || COUNT(*) || ' 条' FROM comment;
