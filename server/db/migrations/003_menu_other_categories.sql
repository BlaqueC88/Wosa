-- No orders exist yet, so replacing the sample rows is safe.
-- Once orders exist, never delete dishes: mark them unavailable instead.
DELETE FROM menu_items
WHERE category IN ('chicken', 'fish', 'surfnturf', 'salads', 'desserts');

INSERT INTO option_groups (code, name, required) VALUES
  ('spice', 'Choose your spice level', FALSE),
  ('dressing', 'Choose a dressing', TRUE),
  ('extras', 'Add extras', FALSE);

INSERT INTO option_choices (
  group_id, code, name, price_adjustment_cents, is_default, sort_order
)
SELECT g.id, c.code, c.name, c.price, c.is_default, c.sort_order
FROM (VALUES
  ('spice', 'mild', 'Mild', 0, TRUE, 1),
  ('spice', 'medium', 'Medium', 0, FALSE, 2),
  ('spice', 'hot', 'Hot', 0, FALSE, 3),

  ('dressing', 'house', 'House vinaigrette', 0, TRUE, 1),
  ('dressing', 'ranch', 'Creamy ranch', 0, FALSE, 2),
  ('dressing', 'balsamic', 'Balsamic glaze', 0, FALSE, 3),
  ('dressing', 'lemon-oil', 'Lemon and olive oil', 0, FALSE, 4),

  ('extras', 'none', 'No extras', 0, TRUE, 1),
  ('extras', 'avocado', 'Extra avocado', 2000, FALSE, 2),
  ('extras', 'chicken', 'Grilled chicken', 3500, FALSE, 3),
  ('extras', 'prawns', 'Grilled prawns', 5500, FALSE, 4)
) AS c (group_code, code, name, price, is_default, sort_order)
JOIN option_groups g ON g.code = c.group_code;

INSERT INTO menu_items (
  slug, name, description, category, price_cents, image_url, featured,
  prep_time_minutes
) VALUES
  ('chicken-and-chorizo-paella', 'Chicken and Chorizo Paella', 'Saffron rice with tender chicken and smoky chorizo, served as a complete meal.', 'chicken', 17900, '/images/chicken/Chicken_And_Chorizo_Paella.jpeg', FALSE, 30),
  ('chicken-kabobs', 'Chicken Kabobs', 'Marinated chicken skewers grilled over the flame until juicy and lightly charred.', 'chicken', 15900, '/images/chicken/Chicken_Kabobs.jpg', TRUE, 25),
  ('spiced-coconut-basil-chicken', 'Spiced Coconut Basil Chicken with Rice', 'Chicken simmered in a fragrant coconut and basil sauce, served over steamed rice.', 'chicken', 16900, '/images/chicken/Spiced_Coconut_Basil_Chicken_with_Rice.jpeg', FALSE, 25),
  ('chicken-cabbage-stir-fry', 'Chicken Cabbage Stir-Fry', 'Chicken and crisp cabbage tossed in a savoury wok sauce.', 'chicken', 13900, '/images/chicken/Chicken_Cabbage_Stir-Fry.jpeg', FALSE, 20),
  ('buffalo-chicken-grilled-cheese-soup', 'Buffalo Chicken Grilled Cheese Soup', 'A creamy, spicy buffalo chicken soup topped with melted cheese.', 'chicken', 11900, '/images/chicken/Buffalo_Chicken_Grilled_Cheese_Soup.jpg', FALSE, 20),
  ('chicken-tenderloin', 'Flame-Grilled Chicken Tenderloin', 'Tender chicken strips flame-grilled and finished with house seasoning.', 'chicken', 14900, '/images/chicken/Chicken_Tenderloin.jpeg', TRUE, 25),
  ('chicken-ricotta-meatballs', 'Chicken Ricotta Meatballs', 'Soft chicken and ricotta meatballs in a creamy spinach alfredo sauce.', 'chicken', 15900, '/images/chicken/Chicken_Ricotta_Meatballs_in_Creamy_Spinach_Alfredo_Sauce.png', FALSE, 25),

  ('garlic-butter-salmon-and-shrimp', 'Garlic Butter Salmon and Shrimp', 'Pan-seared salmon and shrimp in garlic butter, served with asparagus.', 'fish', 22900, '/images/seafood/Garlic_Butter_Salmon_&_Shrimp_with_Asparagus.jpg', TRUE, 22),
  ('lemon-thyme-sea-bass', 'Lemon and Thyme Roasted Sea Bass', 'Sea bass roasted with lemon and fresh thyme until flaky and tender.', 'fish', 21900, '/images/seafood/Lemon_and_Thyme_Roasted_Sea_Bass.jpeg', TRUE, 25),
  ('red-snapper-shrimp-and-grits', 'Red Snapper, Shrimp and Grits', 'Red snapper and shrimp over creamy grits with a Cajun cream sauce.', 'fish', 21900, '/images/seafood/Red_Snapper,_Shrimp_&_Grits_with_a_Cajun_Cream_Sauce.jpeg', FALSE, 25),
  ('scallop-and-lobster-soup', 'Scallop and Lobster Soup', 'A rich, silky soup of tender scallops and lobster.', 'fish', 18900, '/images/seafood/Scallop_&_Lobster_Soup.jpg', FALSE, 20),
  ('spicy-garlic-shrimp', 'Spicy Garlic Shrimp', 'Juicy shrimp sauteed with garlic and chilli.', 'fish', 17900, '/images/seafood/Spicy_Garlic_Shrimp.jpeg', FALSE, 15),
  ('hake-and-spinach', 'Hake and Spinach', 'Tender hake fillet served on a bed of garlic spinach.', 'fish', 15900, '/images/seafood/Hake_&_Spinach.jpg', FALSE, 20),
  ('stuffed-salmon', 'Stuffed Salmon', 'Salmon fillet baked with a savoury filling.', 'fish', 21900, '/images/seafood/Stuffed_Salmon.jpg', FALSE, 25),
  ('blackened-salmon-with-naan', 'Blackened Salmon with Naan and Lime Slaw', 'Spice-crusted salmon with grilled naan and a fresh lime slaw.', 'fish', 22900, '/images/seafood/Blackened_Salmon_with_Grilled_Naan_and_Lime_Slaw.jpeg', FALSE, 22),

  ('steak-and-scallops-baked-potato', 'Steak and Scallops with Baked Potato', 'Grilled steak with seared scallops and a loaded baked potato.', 'surfnturf', 31900, '/images/surfnturf/Steak_&_Scallops_with_Baked_Potato.jpg', FALSE, 30),
  ('steak-and-shrimp', 'Steak and Shrimp', 'Flame-grilled steak paired with garlic shrimp.', 'surfnturf', 28900, '/images/surfnturf/Steak_&_Shrimp.jpg', TRUE, 30),
  ('steak-and-shrimp-fusilli', 'Steak and Shrimp on Fusilli Pasta', 'Sliced steak and shrimp tossed through fusilli in a creamy sauce.', 'surfnturf', 27900, '/images/surfnturf/Steak_&_Shripm_on_Fuslli_Pasta.jpg', FALSE, 30),
  ('surf-and-turf-alfredo', 'Surf and Turf Alfredo', 'Steak and seafood on pasta in a rich alfredo sauce.', 'surfnturf', 29900, '/images/surfnturf/Surf_&_Turf_Alfredo.jpg', FALSE, 30),
  ('surf-and-turf', 'Classic Surf and Turf', 'Flame-grilled steak and prawns, served with a rich sauce and your choice of side.', 'surfnturf', 32900, '/images/surfnturf/Surf_&_Turf.jpg', TRUE, 30),

  ('fresh-summer-salad', 'Fresh Summer Salad', 'Crisp seasonal vegetables and greens, light and refreshing.', 'salads', 8900, '/images/salads/Fresh_Summer_Salad.png', FALSE, 10),
  ('coleslaw', 'Creamy Coleslaw', 'Shredded cabbage and carrot in a creamy dressing.', 'salads', 5900, '/images/salads/Coleslaw.jpeg', FALSE, 5),
  ('egg-and-bacon-salad', 'Egg and Bacon Salad', 'Crisp greens topped with boiled egg and crunchy bacon.', 'salads', 9900, '/images/salads/Egg_&_Bacon_Salad.jpg', FALSE, 10),
  ('avocado-salad', 'Avocado Salad', 'Fresh greens with ripe avocado, tomato and cucumber.', 'salads', 10900, '/images/salads/Avocado_Salad.jpg', TRUE, 10),
  ('summer-garden-salad', 'Summer Garden Salad', 'A colourful mix of garden vegetables and fresh herbs.', 'salads', 8900, '/images/salads/Summer_Garden_Salad.jpeg', FALSE, 10),

  ('caramel-macchiato-cheesecake', 'Caramel Macchiato Cheesecake', 'Creamy coffee cheesecake finished with a caramel drizzle.', 'desserts', 8900, '/images/desserts/Caramel_Macchiato_Cheesecake.jpeg', FALSE, 10),
  ('spiced-apple-pecan-taquitos', 'Spiced Apple and Pecan Taquitos', 'Crisp pastry rolls filled with spiced apple and pecans.', 'desserts', 7900, '/images/desserts/Spiced_Apple_and_Pecan_Taquitos.jpeg', FALSE, 12),
  ('strawberry-cream-swiss-roll', 'Strawberry Cream Swiss Roll', 'Light sponge rolled with whipped cream and strawberries.', 'desserts', 7500, '/images/desserts/Strawberry_Cream_Swiss_Roll.jpeg', FALSE, 10),
  ('white-chocolate-bliss-cheesecake', 'White Chocolate Bliss Cheesecake', 'Smooth white chocolate cheesecake on a buttery biscuit base.', 'desserts', 8900, '/images/desserts/White_Chocolate_Bliss_Cheesecake.jpeg', TRUE, 10),
  ('lemon-dump-cakes', 'Lemon Dump Cakes', 'A warm, zesty lemon cake with a golden crust.', 'desserts', 6900, '/images/desserts/Lemon_Dump_Cakes.jpeg', FALSE, 12),
  ('blueberry-cream-cheese-egg-rolls', 'Blueberry Cream Cheese Egg Rolls', 'Crispy rolls filled with blueberries and sweet cream cheese.', 'desserts', 7900, '/images/desserts/Blueberry_Cream_Cheese_Egg_Rolls.jpeg', FALSE, 12);

INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, sort_order)
SELECT m.id, g.id, l.sort_order
FROM (VALUES
  ('chicken-kabobs', 'side', 1),
  ('chicken-kabobs', 'sauce', 2),
  ('chicken-kabobs', 'spice', 3),
  ('chicken-tenderloin', 'side', 1),
  ('chicken-tenderloin', 'sauce', 2),
  ('chicken-tenderloin', 'spice', 3),
  ('spiced-coconut-basil-chicken', 'spice', 1),
  ('chicken-cabbage-stir-fry', 'spice', 1),

  ('lemon-thyme-sea-bass', 'side', 1),
  ('spicy-garlic-shrimp', 'side', 1),
  ('spicy-garlic-shrimp', 'spice', 2),
  ('hake-and-spinach', 'side', 1),
  ('stuffed-salmon', 'side', 1),

  ('steak-and-shrimp', 'doneness', 1),
  ('steak-and-shrimp', 'side', 2),
  ('steak-and-shrimp', 'sauce', 3),
  ('surf-and-turf', 'doneness', 1),
  ('surf-and-turf', 'side', 2),
  ('surf-and-turf', 'sauce', 3),
  ('steak-and-scallops-baked-potato', 'doneness', 1),
  ('steak-and-shrimp-fusilli', 'doneness', 1),
  ('surf-and-turf-alfredo', 'doneness', 1),

  ('fresh-summer-salad', 'dressing', 1),
  ('fresh-summer-salad', 'extras', 2),
  ('avocado-salad', 'dressing', 1),
  ('avocado-salad', 'extras', 2),
  ('egg-and-bacon-salad', 'dressing', 1),
  ('egg-and-bacon-salad', 'extras', 2),
  ('summer-garden-salad', 'dressing', 1),
  ('summer-garden-salad', 'extras', 2)
) AS l (item_slug, group_code, sort_order)
JOIN menu_items m ON m.slug = l.item_slug
JOIN option_groups g ON g.code = l.group_code;