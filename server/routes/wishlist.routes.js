import { Router } from "express";

import {
	addToWishlist,
	listWishlist,
	removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router=Router();

router.use(requireAuth);

router.get("/",listWishlist);
router.put("/:menuItemId",addToWishlist);
router.delete("/:menuItemId",removeFromWishlist);

export default router;