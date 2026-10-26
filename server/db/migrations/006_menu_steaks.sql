INSERT INTO menu_items (
  slug,
  name,
  description,
  category,
  price_cents,
  image_url,
  available,
  featured,
  prep_time_minutes
)
VALUES
  (
    'beef-medallions',
    'Beef Medallions',
    'Tender beef medallions, flame-grilled and served with your choice of side and sauce.',
    'steaks',
    23900,
    '/images/steaks/Beef_Medallions.jpg',
    TRUE,
    TRUE,
    25
  ),
  (
    'beef-tenderloin-crostini',
    'Beef Tenderloin Crostini',
    'Seared beef tenderloin served on crisp crostini with parmesan cream sauce.',
    'steaks',
    18900,
    '/images/steaks/Beef_Tenderloin_Crostini_with_Parmesan_Cream_Sauce.jpg',
    TRUE,
    FALSE,
    20
  ),
  (
    'garlic-butter-steak-tips-rigatoni',
    'Garlic Butter Steak Tips Rigatoni',
    'Juicy steak tips tossed with cheesy rigatoni in a rich garlic butter sauce.',
    'steaks',
    21900,
    '/images/steaks/Garlic_Butter_Steak_Tips_with_Cheesy_Rigatoni.jpeg',
    TRUE,
    TRUE,
    25
  ),
  (
    'herbert-tomahawk-steak',
    'Herb Tomahawk Steak',
    'A generous tomahawk steak grilled over high heat and finished with herb butter.',
    'steaks',
    39900,
    '/images/steaks/Herbert_Tomahawk_Steak.jpg',
    TRUE,
    TRUE,
    35
  ),
  (
    'lamb-chops',
    'Flame-Grilled Lamb Chops',
    'Succulent lamb chops grilled with aromatic herbs and served with your choice of side.',
    'steaks',
    27900,
    '/images/steaks/Lamb_Chops.jpeg',
    TRUE,
    FALSE,
    30
  ),
  (
    'mushroomed-sirloin-and-chips',
    'Mushroomed Sirloin and Chips',
    'Tender sirloin steak topped with mushroom sauce and served with golden chips.',
    'steaks',
    24900,
    '/images/steaks/Mushroomed_Sirloin_&_Chips.jpg',
    TRUE,
    TRUE,
    25
  ),
  (
    'ribeye-steak',
    '300g Flame-Grilled Ribeye',
    'Premium ribeye steak flame-grilled to your preference and served with a choice of side.',
    'steaks',
    26900,
    '/images/steaks/Ribeye_Steak.jpeg',
    TRUE,
    TRUE,
    25
  ),
  (
    'roast-beef-fillet',
    'Roast Beef Fillet',
    'Tender roast beef fillet, cooked with care and served with a rich savoury finish.',
    'steaks',
    28900,
    '/images/steaks/Roast_Beef_Fillet.jpg',
    TRUE,
    FALSE,
    30
  ),
  (
    'saucy-beef-chow-ho-fun',
    'Saucy Beef Chow Ho Fun',
    'Wok-tossed flat noodles with tender beef and a savoury house gravy.',
    'steaks',
    17900,
    '/images/steaks/Saucy_Beef_Chow_Ho_Fun_with_Gravy.jpeg',
    TRUE,
    FALSE,
    20
  ),
  (
    'steak-and-mushroom-sauce',
    'Steak with Mushroom Sauce',
    'Flame-grilled steak finished with creamy mushroom sauce and a satisfying side.',
    'steaks',
    23900,
    '/images/steaks/Steak_&_Mushroom_Source.jpg',
    TRUE,
    TRUE,
    25
  ),
  (
    'stuffed-beef-rolls',
    'Stuffed Beef Rolls',
    'Tender beef rolls filled with savoury ingredients and cooked in a flavourful sauce.',
    'steaks',
    20900,
    '/images/steaks/Stuffed_Beef_Rolls.jpeg',
    TRUE,
    FALSE,
    25
  ),
  (
    'tomahawk-steak',
    'Tomahawk Steak',
    'A bold, bone-in tomahawk steak grilled for deep flavour and a memorable meal.',
    'steaks',
    38900,
    '/images/steaks/Tomahawk_Steak.jpg',
    TRUE,
    TRUE,
    35
  ),
  (
    'tomahawk-chimichurri-hasselback-potatoes',
    'Tomahawk with Chimichurri',
    'Tomahawk steak with bright chimichurri sauce and crisp hasselback potatoes.',
    'steaks',
    41900,
    '/images/steaks/omahawk_chimichurri_and_hassleback_potatoes.jpeg',
    TRUE,
    TRUE,
    40
  ),
  (
    'tomahawk-steak-classic',
    'Classic Tomahawk Steak',
    'A premium tomahawk steak, seasoned simply and grilled to your preferred doneness.',
    'steaks',
    37900,
    '/images/steaks/tomahawk_steak_01.jpg',
    TRUE,
    FALSE,
    35
  )
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_cents = EXCLUDED.price_cents,
  image_url = EXCLUDED.image_url,
  available = EXCLUDED.available,
  featured = EXCLUDED.featured,
  prep_time_minutes = EXCLUDED.prep_time_minutes,
  updated_at = NOW();


INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, sort_order)
SELECT m.id, g.id, l.sort_order
FROM (VALUES
  ('beef-medallions', 'doneness', 1),
  ('beef-medallions', 'side', 2),
  ('beef-medallions', 'sauce', 3),
  ('ribeye-steak', 'doneness', 1),
  ('ribeye-steak', 'side', 2),
  ('ribeye-steak', 'sauce', 3),
  ('herbert-tomahawk-steak', 'doneness', 1),
  ('herbert-tomahawk-steak', 'side', 2),
  ('herbert-tomahawk-steak', 'sauce', 3),
  ('tomahawk-steak', 'doneness', 1),
  ('tomahawk-steak', 'side', 2),
  ('tomahawk-steak', 'sauce', 3),
  ('tomahawk-steak-classic', 'doneness', 1),
  ('tomahawk-steak-classic', 'side', 2),
  ('tomahawk-steak-classic', 'sauce', 3),
  ('roast-beef-fillet', 'doneness', 1),
  ('roast-beef-fillet', 'side', 2),
  ('roast-beef-fillet', 'sauce', 3),
  ('lamb-chops', 'doneness', 1),
  ('lamb-chops', 'side', 2),
  ('lamb-chops', 'sauce', 3),
  ('mushroomed-sirloin-and-chips', 'doneness', 1),
  ('mushroomed-sirloin-and-chips', 'side-chips-included', 2),
  ('steak-and-mushroom-sauce', 'doneness', 1),
  ('steak-and-mushroom-sauce', 'side', 2),
  ('stuffed-beef-rolls', 'side', 1),
  ('tomahawk-chimichurri-hasselback-potatoes', 'doneness', 1)
) AS l (item_slug, group_code, sort_order)
JOIN menu_items m ON m.slug = l.item_slug
JOIN option_groups g ON g.code = l.group_code
ON CONFLICT DO NOTHING;
