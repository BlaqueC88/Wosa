import { Router } from "express";

import {
	listOrders,
	updateOrderStatus,
} from "../controllers/admin-orders.controller.js";
import { requireAuth,requireRole } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { updateOrderStatusSchema } from "../validators/order.validator.js";

const router=Router();

router.use(requireAuth,requireRole("admin"));

router.get("/dashboard",async (req,res) => {
	res.json({
		message: "Welcome to the admin dashboard.",
		user: req.user,
	});
});

router.get("/orders",listOrders);

router.patch(
	"/orders/:id/status",
	validateBody(updateOrderStatusSchema),
	updateOrderStatus
);

export default router;