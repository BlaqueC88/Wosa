import { pool } from "./pool.js";

async function show(title,sql) {
	console.log(`\n=== ${title} ===`);

	try {
		const result=await pool.query(sql);
		console.table(result.rows);
	} catch(error) {
		console.log("Could not read this:",error.message);
	}
}

try {
	await show(
		"Tables",
		`SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name`
	);

	await show(
		"users columns",
		`SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users'
     ORDER BY ordinal_position`
	);

	await show(
		"users per role",
		`SELECT role, COUNT(*) AS total FROM users GROUP BY role`
	);

	await show(
		"menu_items columns",
		`SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'menu_items'
     ORDER BY ordinal_position`
	);

	await show(
		"steaks in the database",
		`SELECT slug, image_url
     FROM menu_items
     WHERE category = 'steaks'
     ORDER BY slug`
	);

	await show(
		"option groups per dish",
		`SELECT m.slug, COUNT(mog.option_group_id) AS groups
	   FROM menu_items m
	   LEFT JOIN menu_item_option_groups mog ON mog.menu_item_id = m.id
	   WHERE m.category = 'steaks'
	   GROUP BY m.slug
	   ORDER BY m.slug`
	);
} finally {
	await pool.end();
}