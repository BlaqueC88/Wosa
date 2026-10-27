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

export const env=value;