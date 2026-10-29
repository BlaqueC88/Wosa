import { env } from "../config/env.js";
import {
	buildParamString,
	formatAmount,
	signParamString,
} from "../services/payfast.js";
import { pool } from "./pool.js";

const args=process.argv.slice(2);
const [target,requestedStatus="COMPLETE"]=args.filter(
	(arg) => !arg.startsWith("--")
);
const tamperAmount=args.includes("--tamper-amount");
const badSignature=args.includes("--bad-signature");

if(!target) {
	console.error(
		"Usage: node db/simulate-payfast-itn.js <ORDER_ID|latest> [COMPLETE|CANCELLED|FAILED] [--tamper-amount] [--bad-signature]"
	);
	process.exit(1);
}

try {
	const result=
		target==="latest"
			? await pool.query(`
          SELECT id, order_number, total_cents
          FROM orders
          WHERE status = 'pending_payment'
          ORDER BY created_at DESC
          LIMIT 1
        `)
			:await pool.query(
				"SELECT id, order_number, total_cents FROM orders WHERE id::text = $1",
				[target]
			);

	const order=result.rows[0];

	if(!order) {
		console.error(
			"No matching order. Use an id from `node db/list-orders.js`, or the word latest for the newest unpaid order."
		);
		process.exit(1);
	}

	console.log(`Simulating ${requestedStatus} for order #${order.order_number}`);

	const gross=tamperAmount? "1.00":formatAmount(order.total_cents);
	const fee=(Number(gross)*0.032+2).toFixed(2);
	const net=(Number(gross)-Number(fee)).toFixed(2);

	const entries=[
		["m_payment_id",order.id],
		["pf_payment_id",String(9000000+order.order_number)],
		["payment_status",requestedStatus],
		["item_name",`Wosa order #${order.order_number}`],
		["item_description",""],
		["amount_gross",gross],
		["amount_fee",fee],
		["amount_net",net],
		["custom_str1",""],
		["name_first","Test"],
		["name_last","Customer"],
		["email_address","test@example.com"],
		["merchant_id",env.PAYFAST_MERCHANT_ID],
	];

	let signature=signParamString(
		buildParamString(entries,{ skipBlank: false })
	);

	if(badSignature) {
		signature=signature.slice(0,-1)+(signature.endsWith("0")? "1":"0");
	}

	const response=await fetch(
		`http://localhost:${env.PORT}/api/payments/payfast/notify`,
		{
			method: "POST",
			body: new URLSearchParams([...entries,["signature",signature]]),
		}
	);

	console.log(`Server answered ${response.status}`);
} finally {
	await pool.end();
}