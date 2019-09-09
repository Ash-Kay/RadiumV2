import { Router } from "express";
import * as FactContoller from "../controller/FactController";
import { verifyAuth, verifyAuthorization } from "../middleware/auth";
import { validate } from "../validator/validator";
import { createFact } from "../validator/schema";
const router = Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads/facts/");
    },
    filename: function(req, file, cb) {
        cb(null, req.user.id + "-" + Date.now() + "." + file.originalname.split(".")[1]); //todo id
    }
});

// file size 2MB= 1024*1024*2 = ‭2097152‬
const upload = multer({
    storage,
    limits: {
        fileSize: 2097152
    }
});

router.get("/", FactContoller.all);
router.post("/", verifyAuth, verifyAuthorization, upload.single("file"), validate(createFact), FactContoller.create);

export default router;
