import { Router } from "express";
import * as PostController from "../controller/post.controller";
import { validateRequest } from "../validator/validator";
import * as schema from "../validator/schema";
const router = Router();
import multer from "multer";
import { config } from "dotenv";
import { verifyAuth, verifyAuthorization, verifyOptionalAuth } from "../middleware/auth";
import crypto from "crypto";
config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        const re = /(?:\.([^.]+))?$/;
        const regRes = re.exec(file.originalname);

        if (regRes) {
            const ext = regRes[1];
            const radomFileName =
                crypto.createHash("MD5").update(crypto.pseudoRandomBytes(32)).digest("hex") + "." + ext;
            cb(null, radomFileName);
        } else {
            cb(new Error("Invalid File/ Invalid File Extension"), "");
        }
    },
});

const limits = {
    files: 1,
    fileSize: 52428800,
};

const fileFilter = (req, file, cb): void => {
    const allowedMimes = [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only jpg, png and gif image files are allowed."));
    }
};

// file size 50MB= 1024*1024*50 = 52428800
const upload = multer({ storage, limits, fileFilter });

router.post("/", verifyAuth, upload.single("file"), validateRequest(schema.createPost), PostController.create);
router.get("/", verifyOptionalAuth, PostController.feed);
router.get("/:id", verifyOptionalAuth, PostController.one);
router.get("/:id/vote", PostController.countVote);
router.delete("/:id", verifyAuth, PostController.remove);
router.delete("/:id/permenent", verifyAuth, verifyAuthorization, PostController.permenentRemove);
router.post("/:id/upvote", verifyAuth, PostController.upvote);
router.post("/:id/downvote", verifyAuth, PostController.downvote);
router.delete("/:id/removevote", verifyAuth, PostController.removeVote);
router.post(
    "/:id/comment",
    verifyAuth,
    upload.single("file"),
    validateRequest(schema.createComment),
    PostController.comment
);
router.get("/:id/comment", verifyOptionalAuth, PostController.allComments);

export default router;
