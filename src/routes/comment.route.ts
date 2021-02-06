import { Router } from "express";

import * as schema from "../validator/schema";
import { verifyAuth } from "../middleware/auth";
import { validateParams, validateRequest } from "../validator/validator";
import * as CommentController from "../controller/comment.controller";

const router = Router();

router.get("/:id", validateParams(schema.ParamId), CommentController.one);
router.delete("/:id", verifyAuth, validateParams(schema.ParamId), CommentController.remove);
router.delete("/:id/permenent", verifyAuth, validateParams(schema.ParamId), CommentController.permenentRemove);
router.patch(
    ":/id",
    verifyAuth,
    validateParams(schema.ParamId),
    validateRequest(schema.UpdateCommentBody),
    CommentController.edit
);
router.get("/:id/vote", validateParams(schema.ParamId), CommentController.countVote);
router.post("/:id/upvote", validateParams(schema.ParamId), verifyAuth, CommentController.upvote);
router.post("/:id/downvote", validateParams(schema.ParamId), verifyAuth, CommentController.downvote);
router.delete("/:id/removevote", validateParams(schema.ParamId), verifyAuth, CommentController.removeVote);

export default router;
