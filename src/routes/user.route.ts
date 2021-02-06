import passport from "passport";
import { Router } from "express";

import "../config/passport.config";
import * as schema from "../validator/schema";
import { validateParams, validateRequest } from "../validator/validator";
import * as UserController from "../controller/user.controller";
import { verifyAuth, verifyAuthorization } from "../middleware/auth";

const router = Router();

router.get("/", verifyAuth, verifyAuthorization, UserController.all);
router.post("/signup", validateRequest(schema.UserSignUpBody), UserController.signup);
router.post("/login", validateRequest(schema.UserLoginBody), UserController.login);
router.get("/auth/google/redirect", passport.authenticate("google", { session: false }), UserController.googleRedirect);
router.get("/auth/google", UserController.loginWithGoogle);
router.get("/:id", validateParams(schema.ParamId), UserController.one);
router.patch("/", verifyAuth, validateRequest(schema.UserUpdateBody), UserController.update);
router.get("/:id/posts", validateParams(schema.ParamId), UserController.posts);

export default router;
