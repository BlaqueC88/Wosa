import crypto from "node:crypto";
import dns from "node:dns/promises";

import { env } from "../config/env.js";

const host=env.PAYFAST_SANDBOX? "sandbox.payfast.co.za":"www.payfast.co.za";

export const PROCESS_URL=`https://${host}/eng/process`;
const VALIDATE_URL=`https://${host}/eng/query/validate`;

const ITN_HOSTS=[
	"www.payfast.co.za",
	"sandbox.payfast.co.za",
	"w1w.payfast.co.za",
	"w2w.payfast.co.za",
];

// Payfast signs values the way PHP's urlencode() writes them.
function encodeValue(value) {
	return encodeURIComponent(String(value))
		.replace(
			/[!'()*~]/g,
			(char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
		)
		.replace(/%20/g,"+");
}

export function buildParamString(entries,{ skipBlank }) {
	return entries
		.filter(
			([key,value]) =>
				key!=="signature"&&(!skipBlank||String(value).trim()!=="")
		)
		.map(([key,value]) => `${key}=${encodeValue(value)}`)
		.join("&");
}

export function signParamString(paramString) {
	const toSign=env.PAYFAST_PASSPHRASE
		? `${paramString}&passphrase=${encodeValue(env.PAYFAST_PASSPHRASE)}`
		:paramString;

	return crypto.createHash("md5").update(toSign).digest("hex");
}

export function formatAmount(cents) {
	return (cents/100).toFixed(2);
}

export function buildCheckout({ orderId,orderNumber,totalCents,name,email }) {
	const entries=[
		["merchant_id",env.PAYFAST_MERCHANT_ID],
		["merchant_key",env.PAYFAST_MERCHANT_KEY],
		["return_url",`${env.CLIENT_ORIGIN}/orders/${orderId}?payment=return`],
		["cancel_url",`${env.CLIENT_ORIGIN}/orders/${orderId}?payment=cancelled`],
		["notify_url",`${env.PUBLIC_API_URL}/api/payments/payfast/notify`],
		["name_first",String(name??"").trim().split(" ")[0]],
		["email_address",email],
		["m_payment_id",orderId],
		["amount",formatAmount(totalCents)],
		["item_name",`Wosa order #${orderNumber}`],
	]
		.map(([key,value]) => [key,String(value??"").trim()])
		.filter(([,value]) => value!=="");

	const signature=signParamString(buildParamString(entries,{ skipBlank: true }));

	return {
		url: PROCESS_URL,
		fields: [
			...entries.map(([name,value]) => ({ name,value })),
			{ name: "signature",value: signature },
		],
	};
}

export function isValidSignature(body) {
	const received=String(body.signature??"");

	if(!received) {
		return false;
	}

	const expected=signParamString(
		buildParamString(Object.entries(body),{ skipBlank: false })
	);

	const a=Buffer.from(received);
	const b=Buffer.from(expected);

	return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

export async function isFromPayfast(ip) {
	const allowed=new Set();

	for(const hostname of ITN_HOSTS) {
		try {
			const results=await dns.lookup(hostname,{ all: true });

			results.forEach((result) => allowed.add(result.address));
		} catch {
			// A host that does not resolve simply adds nothing.
		}
	}

	return allowed.has(String(ip??"").replace(/^::ffff:/,""));
}

export async function confirmWithPayfast(body) {
	const response=await fetch(VALIDATE_URL,{
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: buildParamString(Object.entries(body),{ skipBlank: false }),
	});

	return (await response.text()).trim()==="VALID";
}