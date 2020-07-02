import { Router } from "express";
import * as UserController from "../controller/user.controller";
import { validateRequest } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth, verifyAuthorization } from "../middleware/auth";
import passport from "passport";
import "../config/passport.config";
const router = Router();

router.get("/", verifyAuth, verifyAuthorization, UserController.all);
router.post("/signup", validateRequest(schema.userRegister), UserController.signup);
router.post("/login", validateRequest(schema.userLogin), UserController.login);
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);
router.get("/auth/google/redirect", passport.authenticate("google", { session: false }), UserController.googleRedirect);
router.get("/auth/google/mobile", UserController.googleSignupMobile);
router.get("/:id", UserController.one);
router.patch("/", verifyAuth, validateRequest(schema.userUpdate), UserController.update);
router.get("/:id/posts", UserController.posts);

export default router;
