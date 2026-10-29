import Joi from "joi";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
	buildCheckout,
	confirmWithPayfast,
	getPayfastAddresses,
	isFromPayfast,
	isValidSignature,
} from "../services/payfast.js";

const orderIdSchema=Joi.string().guid().required();

const statusMap={
	COMPLETE: "complete",
	CANCELLED: "cancelled",
	FAILED: "failed",
	PENDING: "pending",
};

function reject(res,reason) {
	console.warn(`Payfast notification rejected: ${reason}`);

	return res.status(400).end();
}

// POST /api/orders/:id/pay  (signed-in customer, own order only)
export async function startPayfastPayment(req,res,next) {
	try {
		if(!env.PAYFAST_MERCHANT_ID||!env.PAYFAST_MERCHANT_KEY) {
			return res
				.status(503)
				.json({ message: "Online payments are not set up yet." });
		}

		const { error,value: orderId }=orderIdSchema.validate(req.params.id);

		if(error) {
			return res.status(404).json({ message: "Order not found." });
		}

		const result=await pool.query(
			`
        SELECT id, order_number, status, total_cents
        FROM orders
        WHERE id = $1 AND user_id = $2
      `,
			[orderId,req.user.id]
		);

		const order=result.rows[0];

		if(!order) {
			return res.status(404).json({ message: "Order not found." });
		}

		if(order.status!=="pending_payment") {
			return res
				.status(409)
				.json({ message: "This order is not waiting for payment." });
		}

		res.set("Cache-Control","no-store");

		return res.status(200).json(
			buildCheckout({
				orderId: order.id,
				orderNumber: order.order_number,
				totalCents: order.total_cents,
				name: req.user.name,
				email: req.user.email,
			})
		);
	} catch(error) {
		return next(error);
	}
}

// POST /api/payments/payfast/notify  (called by Payfast, not by a browser)
export async function handlePayfastNotification(req,res,next) {
	let client;

	try {
		const body=req.body??{};

		if(Object.values(body).some((value) => typeof value!=="string")) {
			return reject(res,"unexpected body format");
		}

		if(!isValidSignature(body)) {
			return reject(res,"bad signature");
		}

		if(body.merchant_id!==env.PAYFAST_MERCHANT_ID) {
			return reject(res,"wrong merchant");
		}

		const status=statusMap[body.payment_status];
		const { error,value: orderId }=orderIdSchema.validate(body.m_payment_id);
		const amountCents=Math.round(Number(body.amount_gross)*100);

		if(!status||error||!Number.isFinite(amountCents)) {
			return reject(res,"missing or invalid fields");
		}

		if(env.PAYFAST_CHECK_SOURCE&&!(await isFromPayfast(req.ip))) {
			const known=await getPayfastAddresses();

			return reject(
				res,
				`sender is not Payfast (ip ${req.ip}, forwarded ${req.headers["x-forwarded-for"]??"none"
				}, cf ${req.headers["cf-connecting-ip"]??"none"}, known: ${[...known].join(" ")||"none"
				})`
			);
		}

		if(
			env.PAYFAST_CONFIRM_WITH_PAYFAST&&
			!(await confirmWithPayfast(body))
		) {
			return reject(res,"Payfast did not confirm it");
		}

		client=await pool.connect();
		await client.query("BEGIN");

		const orderResult=await client.query(
			"SELECT id, total_cents FROM orders WHERE id = $1 FOR UPDATE",
			[orderId]
		);

		const order=orderResult.rows[0];

		if(!order||order.total_cents!==amountCents) {
			await client.query("ROLLBACK");

			return reject(res,"unknown order or amount mismatch");
		}

		const { signature: _signature,...payload }=body;

		await client.query(
			`
        INSERT INTO payments (
          order_id, provider, provider_payment_id, status,
          amount_cents, raw_payload
        )
        VALUES ($1, 'payfast', $2, $3, $4, $5::jsonb)
        ON CONFLICT (provider, provider_payment_id)
        DO UPDATE SET status = EXCLUDED.status,
                      raw_payload = EXCLUDED.raw_payload
        WHERE payments.status <> 'complete'
      `,
			[
				orderId,
				body.pf_payment_id||null,
				status,
				amountCents,
				JSON.stringify(payload),
			]
		);

		if(status==="complete") {
			await client.query(
				`
          UPDATE orders
          SET status = 'paid', updated_at = NOW()
          WHERE id = $1 AND status = 'pending_payment'
        `,
				[orderId]
			);
		}

		await client.query("COMMIT");

		return res.status(200).end();
	} catch(error) {
		if(client) {
			await client.query("ROLLBACK").catch(() => { });
		}

		return next(error);
	} finally {
		client?.release();
	}
}