import aws from "aws-sdk";
import multer from "multer";
import crypto from "crypto";
import { Router, Request } from "express";

import config from "../config/env.config";
import * as schema from "../validator/schema";
import { validateParams, validateRequest } from "../validator/validator";
import sharpS3Storage from "../utils/sharpS3StorageEngine";
import * as PostController from "../controller/post.controller";
import { verifyAuth, verifyAuthorization, verifyOptionalAuth } from "../middleware/auth";

const router = Router();

aws.config.update({
    secretAccessKey: config.aws.secrectAccessKey,
    accessKeyId: config.aws.accessKeyID,
    region: "ap-south-1",
});

const s3 = new aws.S3();

const storage = sharpS3Storage({
    s3,
    Bucket: config.aws.s3BucketName,
    ACL: "public-read",
    Key: (request: Request, file: Express.Multer.File, cb: (error?: Error, fielName?: string) => void) => {
        if (file.mimetype.startsWith("image")) {
            return cb(undefined, crypto.createHash("MD5").update(crypto.pseudoRandomBytes(32)).digest("hex") + ".webp");
        } else {
            const re = /(?:\.([^.]+))?$/;
            const regRes = re.exec(file.originalname);
            if (regRes) {
                const ext = regRes[1];
                const radomFileName =
                    crypto.createHash("MD5").update(crypto.pseudoRandomBytes(32)).digest("hex") + "." + ext;
                cb(undefined, radomFileName);
            } else {
                cb(new Error("Invalid File/ Invalid File Extension"));
            }
        }
    },
});

// file size 5MB= 1024*1024*5 = 5242880
const limits = {
    files: 1,
    fileSize: 5242880,
};

const fileFilter = (
    request: Request,
    file: Express.Multer.File,
    cb: (error?: Error, isSuccess?: boolean) => void
): void => {
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
        cb(undefined, true);
    } else {
        cb(new Error("Invalid file type. Only jpg, png and gif image files are allowed."));
    }
};

const upload = multer({ storage, limits, fileFilter });

router.post("/", verifyAuth, upload.single("file"), validateRequest(schema.CreatePostBody), PostController.create);
router.get("/", verifyOptionalAuth, PostController.feed);
router.get("/:id", verifyOptionalAuth, validateParams(schema.ParamId), PostController.one);
router.get("/:id/vote", validateParams(schema.ParamId), PostController.countVote);
router.delete("/:id", verifyAuth, validateParams(schema.ParamId), PostController.remove);
router.delete(
    "/:id/permenent",
    verifyAuth,
    verifyAuthorization,
    validateParams(schema.ParamId),
    PostController.permenentRemove
);
router.post("/:id/upvote", verifyAuth, validateParams(schema.ParamId), PostController.upvote);
router.post("/:id/downvote", verifyAuth, validateParams(schema.ParamId), PostController.downvote);
router.delete("/:id/removevote", verifyAuth, validateParams(schema.ParamId), PostController.removeVote);
router.post(
    "/:id/comment",
    verifyAuth,
    upload.single("file"),
    validateParams(schema.ParamId),
    validateRequest(schema.CreateCommentBody),
    PostController.comment
);
router.get("/:id/comment", verifyOptionalAuth, PostController.allComments);
router.get("/:id/tags", validateParams(schema.ParamId), PostController.allTags);

export default router;
