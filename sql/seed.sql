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
(3, 'NEW-BALANCE-550-WH',     'New Balance 550 White Green',     'New Balance', 'White/Green',                110.00, 'Retro basketball-inspired silhouette with a clean finish.'),
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
(7, 'PUMA-FUTURE-RIDER',      'Puma Future Rider Play On',       'Puma',        'Grey/Green/Orange',           80.00, 'Lightweight sneaker with a retro running aesthetic and modern comfort.'),
(1, 'DUNK-LOW-RETRO-EMERALD', 'Nike Dunk Low Retro Emerald',     'Nike',        'Emerald Rise/Hydrangeas/Yellow Pulse',   130.00,  'Vibrant colorway on a retro style Nike Dunk Low.');

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
(6, 'New Balance 990 Series',   'Exclusive drop featuring a hyped 990 series colorway.',             '2026-04-12 09:00:00', '2026-04-12 13:00:00', 'upcoming'),
(8, 'GOAT Flash Sale',          'Limited-time flash sale on rare and trending sneakers.',            '2026-04-03 15:00:00', '2026-04-03 18:00:00', 'upcoming'),
(5, 'StockX Market Movers',     'Top trending sneakers highlighted with special pricing events.',    '2026-04-06 11:00:00', '2026-04-06 16:00:00', 'upcoming'),
(2, 'Adidas Forum Revival',     'Tons of classic Adidas Forum models with new and OG colorways.',    '2026-03-30 10:00:00', '2026-03-30 14:00:00', 'completed');

-- ============================================================
-- AVAILABILITY SCHEDULE
-- ============================================================
INSERT INTO `availability_schedule` (`drop_id`, `retailer_id`, `product_id`, `available_from`, `available_to`, `qty_available`, `is_available`) VALUES
-- SNKRS Chicago Day
(1, 4, 1,  '2026-04-01 10:00:00', '2026-04-01 11:00:00', 500,  FALSE),
-- Yeezy Day 2026
(2, 2, 3,  '2026-04-05 09:00:00', '2026-04-05 18:00:00', 1000, TRUE),
(2, 2, 4,  '2026-04-05 09:00:00', '2026-04-05 18:00:00', 800,  TRUE),
(2, 2, 12, '2026-04-05 09:00:00', '2026-04-05 18:00:00', 600,  TRUE),
-- Nike Dunk Week
(3, 1, 5,  '2026-04-10 10:00:00', '2026-04-17 23:59:00', 2000, TRUE),
(3, 1, 21, '2026-04-11 10:00:00', '2026-04-13 23:59:00', 1500, TRUE),
(3, 1, 18, '2026-04-14 10:00:00', '2026-04-17 23:59:00', 1300, TRUE),
-- Foot Locker Friday
(4, 3, 6,  '2026-03-28 12:00:00', '2026-03-28 14:00:00', 300,  FALSE),
(4, 3, 9,  '2026-03-28 12:00:00', '2026-03-28 14:00:00', 300,  FALSE),
-- Jordan Brand Spring Drop
(5, 4, 7,  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 400,  TRUE),
(5, 4, 2,  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 350,  TRUE),
(5, 4, 10, '2026-04-15 10:00:00', '2026-04-15 12:00:00', 600,  TRUE),
(5, 4, 1,  '2026-04-15 10:00:00', '2026-04-15 12:00:00', 250,  TRUE),
(5, 4, 14, '2026-04-15 10:00:00', '2026-04-15 12:00:00', 300,  TRUE),
(5, 4, 15, '2026-04-15 10:00:00', '2026-04-15 12:00:00', 280,  TRUE),
-- Puma Classics Drop
(6, 7, 11, '2026-04-08 10:00:00', '2026-04-08 12:00:00', 300, TRUE),
(6, 7, 20, '2026-04-08 10:00:00', '2026-04-08 12:00:00', 250, TRUE),
-- New Balance 990 Series
(7, 6, 17, '2026-04-12 09:00:00', '2026-04-12 13:00:00', 400, TRUE),
-- GOAT Flash Sale
(8, 8, 11, '2026-04-03 15:00:00', '2026-04-03 18:00:00', 150, TRUE),
(8, 8, 12, '2026-04-03 15:00:00', '2026-04-03 18:00:00', 120, TRUE),
(8, 8, 13, '2026-04-03 15:00:00', '2026-04-03 18:00:00', 200, TRUE),
(8, 8, 6,  '2026-04-03 15:00:00', '2026-04-03 18:00:00', 625, TRUE),
-- StockX Market Movers
(9, 5, 1,  '2026-04-06 11:00:00', '2026-04-06 16:00:00', 180, TRUE),
(9, 5, 2,  '2026-04-06 11:00:00', '2026-04-06 16:00:00', 160, TRUE),
(9, 5, 19, '2026-04-06 11:00:00', '2026-04-06 16:00:00', 140, TRUE),
-- Adidas Forum Revival
(10, 2, 8, '2026-03-30 10:00:00', '2026-03-30 14:00:00', 350,  FALSE),
(10, 2, 16,'2026-03-30 10:00:00', '2026-03-30 14:00:00', 450,  FALSE);

-- ============================================================
-- REQUESTS
-- ============================================================
INSERT INTO `requests` (`user_id`, `schedule_id`, `request_status`) VALUES
(10, 1, 'denied'),
(11, 1, 'pending'),
(12, 2, 'approved'),
(14, 2, 'approved'),
(16, 3, 'approved'),
(17, 3, 'denied'),
(18, 4, 'approved'),
(21, 5, 'approved'),
(1, 5,  'pending'),
(2, 5,  'denied'),
(4, 6,  'denied'),
(5, 6,  'approved'),
(6, 7,  'pending'),
(7, 7,  'approved'),
(8, 7,  'denied'),
(10, 8, 'approved'),
(11, 8, 'pending'),
(12, 9, 'denied'),
(13, 9, 'approved'),
(15, 10, 'approved'),
(16, 10, 'denied'),
(18, 11, 'approved'),
(19, 11, 'approved'),
(20, 11, 'pending'),
(21, 12, 'denied'),
(1, 12, 'approved'),
(2, 12, 'pending'),
(4, 13, 'pending'),
(5, 13, 'denied'),
(6, 14, 'approved'),
(7, 14, 'approved'),
(8, 14, 'pending'),
(9, 15, 'denied'),
(11, 15, 'pending'),
(12, 16, 'approved'),
(14, 16, 'denied'),
(15, 17, 'approved'),
(17, 17, 'pending'),
(18, 18, 'denied'),
(19, 18, 'approved'),
(21, 19, 'approved'),
(1, 19, 'denied'),
(2, 19, 'pending'),
(3, 20, 'approved'),
(4, 20, 'approved'),
(6, 21, 'approved')
(7, 21, 'denied'),
(9, 22, 'approved'),
(10, 23, 'denied'),
(11, 23, 'approved'),
(12, 24, 'approved'),
(13, 24, 'pending'),
(15, 25, 'approved'),
(16, 26, 'pending'),
(18, 27, 'approved'),
(20, 27, 'denied'),

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO `notification` (`user_id`, `schedule_id`, `notification_type`, `channel`) VALUES
(10, 1, 'drop_live', 'sms'),
(11, 1, 'restock_alert', 'email'),
(12, 2, 'drop_reminder', 'email'),
(14, 2, 'restock_alert', 'sms'),
(16, 3, 'drop_live', 'push'),
(17, 3, 'restock_alert', 'email'),
(18, 4, 'drop_reminder', 'email'),
(21, 5, 'drop_reminder', 'push'),
(1, 5, 'drop_live', 'email'),
(2, 5, 'restock_alert', 'sms'),
(4, 6, 'drop_live', 'push'),
(5, 6, 'restock_alert', 'sms'),
(6, 7, 'drop_reminder', 'push'),
(7, 7, 'drop_live', 'email'),
(8, 7, 'restock_alert', 'sms'),
(10, 8, 'drop_live', 'push'),
(11, 8, 'restock_alert', 'sms'),
(12, 9, 'drop_reminder', 'sms'),
(13, 9, 'drop_live', 'email'),
(15, 10, 'drop_reminder', 'push'),
(16, 10, 'drop_live', 'sms'),
(18, 11, 'drop_reminder', 'email'),
(19, 11, 'drop_live', 'push'),
(20, 11, 'restock_alert', 'sms'),
(21, 12, 'drop_reminder', 'sms'),
(1, 12, 'drop_live', 'push'),
(2, 12, 'restock_alert', 'email'),
(4, 13, 'drop_live', 'email'),
(5, 13, 'restock_alert', 'sms'),
(6, 14, 'drop_reminder', 'email'),
(7, 14, 'drop_live', 'push'),
(8, 14, 'restock_alert', 'sms'),
(9, 15, 'drop_reminder', 'sms'),
(11, 15, 'restock_alert', 'push'),
(12, 16, 'drop_reminder', 'push'),
(14, 16, 'restock_alert', 'email'),
(15, 17, 'drop_reminder', 'email'),
(17, 17, 'restock_alert', 'sms'),
(18, 18, 'drop_reminder', 'sms'),
(19, 18, 'drop_live', 'email'),
(21, 19, 'drop_reminder', 'push'),
(1, 19, 'drop_live', 'sms'),
(2, 19, 'restock_alert', 'email'),
(3, 20, 'drop_reminder', 'email'),
(4, 20, 'drop_live', 'push'),
(6, 21, 'drop_reminder', 'sms'),
(7, 21, 'drop_live', 'email'),
(9, 22, 'restock_alert', 'email'),
(10, 23, 'drop_reminder', 'email'),
(11, 23, 'drop_live', 'sms'),
(12, 24, 'drop_reminder', 'push'),
(13, 24, 'restock_alert', 'sms'),
(15, 25, 'drop_live', 'push'),
(16, 26, 'drop_reminder', 'sms'),
(18, 27, 'drop_reminder', 'push'),
(20, 27, 'restock_alert', 'sms'),

-- ============================================================
-- PURCHASES
-- ============================================================
INSERT INTO `purchase` (`user_id`, `retailer_id`, `schedule_id`, `qty`, `total_amount`, `purchase_status`) VALUES
(1,  4,  1, 1, 180.00, 'delivered'),
(2,  4,  1, 1, 180.00, 'delivered'),
(4,  2,  2, 1, 220.00, 'shipped'),
(6,  2,  4, 1, 200.00, 'confirmed'),
(7,  1,  5, 1, 110.00, 'delivered'),
  
(1,  3,  6, 1, 200.00, 'pending'),
(3,  1,  7, 1, 130.00, 'confirmed'),
(5,  3,  8, 1,  90.00, 'pending'),
(8,  3,  9, 1, 110.00, 'delivered'),
(9,  4, 10, 1, 200.00, 'shipped'),
  
(10, 4, 11, 1, 210.00, 'delivered'),
(11, 4, 12, 1, 220.00, 'confirmed'),
(12, 2,  2, 1, 220.00, 'delivered'),
(13, 2,  3, 1, 300.00, 'shipped'),
(14, 1,  5, 1, 110.00, 'confirmed'),
  
(15, 1,  5, 1, 110.00, 'delivered'),
(16, 3,  8, 1,  90.00, 'pending'),
(17, 1,  7, 1, 130.00, 'delivered'),
(18, 1,  6, 1, 200.00, 'confirmed'),
(19, 3,  8, 1,  90.00, 'cancelled');

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO `payment` (`purchase_id`, `amount`, `method`, `payment_status`, `transaction_id`) VALUES
(1,  180.00,  'credit_card', 'completed', 'TXN-001-JORDAN'),
(2,  180.00,  'paypal',      'completed', 'TXN-002-MAYA'),
(3,  220.00,  'apple_pay',   'completed', 'TXN-003-PRIYA'),
(4,  200.00,  'debit_card',  'completed', 'TXN-004-SOPHIA'),
(5,  110.00,  'credit_card', 'completed', 'TXN-005-TYLER'),
(6,  200.00,  'google_pay',  'pending',   'TXN-006-JORDAN'),
(7,  130.00,  'credit_card', 'completed', 'TXN-007-DEVON'),
(8,   90.00,  'google_pay',  'completed', 'TXN-008-MARCUS'),
(9,  110.00,  'paypal',      'pending',   'TXN-009-AISHA'),
(10, 200.00,  'debit_card',  'pending',   'TXN-010-CHARLOTTE'),
(11, 210.00,  'apple_pay',   'completed', 'TXN-011-MARCUS'),
(12, 220.00,  'credit_card', 'completed', 'TXN-012-LILA'),
(13, 220.00,  'credit_card', 'completed', 'TXN-013-ZARA'),
(14, 300.00,  'paypal',      'completed', 'TXN-014-ETHAN'),
(15, 110.00,  'google_pay',  'pending',   'TXN-015-NAOMI'),
(16, 110.00,  'credit_card', 'completed', 'TXN-016-CALEB'),
(17,  90.00,  'debit_card',  'completed', 'TXN-017-ABIGAIL'),
(18, 130.00,  'paypal',      'pending',   'TXN-018-LUCAS'),
(19, 200.00,  'apple_pay',   'pending',   'TXN-019-ELIZA'),
(20,  90.00,  'credit_card', 'completed', 'TXN-020-TRISTAN');

-- ============================================================
-- FEEDBACK
-- ============================================================
INSERT INTO `feedback` (`user_id`, `product_id`, `purchase_id`, `text`) VALUES
(1, 1, 1, 'Absolute grails. Worth every penny — the quality on these is unmatched.'),
(2, 1, 2, 'Sizing runs a little small, go half a size up. But the shoe itself is perfect.'),
(7, 5, 5, 'Nike Dunk quality is always consistent. The Panda colorway goes with everything.'),
(8, 9, 9, 'Clean shoe, great for everyday wear. A green and white New Balance is a classic for a reason.'),
(10, 2, 11, 'The Thunder color is so distinct. I get complements everywhere I go!'),
(12, 3, 13, 'Super comfortable right out of the box. The materials feel premium and durable.'),
(15, 5, 16, 'Classic look that never goes out of style. Great value for the price.'),
(17, 18, 18, 'The new Dunk Highs definitely live up to the hype. Unique design and very comfy.');

-- ============================================================
-- RATINGS
-- ============================================================
INSERT INTO `rating` (`user_id`, `product_id`, `purchase_id`, `stars`) VALUES
(1, 1, 1, 5),
(2, 1, 2, 4),
(7, 5, 5, 5),
(8, 9, 9, 4),
(10, 2, 11, 5),
(12, 3, 13, 5),
(15, 5, 16, 4),
(17, 18, 18, 5);
