import { Router } from "express";
import * as UserController from "../controller/UserController";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth } from "../middleware/auth";
const router = Router();

router.get("/", UserController.all);
router.post("/signup", validate(schema.userRegister), UserController.signup);
router.post("/login", validate(schema.userLogin), UserController.login);
router.get("/:id", UserController.one);
router.put("/update", verifyAuth, validate(schema.userUpdate), UserController.update);
router.get("/:id/posts", UserController.posts);

export default router;
