import "dotenv/config";
import Joi from "joi";

const schema=Joi.object({
	NODE_ENV: Joi.string()
		.valid("development","test","production")
		.default("development"),

	PORT: Joi.number().port().default(5000),

	DB_NAME: Joi.string().trim().required(),
	DB_USER: Joi.string().trim().required(),
	DB_PASSWORD: Joi.string().allow("").default(""),
	DB_HOST: Joi.string().trim().default("localhost"),
	DB_PORT: Joi.number().port().default(5432),
	DB_SOCKET_DIR: Joi.string().pattern(/^\//),

	CLIENT_ORIGIN: Joi.string()
		.uri({ scheme: ["http","https"] })
		.required(),

	SESSION_SECRET: Joi.string().min(32).required(),
	SESSION_NAME: Joi.string()
		.pattern(/^[A-Za-z0-9_-]+$/)
		.default("wosa_session"),
	COOKIE_SECURE: Joi.boolean().default(false),
	COOKIE_SAME_SITE: Joi.string().valid("lax","strict","none").default("lax"),

	BCRYPT_ROUNDS: Joi.number().integer().min(4).max(15).default(12),
	DELIVERY_FEE_CENTS: Joi.number().integer().min(0).default(3500),

	PUBLIC_API_URL: Joi.string()
		.uri({ scheme: ["http","https"] })
		.default("http://localhost:5000"),

	PAYFAST_SANDBOX: Joi.boolean().default(true),
	PAYFAST_MERCHANT_ID: Joi.string().allow("").default(""),
	PAYFAST_MERCHANT_KEY: Joi.string().allow("").default(""),
	PAYFAST_PASSPHRASE: Joi.string().allow("").default(""),
	PAYFAST_CHECK_SOURCE: Joi.boolean().default(true),
	PAYFAST_CONFIRM_WITH_PAYFAST: Joi.boolean().default(true),
}).unknown(true);

const { error,value }=schema.validate(process.env,{
	abortEarly: false,
});

if(error) {
	throw new Error(
		`Invalid environment configuration: ${error.details
			.map((detail) => detail.message)
			.join(", ")}`
	);
}

if(
	value.NODE_ENV==="production"&&
	(!value.PAYFAST_CHECK_SOURCE||!value.PAYFAST_CONFIRM_WITH_PAYFAST)
) {
	throw new Error(
		"In production, PAYFAST_CHECK_SOURCE and PAYFAST_CONFIRM_WITH_PAYFAST must stay true."
	);
}

export const env=value;