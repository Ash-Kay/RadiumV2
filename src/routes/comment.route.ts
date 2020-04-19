import { Router } from "express";
import * as CommentController from "../controller/comment.controller";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth } from "../middleware/auth";
const router = Router();

// router.get("/:id", CommentController.one);
// router.delete("/:id", verifyAuth, CommentController.remove);

export default router;
