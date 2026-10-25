CREATE TABLE option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE option_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  price_adjustment_cents INTEGER NOT NULL DEFAULT 0
    CHECK (price_adjustment_cents >= 0),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (group_id, code)
);

-- A group can have at most one default choice.
CREATE UNIQUE INDEX option_choices_one_default_per_group
  ON option_choices (group_id)
  WHERE is_default;

CREATE TABLE menu_item_option_groups (
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_item_id, option_group_id)
);

INSERT INTO option_groups (code, name, required) VALUES
  ('doneness', 'How would you like it cooked?', TRUE),
  ('side', 'Choose a side', TRUE),
  ('side-chips-included', 'Your side (chips included)', TRUE),
  ('sauce', 'Add a sauce', FALSE);

INSERT INTO option_choices (
  group_id, code, name, price_adjustment_cents, is_default, sort_order
)
SELECT g.id, c.code, c.name, c.price, c.is_default, c.sort_order
FROM (VALUES
  ('doneness', 'rare', 'Rare', 0, FALSE, 1),
  ('doneness', 'medium-rare', 'Medium Rare', 0, FALSE, 2),
  ('doneness', 'medium', 'Medium', 0, TRUE, 3),
  ('doneness', 'medium-well', 'Medium Well', 0, FALSE, 4),
  ('doneness', 'well-done', 'Well Done', 0, FALSE, 5),

  ('side', 'chips', 'Seasoned Chips', 0, TRUE, 1),
  ('side', 'mash', 'Creamy Mash', 1000, FALSE, 2),
  ('side', 'vegetables', 'Grilled Vegetables', 2000, FALSE, 3),
  ('side', 'side-salad', 'Side Salad', 1500, FALSE, 4),

  ('side-chips-included', 'chips', 'Golden Chips (included)', 0, TRUE, 1),
  ('side-chips-included', 'mash', 'Creamy Mash', 1000, FALSE, 2),
  ('side-chips-included', 'vegetables', 'Grilled Vegetables', 2000, FALSE, 3),
  ('side-chips-included', 'side-salad', 'Side Salad', 1500, FALSE, 4),

  ('sauce', 'no-sauce', 'No sauce', 0, TRUE, 1),
  ('sauce', 'pepper-sauce', 'Pepper Sauce', 2000, FALSE, 2),
  ('sauce', 'mushroom-sauce', 'Mushroom Sauce', 2000, FALSE, 3),
  ('sauce', 'garlic-butter', 'Garlic Butter', 1500, FALSE, 4)
) AS c (group_code, code, name, price, is_default, sort_order)
JOIN option_groups g ON g.code = c.group_code;

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
JOIN option_groups g ON g.code = l.group_code;