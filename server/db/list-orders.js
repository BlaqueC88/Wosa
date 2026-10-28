import { pool } from "./pool.js";

try {
	const orders=await pool.query(`
    SELECT id, order_number, status, fulfilment_type,
           subtotal_cents, delivery_fee_cents, total_cents, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 10
  `);

	console.table(orders.rows);
	console.log("Newest order id:",orders.rows[0]?.id??"none yet");

	const items=await pool.query(`
    SELECT o.order_number, i.item_name, i.quantity,
           i.unit_price_cents, i.line_total_cents, i.selected_options
    FROM order_items i
    JOIN orders o ON o.id = i.order_id
    ORDER BY o.created_at DESC
    LIMIT 20
  `);

	console.table(items.rows);
} finally {
	await pool.end();
}