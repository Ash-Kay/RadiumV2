import { Router } from "express";
import * as UserController from "../controller/user.controller";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth, verifyAuthorization } from "../middleware/auth";
const router = Router();

router.get("/", verifyAuthorization, UserController.all);
router.post("/signup", validate(schema.userRegister), UserController.signup);
router.post("/login", validate(schema.userLogin), UserController.login);
router.get("/:id", UserController.one);
router.patch("/", verifyAuth, validate(schema.userUpdate), UserController.update);
router.get("/:id/posts", UserController.posts);

export default router;
