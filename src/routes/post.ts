import { Router } from "express";
import * as PostController from "../controller/PostController";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
const router = Router();
const multer = require("multer");
import { verifyAuth } from "../middleware/auth";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, 1 + "-" + Date.now() + "." + file.originalname.split(".")[1]); //todo id
    }
});

// file size 50MB= 1024*1024*50 = 52428800
const upload = multer({
    storage,
    limits: {
        fileSize: 52428800
    }
});

router.post("/", verifyAuth, upload.single("file"), validate(schema.createPost), PostController.create);
router.get("/:id", PostController.one);
router.delete("/:id", verifyAuth, PostController.remove);
router.post("/:id/like", verifyAuth, PostController.like);
router.delete("/:id/unlike", verifyAuth, PostController.unlike);
router.post("/:id/comment", verifyAuth, upload.single("file"), validate(schema.createComment), PostController.comment);

export default router;
