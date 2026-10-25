import "dotenv/config";
import Joi from "joi";

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  PORT: Joi.number()
    .port()
    .default(5000),

  DB_USER: Joi.string()
    .trim()
    .required(),

  DB_PASSWORD: Joi.string()
    .required(),

  DB_NAME: Joi.string()
    .trim()
    .required(),

  DB_SOCKET_DIR: Joi.string()
    .pattern(/^\//)
    .required(),

  CLIENT_ORIGIN: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required(),

  JWT_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_EXPIRES_IN: Joi.string()
    .default("7d"),

  JWT_ISSUER: Joi.string()
    .trim()
    .default("gabz_meals-api"),

  JWT_AUDIENCE: Joi.string()
    .trim()
    .default("gabz_meals-client"),

  COOKIE_NAME: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .default("gabz_meals_session"),
}).unknown(true);

const { error, value } = schema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(
    `Invalid environment configuration: ${error.details
      .map((detail) => detail.message)
      .join(", ")}`
  );
}

export const env = value;