import { Router } from "express";

import { env } from "../config/env.js";

import { createOrder,getOrder } from "../controllers/orders.controller.js";
import { startPayfastPayment } from "../controllers/payments.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validateBody.js";

import { createOrderSchema } from "../validators/order.validator.js";

const router=Router();

router.get("/delivery-fee",(_req,res) => {
	res.json({ deliveryFeeCents: env.DELIVERY_FEE_CENTS });
});

router.get("/:id",requireAuth,getOrder);

router.post("/",requireAuth,validateBody(createOrderSchema),createOrder);

router.post("/:id/pay",requireAuth,startPayfastPayment);

export default router;