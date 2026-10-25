import { Router } from "express";

import {
  me,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validateBody.js";

import {
  signinSchema,
  signupSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", validateBody(signupSchema), signup);

router.post("/signin", validateBody(signinSchema), signin);

router.post("/signout", signout);

router.get("/me", requireAuth, me);

export default router;