import { Router } from "express";

import {
  getFeaturedMenuItems,
  getMenuItemByCategoryAndSlug,
  getMenuItemsByCategory,
} from "../controllers/menu.controller.js";

const router = Router();

router.get("/featured", getFeaturedMenuItems);

router.get("/", getMenuItemsByCategory);

router.get("/:category/:slug", getMenuItemByCategoryAndSlug);

export default router;