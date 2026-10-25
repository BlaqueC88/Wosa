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
    'ribeye-300g',
    '300g Flame-Grilled Ribeye',
    'Premium ribeye steak flame-grilled to your preference and served with a choice of side.',
    'steaks',
    24900,
    '/images/ribeye.jpg',
    TRUE,
    TRUE,
    25
  ),
	(
    'sirloin-250g',
    '250g Classic Sirloin',
    'Tender sirloin steak with signature seasoning and a side of your choice.',
    'steaks',
    18900,
    '/images/sirloin.jpg',
    TRUE,
    TRUE,
    20
  ),
  (
    't-bone-450g',
    '450g T-Bone Steak',
    'A steakhouse classic, flame-grilled for maximum flavour.',
    'steaks',
    29900,
    '/images/t-bone.jpg',
    TRUE,
    FALSE,
    30
  ),
  (
    'flame-grilled-chicken',
    'Flame-Grilled Chicken',
    'Half chicken basted with house sauce and served with seasoned chips.',
    'chicken',
    15900,
    '/images/chicken.jpg',
    TRUE,
    TRUE,
    25
  ),
  (
    'lemon-herb-fish',
    'Lemon Herb Fish',
    'Grilled fish fillet with lemon herb butter and fresh vegetables.',
    'fish',
    18900,
    '/images/fish.jpg',
    TRUE,
    TRUE,
    22
  ), 
	(
    'signature-surf-and-turf',
    'Signature Surf & Turf',
    'Flame-grilled steak, prawns, a rich sauce and your choice of side.',
    'surfnturf',
    32900,
    '/images/surfnturf.jpg',
    TRUE,
    TRUE,
    30
  ),
  (
    'garden-chicken-salad',
    'Garden Chicken Salad',
    'Crisp greens, grilled chicken, avocado and a house dressing.',
    'salads',
    12900,
    '/images/salad.jpg',
    TRUE,
    FALSE,
    15
  ),
  (
    'chocolate-lava-cake',
    'Chocolate Lava Cake',
    'Warm chocolate cake with a soft centre, served with ice cream.',
    'desserts',
    8900,
    '/images/dessert.jpg',
    TRUE,
    TRUE,
    12
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