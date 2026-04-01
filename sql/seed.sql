-- ============================================================
-- Project:  The Drop
-- File:     seed.sql
-- Purpose:  Insert mock data into all 11 tables
-- ============================================================

USE thedrop;

-- ============================================================
-- RETAILERS
-- ============================================================
INSERT INTO `retailer` (`name`, `email`, `password_hash`, `website`, `location`) VALUES
('Nike',        'admin@nike.com',        'hashed_pw_1', 'https://www.nike.com',        'Beaverton, OR'),
('Adidas',      'admin@adidas.com',      'hashed_pw_2', 'https://www.adidas.com',      'Portland, OR'),
('Foot Locker', 'admin@footlocker.com',  'hashed_pw_3', 'https://www.footlocker.com',  'New York, NY'),
('SNKRS',       'admin@snkrs.com',       'hashed_pw_4', 'https://www.nike.com/launch', 'Beaverton, OR'),
('StockX',      'admin@stockx.com',      'hashed_pw_5', 'https://www.stockx.com',      'Detroit, MI'),
('New Balance', 'admin@newbalance.com',  'hashed_pw_6', 'https://www.newbalance.com',  'Boston, MA'),
('Puma',        'admin@puma.com',        'hashed_pw_7', 'https://www.puma.com',        'Somerville, MA'),
('GOAT',        'admin@goat.com',        'hashed_pw_8', 'https://www.goat.com',        'Culver City, CA');

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO `users` (`email`, `username`, `password_hash`, `first_name`, `last_name`, `phone`, `status`) VALUES
('jordan.hayes@gmail.com',   'jhayes',     'hashed_pw_u1',  'Jordan',    'Hayes',    '540-111-2222', 'active'),
('maya.chen@gmail.com',      'mayac',      'hashed_pw_u2',  'Maya',      'Chen',     '540-222-3333', 'active'),
('devon.wright@gmail.com',   'dwright',    'hashed_pw_u3',  'Devon',     'Wright',   '540-333-4444', 'active'),
('priya.patel@gmail.com',    'ppatel',     'hashed_pw_u4',  'Priya',     'Patel',    '540-444-5555', 'active'),
('marcus.bell@gmail.com',    'mbell',      'hashed_pw_u5',  'Marcus',    'Bell',     '540-555-6666', 'active'),
('sophia.lee@gmail.com',     'sophlee',    'hashed_pw_u6',  'Sophia',    'Lee',      '540-666-7777', 'active'),
('tyler.brooks@gmail.com',   'tbrooks',    'hashed_pw_u7',  'Tyler',     'Brooks',   '540-777-8888', 'active'),
('aisha.moore@gmail.com',    'amoore',     'hashed_pw_u8',  'Aisha',     'Moore',    '540-888-9999', 'active'),
('char.taylor@gmail.com',    'ctaylor',    'hashed_pw_u9',  'Charlotte', 'Taylor',   '540-999-8888', 'active'),
('marcus.hale@gmail.com',    'mhale',      'hashed_pw_u10', 'Marcus',    'Hale',     '540-888-7777', 'active'),
('lila.moreno@gmail.com',    'limoreno',   'hashed_pw_u11', 'Lila',      'Moreno',   '540-777-6666', 'active'),
('ethan.cross@gmail.com',    'ecross',     'hashed_pw_u12', 'Ethan',     'Cross',    '540-666-5555', 'active'),
('zara.whitaker@gmail.com',  'zarawhit',   'hashed_pw_u13', 'Zara',      'Whitaker', '540-555-4444', 'active'),
('naomi.chen@gmail.com',     'nchen',      'hashed_pw_u14', 'Naomi',     'Chen',     '540-444-3333', 'active'),
('caleb.foster@gmail.com',   'cfoster',    'hashed_pw_u15', 'Caleb',     'Foster',   '540-333-2222', 'active'),
('abby.johnson@gmail.com',   'ajohnson',   'hashed_pw_u16', 'Abigail',   'Johnson',  '540-222-1111', 'active'),
('lucas.hayes@gmail.com',    'lhayes',     'hashed_pw_u17', 'Lucas',     'Hayes',    '540-111-0000', 'active'),
('eliza.thornton@gmail.com', 'ethornton',  'hashed_pw_u18', 'Eliza',     'Thornton', '540-123-4567', 'active'),
('tristan.cole@gmail.com',   'tristc',     'hashed_pw_u19', 'Tristan',   'Cole',     '540-234-5678', 'active'),
('noah.miller@gmail.com',    'nmiller',    'hashed_pw_u20', 'Noah',      'Miller',   '540-345-6789', 'active'),
('aaron.marker@gmail.com',   'amarker',    'hashed_pw_u21', 'Aaron',     'Marker',   '540-456-7890', 'active');

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO `product` (`retailer_id`, `sku`, `name`, `brand`, `colorway`, `price`, `description`) VALUES
(1, 'AJ1-RETRO-HIGH-OG',      'Air Jordan 1 Retro High OG',      'Jordan',      'Chicago Red/White/Black',    180.00, 'The iconic Air Jordan 1 in the original Chicago colorway.'),
(1, 'AJ4-RETRO-THUNDER',      'Air Jordan 4 Retro Thunder',      'Jordan',      'Black/Tour Yellow',          210.00, 'Bold Thunder colorway on the classic AJ4 silhouette.'),
(2, 'YEEZY-350-ZEBRA',        'Yeezy Boost 350 V2 Zebra',        'Adidas',      'White/Core Black/Red',       220.00, 'The fan-favorite Zebra colorway on the Yeezy 350 V2.'),
(2, 'YEEZY-700-WAVERUNNER',   'Yeezy 700 Wave Runner',           'Adidas',      'Grey/Blue/Orange',           300.00, 'The original dad shoe that started a trend.'),
(1, 'DUNK-LOW-PANDA',         'Nike Dunk Low Panda',             'Nike',        'White/Black',                110.00, 'Clean and versatile Panda colorway on the Nike Dunk Low.'),
(3, 'AF1-LOW-WHITE',          'Air Force 1 Low White',           'Nike',        'White/White',                 90.00, 'The classic all-white Air Force 1 Low, a timeless staple.'),
(4, 'AJ3-RETRO-FIRE-RED',     'Air Jordan 3 Retro Fire Red',     'Jordan',      'White/Fire Red/Cement Grey', 200.00, 'A retro classic — the Fire Red AJ3 returns in OG form.'),
(2, 'ULTRA-BOOST-22',         'Adidas Ultraboost 22',            'Adidas',      'Core Black/Carbon',          190.00, 'High-performance running shoe with responsive Boost cushioning.'),
(6, 'NEW-BALANCE-550-WH',     'New Balance 550 White Green',     'New Balance', 'White/Green',                110.00, 'Retro basketball-inspired silhouette with a clean finish.'),
(1, 'AJ11-RETRO-JUBILEE',     'Air Jordan 11 Retro Jubilee',     'Jordan',      'Black/Metallic Silver',      220.00, 'Celebrating 25 years of the iconic Air Jordan 11.'),
(7, 'PUMA-SUEDE-CLASSIC',     'Puma Suede Classic',              'Puma',        'Black/White',                 70.00, 'A timeless streetwear icon with a soft suede upper and clean design.'),
(8, 'YEEZY-500-BLUSH',        'Yeezy 500 Blush',                 'Adidas',      'Blush/Tan',                  200.00, 'Minimalist neutral tones on the chunky Yeezy 500 silhouette.'),
(3, 'AF1-LOW-BLACK',          'Air Force 1 Low Black',           'Nike',        'Black/Black',                 90.00, 'A sleek all-black version of the timeless Air Force 1 Low.'),
(1, 'AJ5-RETRO-GRAPE',        'Air Jordan 5 Retro Grape',        'Jordan',      'White/New Emerald/Purple',   210.00, 'A classic non-Bulls colorway that stands out with vibrant accents.'),
(4, 'AJ6-RETRO-INFRARED',     'Air Jordan 6 Retro Infrared',     'Jordan',      'Black/Infrared',             200.00, 'One of the most iconic Jordan 6 colorways worn by MJ.'),
(2, 'NMD-R1-CORE-BLACK',      'Adidas NMD R1 Core Black',        'Adidas',      'Black/White',                140.00, 'Modern streetwear staple with Boost comfort and sleek design.'),
(6, 'NB-990V5-GREY',          'New Balance 990v5 Grey',          'New Balance', 'Grey/Silver',                185.00, 'Premium comfort and heritage style in the iconic 990 series.'),
(8, 'DUNK-HIGH-CHAMPIONSHIP', 'Nike Dunk High Championship',     'Nike',        'Navy/White',                 125.00, 'Classic two-tone color blocking on the Dunk High silhouette.'),
(5, 'AJ13-RETRO-FLINT',       'Air Jordan 13 Retro Flint',       'Jordan',      'Flint Grey/White/Navy',      210.00, 'A fan-favorite retro featuring reflective mesh and premium suede.'),
(7, 'PUMA-FUTURE-RIDER',      'Puma Future Rider Play On',       'Puma',        'Grey/Green/Orange',           80.00, 'Lightweight sneaker with a retro running aesthetic and modern comfort.');

-- ============================================================
-- DROP EVENTS
-- ============================================================
INSERT INTO `drop_event` (`retailer_id`, `name`, `description`, `drop_start_at`, `drop_end_at`, `status`) VALUES
(4, 'SNKRS Chicago Day',        'Exclusive restock of the Air Jordan 1 Chicago on SNKRS.',           '2026-04-01 10:00:00', '2026-04-01 11:00:00', 'completed'),
(2, 'Yeezy Day 2026',           'Annual Yeezy Day restock event — multiple colorways dropping.',     '2026-04-05 09:00:00', '2026-04-05 18:00:00', 'upcoming'),
(1, 'Nike Dunk Week',           'A full week of Dunk Low releases across various colorways.',        '2026-04-10 10:00:00', '2026-04-17 23:59:00', 'upcoming'),
(3, 'Foot Locker Friday',       'Weekly Friday drop featuring exclusive Foot Locker releases.',      '2026-03-28 12:00:00', '2026-03-28 14:00:00', 'completed'),
(4, 'Jordan Brand Spring Drop', 'Spring lineup of Jordan Brand releases on SNKRS.',                  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 'upcoming'),
(7, 'Puma Classics Drop',       'Release of classic Puma silhouettes including Suede and CA Pro.',   '2026-04-08 10:00:00', '2026-04-08 12:00:00', 'upcoming'),
(6, 'New Balance 990 Series',   'Exclusive drop featuring multiple 990 series colorways.',           '2026-04-12 09:00:00', '2026-04-12 13:00:00', 'upcoming'),
(8, 'GOAT Flash Sale',          'Limited-time flash sale on rare and trending sneakers.',            '2026-04-03 15:00:00', '2026-04-03 18:00:00', 'upcoming'),
(5, 'StockX Market Movers',     'Top trending sneakers highlighted with special pricing events.',    '2026-04-06 11:00:00', '2026-04-06 16:00:00', 'upcoming'),
(2, 'Adidas Forum Revival',     'Tons of classic Adidas Forum models with new and OG colorways.',    '2026-03-30 10:00:00', '2026-03-30 14:00:00', 'completed');

-- ============================================================
-- AVAILABILITY SCHEDULE
-- ============================================================
INSERT INTO `availability_schedule` (`drop_id`, `retailer_id`, `product_id`, `available_from`, `available_to`, `qty_available`, `is_available`) VALUES
(1, 4, 1,  '2026-04-01 10:00:00', '2026-04-01 11:00:00', 500,  TRUE),
(2, 2, 3,  '2026-04-05 09:00:00', '2026-04-05 18:00:00', 1000, TRUE),
(2, 2, 4,  '2026-04-05 09:00:00', '2026-04-05 18:00:00', 800,  TRUE),
(3, 1, 5,  '2026-04-10 10:00:00', '2026-04-17 23:59:00', 2000, TRUE),
(4, 3, 6,  '2026-03-28 12:00:00', '2026-03-28 14:00:00', 300,  FALSE),
(5, 4, 7,  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 400,  TRUE),
(5, 4, 2,  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 350,  TRUE),
(5, 4, 10, '2026-04-15 10:00:00', '2026-04-15 12:00:00', 600,  TRUE);

-- ============================================================
-- REQUESTS
-- ============================================================
INSERT INTO `requests` (`user_id`, `schedule_id`, `request_status`) VALUES
(1, 1, 'approved'),
(2, 1, 'approved'),
(3, 1, 'pending'),
(4, 2, 'approved'),
(5, 2, 'pending'),
(6, 3, 'approved'),
(7, 4, 'denied'),
(8, 6, 'pending'),
(1, 7, 'approved'),
(2, 8, 'pending');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO `notification` (`user_id`, `schedule_id`, `notification_type`, `channel`) VALUES
(1, 1, 'drop_reminder',    'email'),
(2, 1, 'drop_reminder',    'sms'),
(3, 2, 'drop_live',        'push'),
(4, 2, 'drop_reminder',    'email'),
(5, 3, 'restock_alert',    'sms'),
(6, 4, 'drop_live',        'push'),
(7, 5, 'drop_reminder',    'email'),
(8, 6, 'drop_reminder',    'push'),
(1, 7, 'drop_live',        'email'),
(2, 8, 'restock_alert',    'sms');

-- ============================================================
-- PURCHASES
-- ============================================================
INSERT INTO `purchase` (`user_id`, `retailer_id`, `schedule_id`, `qty`, `total_amount`, `purchase_status`) VALUES
(1, 4, 1, 1, 180.00, 'delivered'),
(2, 4, 1, 1, 180.00, 'delivered'),
(4, 2, 2, 1, 220.00, 'shipped'),
(6, 1, 4, 1, 110.00, 'confirmed'),
(7, 3, 5, 1,  90.00, 'delivered'),
(1, 4, 6, 1, 200.00, 'pending'),
(3, 4, 7, 1, 210.00, 'confirmed'),
(5, 4, 8, 1, 220.00, 'pending');

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO `payment` (`purchase_id`, `amount`, `method`, `payment_status`, `transaction_id`) VALUES
(1, 180.00, 'credit_card', 'completed', 'TXN-001-AJ1-JORDAN'),
(2, 180.00, 'paypal',      'completed', 'TXN-002-AJ1-MAYA'),
(3, 220.00, 'apple_pay',   'completed', 'TXN-003-YEEZY-PRIYA'),
(4, 110.00, 'debit_card',  'completed', 'TXN-004-DUNK-SOPHIA'),
(5,  90.00, 'credit_card', 'completed', 'TXN-005-AF1-TYLER'),
(6, 200.00, 'google_pay',  'pending',   'TXN-006-AJ3-JORDAN'),
(7, 210.00, 'credit_card', 'completed', 'TXN-007-AJ4-DEVON'),
(8, 220.00, 'paypal',      'pending',   'TXN-008-AJ11-MARCUS');

-- ============================================================
-- FEEDBACK
-- ============================================================
INSERT INTO `feedback` (`user_id`, `product_id`, `purchase_id`, `text`) VALUES
(1, 1, 1, 'Absolute grails. Worth every penny — the quality on these is unmatched.'),
(2, 1, 2, 'Sizing runs a little small, go half a size up. But the shoe itself is perfect.'),
(4, 3, 3, 'Yeezy quality is always consistent. The Zebra colorway goes with everything.'),
(6, 5, 4, 'Clean shoe, great for everyday wear. The Panda is a classic for a reason.'),
(7, 6, 5, 'Can never go wrong with an all-white AF1. Timeless and comfortable.');

-- ============================================================
-- RATINGS
-- ============================================================
INSERT INTO `rating` (`user_id`, `product_id`, `purchase_id`, `stars`) VALUES
(1, 1, 1, 5),
(2, 1, 2, 4),
(4, 3, 3, 5),
(6, 5, 4, 5),
(7, 6, 5, 4);
