import Joi from "joi";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";

async function loadDishes(dishIds) {
	const result=await pool.query(
		`
      SELECT id, name, image_url, price_cents, available
      FROM menu_items
      WHERE id = ANY($1::uuid[])
    `,
		[dishIds]
	);

	return new Map(result.rows.map((row) => [row.id,row]));
}

// dishId -> Map(groupCode -> { name, required, choices: Map(choiceCode -> {...}) })
async function loadOptionRules(dishIds) {
	const result=await pool.query(
		`
      SELECT
        mog.menu_item_id,
        g.code AS group_code,
        g.name AS group_name,
        g.required,
        c.code AS choice_code,
        c.name AS choice_name,
        c.price_adjustment_cents
      FROM menu_item_option_groups mog
      JOIN option_groups g ON g.id = mog.option_group_id
      JOIN option_choices c ON c.group_id = g.id
      WHERE mog.menu_item_id = ANY($1::uuid[])
      ORDER BY mog.sort_order, c.sort_order
    `,
		[dishIds]
	);

	const rules=new Map();

	for(const row of result.rows) {
		if(!rules.has(row.menu_item_id)) {
			rules.set(row.menu_item_id,new Map());
		}

		const groups=rules.get(row.menu_item_id);

		if(!groups.has(row.group_code)) {
			groups.set(row.group_code,{
				name: row.group_name,
				required: row.required,
				choices: new Map(),
			});
		}

		groups.get(row.group_code).choices.set(row.choice_code,{
			name: row.choice_name,
			priceCents: row.price_adjustment_cents,
		});
	}

	return rules;
}

function buildOrderLines(items,dishes,optionRules) {
	const lines=[];

	for(const item of items) {
		const dish=dishes.get(item.productId);

		if(!dish||!dish.available) {
			return { error: "A dish in your cart is no longer available." };
		}

		const groups=optionRules.get(dish.id)??new Map();
		const chosen=new Map();

		for(const option of item.selectedOptions) {
			const group=groups.get(option.groupId);

			if(!group) {
				return { error: `That option is not available for ${dish.name}.` };
			}

			if(chosen.has(option.groupId)) {
				return {
					error: `Choose only one option for "${group.name}" on ${dish.name}.`,
				};
			}

			const choice=group.choices.get(option.choiceId);

			if(!choice) {
				return {
					error: `That choice is not available for "${group.name}" on ${dish.name}.`,
				};
			}

			chosen.set(option.groupId,{ code: option.choiceId,...choice });
		}

		const selectedOptions=[];
		let optionsCents=0;

		for(const [groupCode,group] of groups) {
			const selected=chosen.get(groupCode);

			if(!selected) {
				if(group.required) {
					return { error: `Please choose "${group.name}" for ${dish.name}.` };
				}

				continue;
			}

			selectedOptions.push({
				groupId: groupCode,
				groupName: group.name,
				choiceId: selected.code,
				choiceName: selected.name,
				priceAdjustmentCents: selected.priceCents,
			});

			optionsCents+=selected.priceCents;
		}

		const unitPriceCents=dish.price_cents+optionsCents;

		lines.push({
			menuItemId: dish.id,
			name: dish.name,
			imageUrl: dish.image_url,
			basePriceCents: dish.price_cents,
			unitPriceCents,
			quantity: item.quantity,
			lineTotalCents: unitPriceCents*item.quantity,
			selectedOptions,
			specialInstructions: item.specialInstructions||null,
		});
	}

	return { lines };
}

export async function createOrder(req,res,next) {
	let client;

	try {
		const order=req.validatedBody;

		const dishIds=[...new Set(order.items.map((item) => item.productId))];

		const [dishes,optionRules]=await Promise.all([
			loadDishes(dishIds),
			loadOptionRules(dishIds),
		]);

		const { lines,error }=buildOrderLines(order.items,dishes,optionRules);

		if(error) {
			return res.status(400).json({ message: error });
		}

		const subtotalCents=lines.reduce(
			(total,line) => total+line.lineTotalCents,
			0
		);

		const deliveryFeeCents=
			order.fulfilmentType==="delivery"? env.DELIVERY_FEE_CENTS:0;

		const totalCents=subtotalCents+deliveryFeeCents;

		client=await pool.connect();
		await client.query("BEGIN");

		const orderResult=await client.query(
			`
        INSERT INTO orders (
          user_id, fulfilment_type, contact_name, contact_phone,
          delivery_address, delivery_suburb, delivery_city, delivery_notes,
          subtotal_cents, delivery_fee_cents, total_cents
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, order_number, status, fulfilment_type,
                  subtotal_cents, delivery_fee_cents, total_cents, created_at
      `,
			[
				req.user.id,
				order.fulfilmentType,
				order.contactName,
				order.contactPhone,
				order.deliveryAddress??null,
				order.deliverySuburb??null,
				order.deliveryCity??null,
				order.deliveryNotes||null,
				subtotalCents,
				deliveryFeeCents,
				totalCents,
			]
		);

		const saved=orderResult.rows[0];

		for(const line of lines) {
			await client.query(
				`
          INSERT INTO order_items (
            order_id, menu_item_id, item_name, item_image_url,
            base_price_cents, unit_price_cents, quantity, line_total_cents,
            selected_options, special_instructions
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
        `,
				[
					saved.id,
					line.menuItemId,
					line.name,
					line.imageUrl,
					line.basePriceCents,
					line.unitPriceCents,
					line.quantity,
					line.lineTotalCents,
					JSON.stringify(line.selectedOptions),
					line.specialInstructions,
				]
			);
		}

		await client.query("COMMIT");

		return res.status(201).json({
			message: "Order placed.",
			order: {
				id: saved.id,
				orderNumber: saved.order_number,
				status: saved.status,
				fulfilmentType: saved.fulfilment_type,
				subtotalCents: saved.subtotal_cents,
				deliveryFeeCents: saved.delivery_fee_cents,
				totalCents: saved.total_cents,
				createdAt: saved.created_at,
			},
		});
	} catch(error) {
		if(client) {
			await client.query("ROLLBACK").catch(() => { });
		}

		return next(error);
	} finally {
		client?.release();
	}
}

const orderIdSchema=Joi.string().guid().required();

export async function getOrder(req,res,next) {
	try {
		const { error,value: orderId }=orderIdSchema.validate(req.params.id);

		if(error) {
			return res.status(404).json({ message: "Order not found." });
		}

		const orderResult=await pool.query(
			`
        SELECT
          id, order_number, status, fulfilment_type,
          contact_name, contact_phone,
          delivery_address, delivery_suburb, delivery_city, delivery_notes,
          subtotal_cents, delivery_fee_cents, total_cents, created_at
        FROM orders
        WHERE id = $1 AND user_id = $2
      `,
			[orderId,req.user.id]
		);

		const order=orderResult.rows[0];

		if(!order) {
			return res.status(404).json({ message: "Order not found." });
		}

		const itemsResult=await pool.query(
			`
        SELECT
          item_name, item_image_url, unit_price_cents, quantity,
          line_total_cents, selected_options, special_instructions
        FROM order_items
        WHERE order_id = $1
        ORDER BY item_name, unit_price_cents
      `,
			[order.id]
		);

		res.set("Cache-Control","no-store");

		return res.status(200).json({
			order: {
				id: order.id,
				orderNumber: order.order_number,
				status: order.status,
				fulfilmentType: order.fulfilment_type,
				contactName: order.contact_name,
				contactPhone: order.contact_phone,
				deliveryAddress: order.delivery_address,
				deliverySuburb: order.delivery_suburb,
				deliveryCity: order.delivery_city,
				deliveryNotes: order.delivery_notes,
				subtotalCents: order.subtotal_cents,
				deliveryFeeCents: order.delivery_fee_cents,
				totalCents: order.total_cents,
				createdAt: order.created_at,
				items: itemsResult.rows.map((row) => ({
					name: row.item_name,
					imageUrl: row.item_image_url,
					unitPriceCents: row.unit_price_cents,
					quantity: row.quantity,
					lineTotalCents: row.line_total_cents,
					selectedOptions: row.selected_options,
					specialInstructions: row.special_instructions,
				})),
			},
		});
	} catch(error) {
		return next(error);
	}
}

export async function listMyOrders(req,res,next) {
	try {
		const ordersResult=await pool.query(
			`
        SELECT id, order_number, status, fulfilment_type, total_cents, created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
			[req.user.id]
		);

		const orderIds=ordersResult.rows.map((row) => row.id);

		const itemsResult=await pool.query(
			`
        SELECT order_id, item_name, quantity
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
				quantity: row.quantity,
			});
		}

		res.set("Cache-Control","no-store");

		return res.status(200).json({
			data: ordersResult.rows.map((row) => ({
				id: row.id,
				orderNumber: row.order_number,
				status: row.status,
				fulfilmentType: row.fulfilment_type,
				totalCents: row.total_cents,
				createdAt: row.created_at,
				items: itemsByOrder.get(row.id)??[],
			})),
		});
	} catch(error) {
		return next(error);
	}
}