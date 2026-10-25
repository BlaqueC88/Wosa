import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", async (req, res) => {
  res.json({
    message: "Welcome to the admin dashboard.",
    user: req.user,
  });
});

export default router;