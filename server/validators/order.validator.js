import Joi from "joi";

const selectedOptionSchema=Joi.object({
	groupId: Joi.string().trim().max(60).required(),
	choiceId: Joi.string().trim().max(60).required(),
});

const orderItemSchema=Joi.object({
	productId: Joi.string().lowercase().guid().required(),
	quantity: Joi.number().integer().min(1).max(20).required(),
	selectedOptions: Joi.array().items(selectedOptionSchema).max(20).default([]),
	specialInstructions: Joi.string().trim().allow("").max(300).default(""),
});

// These fields only apply to delivery orders. For collection, drop them.
function deliveryOnly(schema) {
	return Joi.any().when("fulfilmentType",{
		is: "delivery",
		then: schema,
		otherwise: Joi.any().strip(),
	});
}

export const createOrderSchema=Joi.object({
	fulfilmentType: Joi.string()
		.valid("delivery","collection")
		.required()
		.label("Order type"),

	contactName: Joi.string().trim().min(2).max(100).required().label("Name"),

	contactPhone: Joi.string()
		.trim()
		.pattern(/^[+()\d\s-]{9,20}$/)
		.required()
		.label("Phone number")
		.messages({ "string.pattern.base": "Enter a valid phone number." }),

	deliveryAddress: deliveryOnly(
		Joi.string().trim().min(3).max(200).required().label("Delivery address")
	),
	deliverySuburb: deliveryOnly(
		Joi.string().trim().min(2).max(100).required().label("Suburb")
	),
	deliveryCity: deliveryOnly(
		Joi.string().trim().min(2).max(100).required().label("City")
	),
	deliveryNotes: deliveryOnly(
		Joi.string().trim().allow("").max(300).default("").label("Delivery notes")
	),

	items: Joi.array().items(orderItemSchema).min(1).max(50).required(),
});

export const updateOrderStatusSchema=Joi.object({
	status: Joi.string()
		.valid(
			"paid",
			"preparing",
			"out_for_delivery",
			"ready_for_collection",
			"completed",
			"cancelled"
		)
		.required(),
});