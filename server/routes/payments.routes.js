import { Router } from "express";

import { handlePayfastNotification } from "../controllers/payments.controller.js";

const router=Router();

router.post("/payfast/notify",handlePayfastNotification);

export default router;