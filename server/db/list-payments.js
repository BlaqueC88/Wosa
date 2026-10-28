import { pool } from "./pool.js";

try {
	const result=await pool.query(`
    SELECT o.order_number, o.status AS order_status,
           p.provider_payment_id, p.status AS payment_status,
           p.amount_cents, p.created_at
    FROM payments p
    JOIN orders o ON o.id = p.order_id
    ORDER BY p.created_at DESC
    LIMIT 10
  `);

	console.table(result.rows);
} finally {
	await pool.end();
}