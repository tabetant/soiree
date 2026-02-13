-- ============================================================
-- 005_insert_dummy_venues.sql
-- Comprehensive dummy data for Toronto nightlife venues
-- ============================================================

-- Clear previous sample data (safe for dev)
DELETE FROM loyalty_tasks;
DELETE FROM venues;

-- ═══════════════════════════════════════════════════════════
-- 18 Toronto Venues — mixed across neighborhoods and types
-- IDs are auto-generated UUIDs; we use name lookups for FK refs
-- ═══════════════════════════════════════════════════════════

INSERT INTO venues (
  name, address, latitude, longitude, venue_type,
  music_types, vibes, age_range_min, age_range_max,
  dress_code, current_density, hours, gallery_images, gender_ratio
) VALUES

-- ── Entertainment District ──────────────────────────────
('Rebel Nightclub', '11 Polson St, Toronto', 43.6396, -79.3547,
 'soiree_night',
 ARRAY['EDM', 'House', 'Techno'],
 ARRAY['High Energy', 'Party'],
 19, 35, 'Smart Casual', 82,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"10PM-2AM","friday":"10PM-3AM","saturday":"10PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #6366f1, #8b5cf6)',
   'linear-gradient(135deg, #7c3aed, #a855f7)',
   'linear-gradient(135deg, #4f46e5, #6366f1)'
 ],
 '{"male":58,"female":42}'::jsonb),

('CUBE Nightclub', '314 Queen St W, Toronto', 43.6498, -79.3938,
 'soiree_night',
 ARRAY['Hip-Hop', 'R&B', 'Reggaeton'],
 ARRAY['High Energy', 'Party', 'Upscale'],
 19, 30, 'Upscale', 88,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"Closed","friday":"10PM-3AM","saturday":"10PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #ec4899, #f43f5e)',
   'linear-gradient(135deg, #f43f5e, #ef4444)',
   'linear-gradient(135deg, #db2777, #ec4899)'
 ],
 '{"male":55,"female":45}'::jsonb),

('EL MOCAMBO', '464 Spadina Ave, Toronto', 43.6572, -79.4008,
 'soiree_event',
 ARRAY['Indie', 'Rock', 'Alternative'],
 ARRAY['Intimate', 'Chill'],
 19, 99, 'No Dress Code', 45,
 '{"monday":"Closed","tuesday":"7PM-12AM","wednesday":"7PM-12AM","thursday":"7PM-1AM","friday":"7PM-2AM","saturday":"7PM-2AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #f59e0b, #d97706)',
   'linear-gradient(135deg, #d97706, #b45309)',
   'linear-gradient(135deg, #fbbf24, #f59e0b)'
 ],
 '{"male":50,"female":50}'::jsonb),

('Toybox', '473 Adelaide St W, Toronto', 43.6453, -79.3985,
 'soiree_night',
 ARRAY['House', 'Techno', 'Disco'],
 ARRAY['Party', 'High Energy'],
 19, 32, 'Smart Casual', 75,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"10PM-2AM","friday":"10PM-3AM","saturday":"10PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #06b6d4, #0891b2)',
   'linear-gradient(135deg, #0891b2, #0e7490)',
   'linear-gradient(135deg, #22d3ee, #06b6d4)'
 ],
 '{"male":52,"female":48}'::jsonb),

-- ── King West ───────────────────────────────────────────
('Wildflower', '550 Wellington St W, Toronto', 43.6424, -79.4004,
 'soiree_night',
 ARRAY['R&B', 'Hip-Hop', 'Afrobeats'],
 ARRAY['Upscale', 'High Energy'],
 21, 35, 'Upscale', 90,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"10PM-2AM","friday":"10PM-3AM","saturday":"10PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #a855f7, #7c3aed)',
   'linear-gradient(135deg, #7c3aed, #6d28d9)',
   'linear-gradient(135deg, #c084fc, #a855f7)'
 ],
 '{"male":48,"female":52}'::jsonb),

('Lovechild Social House', '69 Bathurst St, Toronto', 43.6438, -79.4024,
 'soiree_night',
 ARRAY['Top 40', 'Hip-Hop', 'EDM'],
 ARRAY['Party', 'Casual'],
 19, 30, 'Smart Casual', 70,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"9PM-2AM","friday":"9PM-3AM","saturday":"9PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #10b981, #059669)',
   'linear-gradient(135deg, #059669, #047857)',
   'linear-gradient(135deg, #34d399, #10b981)'
 ],
 '{"male":55,"female":45}'::jsonb),

('EFS Toronto', '647 King St W, Toronto', 43.6432, -79.4050,
 'soiree_night',
 ARRAY['EDM', 'House', 'Pop'],
 ARRAY['Upscale', 'High Energy', 'Party'],
 21, 35, 'Upscale', 93,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"Closed","friday":"10PM-3AM","saturday":"10PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #f43f5e, #e11d48)',
   'linear-gradient(135deg, #e11d48, #be123c)',
   'linear-gradient(135deg, #fb7185, #f43f5e)'
 ],
 '{"male":50,"female":50}'::jsonb),

-- ── Ossington ───────────────────────────────────────────
('Bar Raval', '505 College St, Toronto', 43.6554, -79.4123,
 'ticker',
 ARRAY['Latin', 'Jazz'],
 ARRAY['Intimate', 'Chill', 'Upscale'],
 19, 45, 'No Dress Code', 55,
 '{"monday":"5PM-12AM","tuesday":"5PM-12AM","wednesday":"5PM-12AM","thursday":"5PM-1AM","friday":"5PM-2AM","saturday":"5PM-2AM","sunday":"5PM-11PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #f97316, #ea580c)',
   'linear-gradient(135deg, #ea580c, #c2410c)',
   'linear-gradient(135deg, #fb923c, #f97316)'
 ],
 '{"male":50,"female":50}'::jsonb),

('Get Well', '1181 Dundas St W, Toronto', 43.6530, -79.4228,
 'ticker',
 ARRAY['Indie', 'Alternative', 'Punk'],
 ARRAY['Chill', 'Casual'],
 19, 40, 'No Dress Code', 40,
 '{"monday":"5PM-2AM","tuesday":"5PM-2AM","wednesday":"5PM-2AM","thursday":"5PM-2AM","friday":"5PM-2AM","saturday":"2PM-2AM","sunday":"2PM-12AM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #84cc16, #65a30d)',
   'linear-gradient(135deg, #65a30d, #4d7c0f)',
   'linear-gradient(135deg, #a3e635, #84cc16)'
 ],
 '{"male":55,"female":45}'::jsonb),

('Bellwoods Brewery', '124 Ossington Ave, Toronto', 43.6479, -79.4193,
 'ticker',
 ARRAY['Indie', 'Pop'],
 ARRAY['Chill', 'Casual'],
 19, 50, 'No Dress Code', 62,
 '{"monday":"12PM-11PM","tuesday":"12PM-11PM","wednesday":"12PM-11PM","thursday":"12PM-12AM","friday":"12PM-1AM","saturday":"12PM-1AM","sunday":"12PM-10PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #eab308, #ca8a04)',
   'linear-gradient(135deg, #ca8a04, #a16207)',
   'linear-gradient(135deg, #facc15, #eab308)'
 ],
 '{"male":48,"female":52}'::jsonb),

-- ── Queen West ──────────────────────────────────────────
('The Drake Hotel', '1150 Queen St W, Toronto', 43.6427, -79.4261,
 'soiree_night',
 ARRAY['House', 'Disco', 'R&B'],
 ARRAY['Upscale', 'Intimate'],
 21, 40, 'Smart Casual', 65,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"7PM-1AM","thursday":"7PM-2AM","friday":"7PM-2AM","saturday":"7PM-2AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
   'linear-gradient(135deg, #7c3aed, #6d28d9)',
   'linear-gradient(135deg, #a78bfa, #8b5cf6)'
 ],
 '{"male":45,"female":55}'::jsonb),

('Horseshoe Tavern', '370 Queen St W, Toronto', 43.6493, -79.3955,
 'ticker',
 ARRAY['Rock', 'Indie', 'Alternative'],
 ARRAY['Casual', 'High Energy'],
 19, 50, 'No Dress Code', 58,
 '{"monday":"8PM-2AM","tuesday":"8PM-2AM","wednesday":"8PM-2AM","thursday":"8PM-2AM","friday":"8PM-2AM","saturday":"8PM-2AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #ef4444, #dc2626)',
   'linear-gradient(135deg, #dc2626, #b91c1c)',
   'linear-gradient(135deg, #f87171, #ef4444)'
 ],
 '{"male":60,"female":40}'::jsonb),

('The Gladstone', '1214 Queen St W, Toronto', 43.6415, -79.4301,
 'soiree_event',
 ARRAY['Jazz', 'Blues', 'Soul'],
 ARRAY['Intimate', 'Chill', 'Upscale'],
 19, 60, 'Smart Casual', 35,
 '{"monday":"Closed","tuesday":"6PM-12AM","wednesday":"6PM-12AM","thursday":"6PM-1AM","friday":"6PM-2AM","saturday":"6PM-2AM","sunday":"4PM-11PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #14b8a6, #0d9488)',
   'linear-gradient(135deg, #0d9488, #0f766e)',
   'linear-gradient(135deg, #2dd4bf, #14b8a6)'
 ],
 '{"male":45,"female":55}'::jsonb),

-- ── Distillery District ─────────────────────────────────
('Young Centre for the Performing Arts', '50 Tank House Ln, Toronto', 43.6507, -79.3586,
 'soiree_event',
 ARRAY['Classical', 'Jazz'],
 ARRAY['Upscale', 'Intimate'],
 19, 99, 'Upscale', 28,
 '{"monday":"Closed","tuesday":"7PM-11PM","wednesday":"7PM-11PM","thursday":"7PM-11PM","friday":"7PM-12AM","saturday":"7PM-12AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #6366f1, #4f46e5)',
   'linear-gradient(135deg, #4f46e5, #4338ca)',
   'linear-gradient(135deg, #818cf8, #6366f1)'
 ],
 '{"male":40,"female":60}'::jsonb),

('Mill Street Beer Hall', '21 Tank House Ln, Toronto', 43.6501, -79.3594,
 'ticker',
 ARRAY['Pop', 'Top 40'],
 ARRAY['Casual', 'Chill'],
 19, 50, 'No Dress Code', 60,
 '{"monday":"11AM-11PM","tuesday":"11AM-11PM","wednesday":"11AM-11PM","thursday":"11AM-12AM","friday":"11AM-1AM","saturday":"11AM-1AM","sunday":"11AM-10PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #d97706, #b45309)',
   'linear-gradient(135deg, #b45309, #92400e)',
   'linear-gradient(135deg, #fbbf24, #d97706)'
 ],
 '{"male":52,"female":48}'::jsonb),

-- ── Yorkville / Midtown ─────────────────────────────────
('Cabana Pool Bar', '11 Polson St, Toronto', 43.6402, -79.3540,
 'soiree_event',
 ARRAY['EDM', 'House', 'Reggaeton'],
 ARRAY['High Energy', 'Party', 'Upscale'],
 19, 30, 'Smart Casual', 85,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"Closed","friday":"12PM-10PM","saturday":"12PM-10PM","sunday":"12PM-8PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #0ea5e9, #0284c7)',
   'linear-gradient(135deg, #0284c7, #0369a1)',
   'linear-gradient(135deg, #38bdf8, #0ea5e9)'
 ],
 '{"male":50,"female":50}'::jsonb),

('Lavelle', '627 King St W, Toronto', 43.6441, -79.4038,
 'soiree_night',
 ARRAY['House', 'R&B', 'Pop'],
 ARRAY['Upscale', 'High Energy'],
 21, 35, 'Upscale', 78,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"5PM-2AM","friday":"5PM-3AM","saturday":"5PM-3AM","sunday":"12PM-10PM"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #ec4899, #d946ef)',
   'linear-gradient(135deg, #d946ef, #a855f7)',
   'linear-gradient(135deg, #f472b6, #ec4899)'
 ],
 '{"male":45,"female":55}'::jsonb),

('The Gold Hawk', '226 Ossington Ave, Toronto', 43.6490, -79.4205,
 'soiree_night',
 ARRAY['Hip-Hop', 'R&B', 'Afrobeats'],
 ARRAY['Party', 'High Energy'],
 19, 32, 'Smart Casual', 80,
 '{"monday":"Closed","tuesday":"Closed","wednesday":"Closed","thursday":"9PM-2AM","friday":"9PM-3AM","saturday":"9PM-3AM","sunday":"Closed"}'::jsonb,
 ARRAY[
   'linear-gradient(135deg, #f59e0b, #ef4444)',
   'linear-gradient(135deg, #ef4444, #dc2626)',
   'linear-gradient(135deg, #fbbf24, #f59e0b)'
 ],
 '{"male":50,"female":50}'::jsonb);

-- ═══════════════════════════════════════════════════════════
-- Loyalty Tasks for Soirée partner venues
-- Use subqueries to look up auto-generated UUIDs by name
-- ═══════════════════════════════════════════════════════════

INSERT INTO loyalty_tasks (venue_id, task_description, reward_description, xp_value) VALUES
-- Rebel Nightclub
((SELECT id FROM venues WHERE name = 'Rebel Nightclub'), 'Check in before 11 PM', '50% off first 2 drinks', 25),
((SELECT id FROM venues WHERE name = 'Rebel Nightclub'), 'Visit 3 Fridays in a row', 'VIP skip-the-line pass', 75),

-- CUBE Nightclub
((SELECT id FROM venues WHERE name = 'CUBE Nightclub'), 'Share a post from CUBE', 'Free coat check', 15),
((SELECT id FROM venues WHERE name = 'CUBE Nightclub'), 'Check in with 3+ friends', 'Bottle service 20% off', 50),

-- Wildflower
((SELECT id FROM venues WHERE name = 'Wildflower'), 'Post a Story from Wildflower', 'Complimentary appetizer', 20),
((SELECT id FROM venues WHERE name = 'Wildflower'), 'Visit on a Thursday', '2-for-1 cocktails', 30),

-- EFS Toronto
((SELECT id FROM venues WHERE name = 'EFS Toronto'), 'Check in before midnight', 'Priority entry next visit', 25),
((SELECT id FROM venues WHERE name = 'EFS Toronto'), 'Achieve Level 5', 'VIP section access', 100),

-- Toybox
((SELECT id FROM venues WHERE name = 'Toybox'), 'First time check-in', 'Welcome shot on the house', 10),
((SELECT id FROM venues WHERE name = 'Toybox'), 'Visit 5 times total', 'Guest list for 2', 60),

-- Lovechild Social House
((SELECT id FROM venues WHERE name = 'Lovechild Social House'), 'Check in on a weeknight', 'Happy hour pricing all night', 20),
((SELECT id FROM venues WHERE name = 'Lovechild Social House'), 'Like 5 posts from this venue', 'Free dessert', 15),

-- Drake Hotel
((SELECT id FROM venues WHERE name = 'The Drake Hotel'), 'Post from the rooftop', 'Complimentary drink', 20),
((SELECT id FROM venues WHERE name = 'The Drake Hotel'), 'Visit 3 different nights', 'Brunch for 2 discount', 45),

-- Lavelle
((SELECT id FROM venues WHERE name = 'Lavelle'), 'Check in before sunset', 'Pool access next visit', 25),
((SELECT id FROM venues WHERE name = 'Lavelle'), 'Share location to story', 'Complimentary valet', 30),

-- Gold Hawk
((SELECT id FROM venues WHERE name = 'The Gold Hawk'), 'First time visitor', 'Welcome cocktail', 15),
((SELECT id FROM venues WHERE name = 'The Gold Hawk'), 'Check in 3 weekends', 'Guest list + skip the line', 50);
