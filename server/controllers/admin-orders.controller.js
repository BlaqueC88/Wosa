import Joi from "joi";

import { pool } from "../db/pool.js";

const orderIdSchema=Joi.string().guid().required();

function allowedNextStatuses(status,fulfilmentType) {
	switch(status) {
		case "pending_payment":
			return ["cancelled"];
		case "paid":
			return ["preparing","cancelled"];
		case "preparing":
			return [
				fulfilmentType==="delivery"
					? "out_for_delivery"
					:"ready_for_collection",
				"cancelled",
			];
		case "out_for_delivery":
		case "ready_for_collection":
			return ["completed"];
		default:
			return [];
	}
}

export async function listOrders(_req,res,next) {
	try {
		const ordersResult=await pool.query(`
      SELECT
        o.id, o.order_number, o.status, o.fulfilment_type,
        o.contact_name, o.contact_phone,
        o.delivery_address, o.delivery_suburb, o.delivery_city,
        o.delivery_notes,
        o.subtotal_cents, o.delivery_fee_cents, o.total_cents,
        o.created_at,
        u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

		const orderIds=ordersResult.rows.map((row) => row.id);

		const itemsResult=await pool.query(
			`
        SELECT
          order_id, item_name, item_image_url, unit_price_cents, quantity,
          line_total_cents, selected_options, special_instructions
        FROM order_items
        WHERE order_id = ANY($1::uuid[])
        ORDER BY item_name
      `,
			[orderIds]
		);

		const itemsByOrder=new Map();

		for(const row of itemsResult.rows) {
			if(!itemsByOrder.has(row.order_id)) {
				itemsByOrder.set(row.order_id,[]);
			}

			itemsByOrder.get(row.order_id).push({
				name: row.item_name,
				imageUrl: row.item_image_url,
				unitPriceCents: row.unit_price_cents,
				quantity: row.quantity,
				lineTotalCents: row.line_total_cents,
				selectedOptions: row.selected_options,
				specialInstructions: row.special_instructions,
			});
		}

		res.set("Cache-Control","no-store");

		return res.status(200).json({
			data: ordersResult.rows.map((row) => ({
				id: row.id,
				orderNumber: row.order_number,
				status: row.status,
				nextStatuses: allowedNextStatuses(row.status,row.fulfilment_type),
				fulfilmentType: row.fulfilment_type,
				customerEmail: row.customer_email,
				contactName: row.contact_name,
				contactPhone: row.contact_phone,
				deliveryAddress: row.delivery_address,
				deliverySuburb: row.delivery_suburb,
				deliveryCity: row.delivery_city,
				deliveryNotes: row.delivery_notes,
				subtotalCents: row.subtotal_cents,
				deliveryFeeCents: row.delivery_fee_cents,
				totalCents: row.total_cents,
				createdAt: row.created_at,
				items: itemsByOrder.get(row.id)??[],
			})),
		});
	} catch(error) {
		return next(error);
	}
}

export async function updateOrderStatus(req,res,next) {
	try {
		const { error,value: orderId }=orderIdSchema.validate(req.params.id);

		if(error) {
			return res.status(404).json({ message: "Order not found." });
		}

		const newStatus=req.validatedBody.status;

		const currentResult=await pool.query(
			"SELECT status, fulfilment_type FROM orders WHERE id = $1",
			[orderId]
		);

		const current=currentResult.rows[0];

		if(!current) {
			return res.status(404).json({ message: "Order not found." });
		}

		const allowed=allowedNextStatuses(
			current.status,
			current.fulfilment_type
		);

		if(!allowed.includes(newStatus)) {
			return res.status(409).json({
				message: `An order that is "${current.status}" cannot be changed to "${newStatus}".`,
			});
		}

		const updated=await pool.query(
			`
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND status = $3
        RETURNING id, order_number, status, fulfilment_type
      `,
			[newStatus,orderId,current.status]
		);

		if(updated.rowCount===0) {
			return res.status(409).json({
				message:
					"This order was just changed by someone else. Refresh and try again.",
			});
		}

		const row=updated.rows[0];

		return res.status(200).json({
			order: {
				id: row.id,
				orderNumber: row.order_number,
				status: row.status,
				nextStatuses: allowedNextStatuses(row.status,row.fulfilment_type),
			},
		});
	} catch(error) {
		return next(error);
	}
}