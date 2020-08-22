import { Router } from "express";
import * as CommentController from "../controller/comment.controller";
import { validateRequest } from "../validator/validator";
import * as schema from "../validator/schema";
import { verifyAuth } from "../middleware/auth";
const router = Router();

router.get("/:id", CommentController.one);
router.delete("/:id", verifyAuth, CommentController.remove);
router.delete("/:id/permenent", verifyAuth, CommentController.permenentRemove);
router.patch(":/id", verifyAuth, validateRequest(schema.updateComment), CommentController.edit);
router.get("/:id/vote", CommentController.countVote);
router.post("/:id/upvote", verifyAuth, CommentController.upvote);
router.post("/:id/downvote", verifyAuth, CommentController.downvote);
router.delete("/:id/removevote", verifyAuth, CommentController.removeVote);

export default router;
