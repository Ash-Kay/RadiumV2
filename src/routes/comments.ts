import { Router } from "express";
import * as CommentController from "../controller/CommentController";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth } from "../middleware/auth";
const router = Router();

router.delete("/:id", verifyAuth, CommentController.remove);

export default router;
