import { pool } from "./pool.js";

try {
	const result=await pool.query(
		`SELECT name, email, role, created_at
     FROM users
     ORDER BY created_at`
	);

	console.table(result.rows);
} finally {
	await pool.end();
}