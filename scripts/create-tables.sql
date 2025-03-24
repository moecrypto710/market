-- Create enum types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_tier') THEN
        CREATE TYPE membership_tier AS ENUM ('basic', 'premium', 'vip', 'enterprise');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_location') THEN
        CREATE TYPE store_location AS ENUM ('standard', 'premium', 'entrance', 'central');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'store_size') THEN
        CREATE TYPE store_size AS ENUM ('small', 'medium', 'large', 'flagship');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('credit_card', 'paypal', 'apple_pay', 'crypto');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
        CREATE TYPE category AS ENUM ('electronics', 'clothing', 'travel', 'accessories');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM ('fashion_show', 'product_launch', 'exclusive_sale', 'vip_meeting', 'workshop');
    END IF;
END
$$;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    affiliate_code TEXT NOT NULL,
    membership_tier membership_tier DEFAULT 'basic',
    membership_start_date TIMESTAMP,
    membership_end_date TIMESTAMP,
    avatar TEXT,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    category category NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    commission_rate INTEGER NOT NULL DEFAULT 5,
    vr_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    brand_id INTEGER,
    featured BOOLEAN DEFAULT FALSE,
    three_d_model_url TEXT,
    view_count INTEGER DEFAULT 0,
    cultural_heritage_title TEXT,
    cultural_heritage_story TEXT,
    cultural_heritage_image_url TEXT,
    cultural_heritage_region TEXT,
    cultural_heritage_period TEXT
);

CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    points_required INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tier membership_tier DEFAULT 'basic',
    image_url TEXT,
    expiry_date TIMESTAMP,
    ar_model_url TEXT,
    ar_enabled BOOLEAN DEFAULT FALSE,
    ar_description TEXT,
    ar_thumbnail_url TEXT,
    badge_id TEXT,
    badge_icon TEXT,
    badge_title TEXT,
    achievement_type TEXT,
    rarity TEXT,
    unlock_criteria TEXT,
    streak_required INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    earnings INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    custom_commission_rate INTEGER,
    payment_info TEXT,
    biography TEXT,
    specialty category
);

CREATE TABLE IF NOT EXISTS virtual_stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand_id INTEGER NOT NULL,
    description TEXT,
    logo_url TEXT NOT NULL,
    banner_url TEXT,
    size store_size DEFAULT 'medium',
    location store_location DEFAULT 'standard',
    monthly_fee INTEGER NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    custom_theme_color TEXT,
    design_template TEXT DEFAULT 'standard',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    visitor_count INTEGER DEFAULT 0,
    conversion_rate INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS virtual_events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type event_type NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    price INTEGER,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    host_id INTEGER NOT NULL,
    image_url TEXT,
    vr_environment_id TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    membership_required membership_tier
);

-- Add some sample data for testing
INSERT INTO users (username, password, email, full_name, points, affiliate_code, membership_tier, membership_start_date, membership_end_date, avatar, last_login)
VALUES
    ('test', 'test123', 'test@example.com', 'مستخدم تجريبي', 500, 'TESTUSER', 'premium', '2024-01-01', '2025-12-31', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61', NOW()),
    ('زائر', 'guest123', 'guest@example.com', 'زائر', 100, 'GUEST001', 'basic', '2024-03-01', '2025-03-01', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d', NOW()),
    ('متسوق', 'shop123', 'shopper@example.com', 'متسوق', 200, 'SHOPPER001', 'basic', '2024-02-15', '2025-02-15', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, commission_rate, vr_enabled, brand_id, featured, three_d_model_url, view_count, cultural_heritage_title, cultural_heritage_story)
VALUES
    ('حذاء نايكي اير جوردان ريترو', 'حذاء رياضي أصلي من نايكي، مستوحى من تصميم مايكل جوردان الكلاسيكي مع تقنية الهواء المضغوط للراحة المثالية', 4200, '/images/product-templates/nike-shoes.svg', 'clothing', 10, TRUE, 1, TRUE, '/models/nike-jordan.glb', 542, 'أحذية الفروسية العربية', 'تمتد تقاليد الأحذية الخاصة بالفروسية في العالم العربي لقرون عديدة...'),
    ('تيشيرت أديداس أوريجينال', 'تيشيرت رياضي أصلي من أديداس بشعار الثلاث ورقات الشهير، مصنوع من قطن عضوي 100% للراحة الفائقة', 1250, '/images/product-templates/adidas-tshirt.svg', 'clothing', 12, TRUE, 2, TRUE, '/models/adidas-tshirt.glb', 389, 'النسيج المصري القديم', 'الملابس القطنية تحمل إرثاً قديماً في مصر...'),
    ('سماعات آبل إيربودز برو', 'سماعات آبل إيربودز برو الأصلية مع خاصية إلغاء الضوضاء النشطة وجودة صوت استثنائية ومقاومة للماء والعرق', 5500, '/images/product-templates/apple-airpods.svg', 'electronics', 18, TRUE, 4, TRUE, '/models/apple-airpods.glb', 756, 'الموسيقى الشرقية والمقامات العربية', 'الموسيقى العربية تتميز بنظام المقامات الفريد...')
ON CONFLICT DO NOTHING;

-- Insert sample rewards
INSERT INTO rewards (name, description, points_required, is_active, tier, image_url, ar_enabled, badge_title)
VALUES
    ('خصم 20%', 'خصم 20% على منتجات مختارة', 100, TRUE, 'basic', '/images/rewards/discount.svg', FALSE, 'المتسوق الذكي'),
    ('تجربة VR مجانية', 'تجربة افتراضية مجانية في المتجر لمدة 30 دقيقة', 250, TRUE, 'premium', '/images/rewards/vr-experience.svg', TRUE, 'مستكشف الواقع الافتراضي'),
    ('نموذج AR حصري', 'نموذج واقع معزز حصري لأحذية محدودة الإصدار', 500, TRUE, 'vip', '/images/rewards/ar-model.svg', TRUE, 'مجمع التقنية')
ON CONFLICT DO NOTHING;

-- Insert sample affiliates
INSERT INTO affiliates (user_id, earnings, conversions, tier, specialty)
VALUES
    (1, 5000, 15, 'silver', 'electronics'),
    (2, 1000, 3, 'bronze', 'clothing')
ON CONFLICT DO NOTHING;