import { pool } from "./pool.js";

const action=process.argv[2];

// The schema name is a fixed constant, never user input. SQL names (unlike
// values) cannot be passed as $1 placeholders.
const schema="wosa_scratch";

try {
	if(action==="create") {
		await pool.query(`CREATE SCHEMA ${schema}`);
		console.log(`Created schema ${schema}`);
	} else if(action==="drop") {
		await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
		console.log(`Dropped schema ${schema}`);
	} else if(action==="check") {
		const counts=await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM menu_items) AS dishes,
        (SELECT COUNT(*) FROM menu_items WHERE category = 'steaks') AS steaks,
        (SELECT COUNT(*) FROM option_groups) AS option_groups,
        (SELECT COUNT(*) FROM option_choices) AS option_choices,
        (SELECT COUNT(*) FROM menu_item_option_groups) AS attachments,
        (SELECT COUNT(*) FROM schema_migrations) AS migrations
    `);

		console.table(counts.rows);
	} else {
		console.log("Usage: node db/scratch-schema.js create|check|drop");
	}
} finally {
	await pool.end();
}