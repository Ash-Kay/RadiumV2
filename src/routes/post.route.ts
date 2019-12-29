import { Router } from "express";
import * as PostController from "../controller/post.controller";
import { validate } from "../validator/validator";
import * as schema from "../validator/schema";
const router = Router();
const multer = require("multer");
import { config } from "dotenv";
import { verifyAuth } from "../middleware/auth";
import * as crypto from "crypto";
config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        const radomFileName =
            crypto
                .createHash("MD5")
                .update(crypto.pseudoRandomBytes(32))
                .digest("hex") +
            "." +
            file.originalname.split(".")[1];
        cb(null, radomFileName);
    }
});

const limits = {
    files: 1,
    fileSize: 52428800
};

const fileFilter = (req, file, cb) => {
    var allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only jpg, png and gif image files are allowed."));
    }
};

// file size 50MB= 1024*1024*50 = 52428800
const upload = multer({
    storage,
    limits: limits,
    fileFilter: fileFilter
});

router.post("/", verifyAuth, upload.single("file"), validate(schema.createPost), PostController.create);
router.get("/", PostController.feed);
router.get("/:id", PostController.one);
router.delete("/:id", verifyAuth, PostController.remove);
router.post("/:id/like", verifyAuth, PostController.like);
router.delete("/:id/unlike", verifyAuth, PostController.unlike);
router.post("/:id/comment", verifyAuth, upload.single("file"), validate(schema.createComment), PostController.comment);
router.get("/:id/comment", PostController.getAllComm);

export default router;
