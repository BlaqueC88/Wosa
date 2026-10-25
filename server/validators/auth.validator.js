import Joi from "joi";

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .max(254)
  .required()
  .messages({
    "string.empty": "Email address is required.",
    "string.email": "Enter a valid email address.",
    "string.max": "Email address is too long.",
    "any.required": "Email address is required.",
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .required()
  .messages({
    "string.empty": "Password is required.",
    "string.min": "Password must contain at least 8 characters.",
    "string.max": "Password must contain at most 72 characters.",
    "any.required": "Password is required.",
  });

export const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .custom((value) => value.replace(/\s+/g, " "))
    .required()
    .messages({
      "string.empty": "Name is required.",
      "string.min": "Name must contain at least 2 characters.",
      "string.max": "Name must contain at most 100 characters.",
      "any.required": "Name is required.",
    }),

  email: emailSchema,

  password: passwordSchema,

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "string.empty": "Please confirm your password.",
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your password.",
    }),
});

export const signinSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});
