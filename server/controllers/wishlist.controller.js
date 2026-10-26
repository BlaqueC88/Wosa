import Joi from "joi";

import { pool } from "../db/pool.js";

const menuItemIdSchema=Joi.string().guid().required();

export async function listWishlist(req,res,next) {
	try {
		const result=await pool.query(
			`
        SELECT m.id, m.slug, m.name, m.price_cents, m.image_url, m.category
        FROM wishlist_items w
        JOIN menu_items m ON m.id = w.menu_item_id
        WHERE w.user_id = $1 AND m.available = TRUE
        ORDER BY w.created_at DESC
      `,
			[req.user.id]
		);

		res.set("Cache-Control","no-store");

		return res.status(200).json({
			data: result.rows.map((row) => ({
				id: row.id,
				slug: row.slug,
				name: row.name,
				priceCents: row.price_cents,
				imageUrl: row.image_url,
				category: row.category,
			})),
		});
	} catch(error) {
		return next(error);
	}
}

export async function addToWishlist(req,res,next) {
	try {
		const { error,value: menuItemId }=menuItemIdSchema.validate(
			req.params.menuItemId
		);

		if(error) {
			return res.status(404).json({ message: "Dish not found." });
		}

		const dish=await pool.query(
			"SELECT id FROM menu_items WHERE id = $1 AND available = TRUE",
			[menuItemId]
		);

		if(dish.rowCount===0) {
			return res.status(404).json({ message: "Dish not found." });
		}

		await pool.query(
			`
        INSERT INTO wishlist_items (user_id, menu_item_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
			[req.user.id,menuItemId]
		);

		return res.status(204).end();
	} catch(error) {
		return next(error);
	}
}

export async function removeFromWishlist(req,res,next) {
	try {
		const { error,value: menuItemId }=menuItemIdSchema.validate(
			req.params.menuItemId
		);

		if(error) {
			return res.status(404).json({ message: "Dish not found." });
		}

		await pool.query(
			"DELETE FROM wishlist_items WHERE user_id = $1 AND menu_item_id = $2",
			[req.user.id,menuItemId]
		);

		return res.status(204).end();
	} catch(error) {
		return next(error);
	}
}